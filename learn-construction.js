function sanitizeNumericValue(value) {
    if (typeof value !== 'string') {
        return NaN;
    }
    const cleaned = value.replace(/[^0-9.]/g, '');
    if (cleaned.length === 0) {
        return NaN;
    }
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : NaN;
}

function getNumericInput(id) {
    const element = document.getElementById(id);
    if (!element) {
        return 0;
    }
    const value = sanitizeNumericValue(element.value);
    return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function formatCurrency(value) {
    return Number.isFinite(value)
        ? value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        : '$0';
}

function formatPercent(value) {
    if (!Number.isFinite(value)) {
        return '0%';
    }
    return `${(value * 100).toFixed(1)}%`;
}

function updateScenario() {
    const transactionTypeElement = document.getElementById('transaction-type');
    const transactionType = transactionTypeElement ? transactionTypeElement.value : 'purchase';
    const buildPrice = getNumericInput('build-price');
    const lotPrice = getNumericInput('lot-price');
    const lotValue = getNumericInput('lot-value');
    const existingLien = transactionType === 'refinance' ? getNumericInput('existing-lien') : 0;
    const closingCosts = getNumericInput('closing-costs');
    const lotContribution = transactionType === 'refinance' ? lotValue : lotPrice;
    const appraisalInput = getNumericInput('appraised-value');
    const loanAmount = getNumericInput('loan-amount');
    const interestRatePercent = getNumericInput('interest-rate');
    const drawProgressInput = document.getElementById('draw-progress');

    const acquisitionBasis = buildPrice + lotContribution;
    const projectCost = acquisitionBasis;
    const appraisalValue = appraisalInput > 0 ? appraisalInput : acquisitionBasis;
    const ltvBasis = Math.min(acquisitionBasis, appraisalValue);
    const maxLoan = ltvBasis * 0.9;
    const requestedLtv = ltvBasis > 0 ? loanAmount / ltvBasis : 0;

    const initialDisbursement = Math.max(loanAmount - buildPrice, 0);
    const constructionHoldback = Math.max(loanAmount - initialDisbursement, 0);

    const progress = drawProgressInput ? parseFloat(drawProgressInput.value) / 100 : 0;
    const normalizedProgress = Math.min(Math.max(progress, 0), 1);
    const disbursedHoldback = constructionHoldback * normalizedProgress;
    const totalDisbursed = Math.min(initialDisbursement + disbursedHoldback, loanAmount);
    const remainingHoldback = Math.max(constructionHoldback - disbursedHoldback, 0);

    const totalClosingRequirement = transactionType === 'refinance'
        ? existingLien + closingCosts
        : closingCosts;
    const closingShortfall = Math.max(totalClosingRequirement - initialDisbursement, 0);
    const cashOutExcess = transactionType === 'refinance'
        ? Math.max(initialDisbursement - (existingLien + closingCosts), 0)
        : 0;

    const interestRate = interestRatePercent / 100;
    const monthlyInterestOnly = interestRate > 0 ? (totalDisbursed * interestRate) / 12 : null;
    let permanentPayment = null;
    if (interestRate > 0) {
        const monthlyRate = interestRate / 12;
        const term = 360; // 30 years amortization
        permanentPayment = loanAmount * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -term)));
    }

    document.getElementById('project-cost').textContent = formatCurrency(projectCost);
    document.getElementById('ltv-basis').textContent = formatCurrency(ltvBasis);
    document.getElementById('max-loan').textContent = formatCurrency(maxLoan);
    document.getElementById('requested-ltv').textContent = formatPercent(requestedLtv);

    const ltvStatus = document.getElementById('ltv-status');
    const ltvGuidance = document.getElementById('ltv-guidance');
    ltvStatus.classList.remove('warning', 'danger');
    let guidanceText = '';

    if (ltvBasis <= 0 || loanAmount <= 0) {
        ltvStatus.classList.add('warning');
        ltvStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Add scenario assumptions';
        guidanceText = 'Input project costs, valuation, and the requested loan amount to benchmark the structure against program limits.';
    } else if (loanAmount <= maxLoan + 1e-6) {
        ltvStatus.innerHTML = '<i class="fas fa-check-circle"></i> Within program guidelines';
        if (transactionType === 'refinance' && cashOutExcess > 0) {
            guidanceText = `Structure meets the 90% cap, but reduce the loan amount by ${formatCurrency(cashOutExcess)} so no cash releases above the lien payoff and closing costs.`;
        } else {
            guidanceText = `At ${formatPercent(requestedLtv)}, this request remains inside the 90% maximum—no pricing or structure adjustments required.`;
        }
    } else {
        ltvStatus.classList.add('danger');
        ltvStatus.innerHTML = '<i class="fas fa-times-circle"></i> Above 90% LTV';
        const reduction = loanAmount - maxLoan;
        guidanceText = `Trim the loan request by ${formatCurrency(reduction)} or advise the borrower to contribute additional equity to comply with the 90% cap.`;
    }
    ltvGuidance.textContent = guidanceText;

    const acquisitionGap = Math.max(acquisitionBasis - loanAmount, 0);
    let estimatedFundsNeeded;
    if (transactionType === 'refinance') {
        const buildGap = Math.max(buildPrice - loanAmount, 0);
        estimatedFundsNeeded = closingShortfall + buildGap;
    } else {
        estimatedFundsNeeded = acquisitionGap + closingShortfall;
    }

    document.getElementById('equity-required').textContent = formatCurrency(estimatedFundsNeeded);
    const equityDetail = document.getElementById('equity-detail');
    if (equityDetail) {
        if (transactionType === 'refinance') {
            const messages = [];
            if (closingShortfall > 0) {
                messages.push('Closing proceeds short of lien payoff and costs');
            }
            if (buildPrice > loanAmount) {
                messages.push('Build price amount above the approved loan');
            }
            equityDetail.textContent = messages.length > 0
                ? messages.join(' + ')
                : 'Closing proceeds cover lien payoff and closing costs';
        } else {
            if (closingShortfall > 0) {
                equityDetail.textContent = 'Acquisition costs above the loan + closing costs not covered by the initial disbursement';
            } else {
                equityDetail.textContent = 'Build price + lot price − loan amount';
            }
        }
    }
    document.getElementById('initial-disbursement').textContent = formatCurrency(initialDisbursement);
    document.getElementById('construction-holdback').textContent = formatCurrency(constructionHoldback);
    document.getElementById('remaining-holdback').textContent = formatCurrency(remainingHoldback);
    document.getElementById('current-disbursed').textContent = formatCurrency(totalDisbursed);

    const initialDisbursementDetail = document.getElementById('initial-disbursement-detail');
    if (initialDisbursementDetail) {
        if (transactionType === 'refinance') {
            initialDisbursementDetail.textContent = 'Loan amount − build price (available to satisfy lien payoff and closing costs)';
        } else {
            initialDisbursementDetail.textContent = 'Loan amount − build price';
        }
    }

    const projectCostDetail = document.getElementById('project-cost-detail');
    if (projectCostDetail) {
        const lotDescriptor = transactionType === 'refinance' ? 'lot value' : 'lot price';
        projectCostDetail.textContent = `Build price + ${lotDescriptor}`;
    }

    const existingLienDisplay = document.getElementById('existing-lien-display');
    if (existingLienDisplay) {
        existingLienDisplay.textContent = formatCurrency(existingLien);
    }

    const closingCostsDisplay = document.getElementById('closing-costs-display');
    if (closingCostsDisplay) {
        closingCostsDisplay.textContent = formatCurrency(closingCosts);
    }

    const existingLienCard = document.getElementById('existing-lien-card');
    if (existingLienCard) {
        existingLienCard.classList.toggle('hidden', transactionType !== 'refinance');
    }

    const cashoutGuidance = document.getElementById('refi-cashout-guidance');
    if (cashoutGuidance) {
        if (transactionType === 'refinance' && closingShortfall > 0) {
            cashoutGuidance.classList.remove('hidden');
            cashoutGuidance.textContent = 'Closing proceeds fall short of the lien payoff and closing costs—coach the borrower to bring funds or adjust the request.';
        } else {
            cashoutGuidance.classList.add('hidden');
            cashoutGuidance.textContent = '';
        }
    }

    const paymentProgressBody = document.getElementById('payment-progress-body');
    if (paymentProgressBody) {
        paymentProgressBody.innerHTML = '';

        const addProgressRow = (fraction, label, isActive = false) => {
            const constrainedFraction = Math.min(Math.max(fraction, 0), 1);
            const row = document.createElement('tr');
            if (isActive) {
                row.classList.add('active');
            }

            const percentCell = document.createElement('td');
            percentCell.textContent = label ?? `${Math.round(constrainedFraction * 100)}% draw complete`;

            const disbursedAmount = Math.min(
                initialDisbursement + constructionHoldback * constrainedFraction,
                loanAmount
            );
            const disbursedCell = document.createElement('td');
            disbursedCell.textContent = formatCurrency(disbursedAmount);

            const paymentCell = document.createElement('td');
            if (interestRate > 0) {
                const monthlyInterest = (disbursedAmount * interestRate) / 12;
                paymentCell.textContent = formatCurrency(monthlyInterest);
            } else {
                paymentCell.innerHTML = '<span class="muted">Enter rate</span>';
            }

            row.appendChild(percentCell);
            row.appendChild(disbursedCell);
            row.appendChild(paymentCell);
            paymentProgressBody.appendChild(row);
        };

        addProgressRow(normalizedProgress, `Active scenario — ${Math.round(normalizedProgress * 100)}% draw complete`, true);

        const checkpoints = [0, 0.25, 0.5, 0.75, 1];
        checkpoints.forEach((checkpoint) => {
            if (Math.abs(checkpoint - normalizedProgress) < 0.001) {
                return;
            }
            const checkpointLabel = `${Math.round(checkpoint * 100)}% draw complete`;
            addProgressRow(checkpoint, checkpointLabel);
        });
    }

    const interestOnlyElement = document.getElementById('interest-only-payment');
    if (monthlyInterestOnly !== null) {
        interestOnlyElement.textContent = formatCurrency(monthlyInterestOnly);
    } else {
        interestOnlyElement.textContent = 'Enter rate';
    }

    const permanentPaymentElement = document.getElementById('permanent-payment');
    if (permanentPayment !== null) {
        permanentPaymentElement.textContent = formatCurrency(permanentPayment);
    } else {
        permanentPaymentElement.textContent = 'Enter rate';
    }

    if (drawProgressInput) {
        const display = document.getElementById('draw-progress-display');
        display.textContent = `${Math.round(normalizedProgress * 100)}%`;
    }
}

