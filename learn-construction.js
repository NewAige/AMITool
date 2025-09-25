function getNumericInput(id) {
    const element = document.getElementById(id);
    if (!element) {
        return 0;
    }
    const value = parseFloat(element.value);
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
    const buildPrice = getNumericInput('build-price');
    const lotPrice = getNumericInput('lot-price');
    const appraisalInput = getNumericInput('appraised-value');
    const loanAmount = getNumericInput('loan-amount');
    const interestRatePercent = getNumericInput('interest-rate');
    const drawProgressInput = document.getElementById('draw-progress');

    const projectCost = buildPrice + lotPrice;
    const appraisalValue = appraisalInput > 0 ? appraisalInput : projectCost;
    const ltvBasis = Math.min(projectCost, appraisalValue);
    const maxLoan = ltvBasis * 0.9;
    const requestedLtv = ltvBasis > 0 ? loanAmount / ltvBasis : 0;

    const initialDisbursement = Math.max(loanAmount - buildPrice, 0);
    const constructionHoldback = Math.max(loanAmount - initialDisbursement, 0);

    const progress = drawProgressInput ? parseFloat(drawProgressInput.value) / 100 : 0;
    const normalizedProgress = Math.min(Math.max(progress, 0), 1);
    const disbursedHoldback = constructionHoldback * normalizedProgress;
    const totalDisbursed = Math.min(initialDisbursement + disbursedHoldback, loanAmount);
    const remainingHoldback = Math.max(constructionHoldback - disbursedHoldback, 0);

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
        guidanceText = `At ${formatPercent(requestedLtv)}, this request remains inside the 90% maximum—no pricing or structure adjustments required.`;
    } else {
        ltvStatus.classList.add('danger');
        ltvStatus.innerHTML = '<i class="fas fa-times-circle"></i> Above 90% LTV';
        const reduction = loanAmount - maxLoan;
        guidanceText = `Trim the loan request by ${formatCurrency(reduction)} or advise the borrower to contribute additional equity to comply with the 90% cap.`;
    }
    ltvGuidance.textContent = guidanceText;

    document.getElementById('equity-required').textContent = formatCurrency(Math.max(projectCost - loanAmount, 0));
    document.getElementById('initial-disbursement').textContent = formatCurrency(initialDisbursement);
    document.getElementById('construction-holdback').textContent = formatCurrency(constructionHoldback);
    document.getElementById('remaining-holdback').textContent = formatCurrency(remainingHoldback);
    document.getElementById('current-disbursed').textContent = formatCurrency(totalDisbursed);

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

document.addEventListener('DOMContentLoaded', () => {
    const inputs = [
        'build-price',
        'lot-price',
        'appraised-value',
        'loan-amount',
        'interest-rate',
        'draw-progress'
    ];

    inputs.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateScenario);
        }
    });

    const currencyInputs = [
        'build-price',
        'lot-price',
        'appraised-value',
        'loan-amount'
    ];

    currencyInputs.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                const value = parseFloat(element.value);
                if (Number.isFinite(value)) {
                    element.value = value.toFixed(2);
                } else {
                    element.value = '';
                }
            });
        }
    });

    updateScenario();
});