function toggleTransactionFields() {
    const transactionTypeElement = document.getElementById('transaction-type');
    if (!transactionTypeElement) {
        return;
    }

    const transactionType = transactionTypeElement.value;
    const purchaseFields = document.querySelectorAll('.purchase-field');
    const refinanceFields = document.querySelectorAll('.refinance-field');

    purchaseFields.forEach((element) => {
        element.classList.toggle('hidden', transactionType !== 'purchase');
    });

    refinanceFields.forEach((element) => {
        element.classList.toggle('hidden', transactionType !== 'refinance');
    });
}

function setupCurrencyInput(element) {
    if (!element) {
        return;
    }

    const { id } = element;

    element.addEventListener('focus', () => {
        const numeric = getNumericInput(id);
        element.value = numeric > 0 ? numeric.toFixed(2) : '';
        requestAnimationFrame(() => {
            element.select();
        });
    });

    element.addEventListener('blur', () => {
        const numeric = getNumericInput(id);
        element.value = numeric > 0 ? formatCurrency(numeric) : '';
        updateScenario();
    });

    const initialValue = getNumericInput(id);
    if (initialValue > 0) {
        element.value = formatCurrency(initialValue);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const inputs = [
        'transaction-type',
        'build-price',
        'lot-price',
        'lot-value',
        'appraised-value',
        'loan-amount',
        'existing-lien',
        'closing-costs',
        'interest-rate',
        'draw-progress'
    ];

    inputs.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => {
                if (id === 'transaction-type') {
                    toggleTransactionFields();
                }
                updateScenario();
            });

            if (id === 'transaction-type') {
                element.addEventListener('change', () => {
                    toggleTransactionFields();
                    updateScenario();
                });
            }
        }
    });

    const currencyElements = document.querySelectorAll('[data-format="currency"]');
    currencyElements.forEach((element) => {
        setupCurrencyInput(element);
    });

    toggleTransactionFields();
    updateScenario();
});
