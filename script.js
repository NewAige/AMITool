// Load settings from localStorage or server with fallback to defaults
// Updated loadAmiToolSettings function with Buy Cities using town names
function loadAmiToolSettings() {
    console.log('Using hardcoded settings instead of localStorage data');

    // Return complete hardcoded settings
    // These settings come directly from script.js and ignore localStorage
    return {
        year: "2025",
        dpaPrograms: [
            {
                id: "bcsb1",
                name: "BCSB DPA: $20,000 Downpayment Assistance",
                active: true,
                eligibilityType: "county", // can be "state", "county", or "town"
                states: {
                    ma: true,
                    ri: true
                },
                counties: {
                    bristol: true,
                    providence: true
                },
                towns: {
                    ma: [],
                    ri: []
                },
                incomeRanges: {
                    below80: true,
                    from80to100: false,
                    from100to120: false,
                    above120: false
                },
                description1: "For households with income at or below 80% AMI",
                description2: "Provides $20,000 in downpayment assistance"
            },
            {
                id: "bcsb2",
                name: "BCSB DPA: $15,000 Downpayment Assistance",
                active: true,
                eligibilityType: "county",
                states: {
                    ma: true,
                    ri: true
                },
                counties: {
                    bristol: true,
                    providence: true
                },
                towns: {
                    ma: [],
                    ri: []
                },
                incomeRanges: {
                    below80: false,
                    from80to100: true,
                    from100to120: false,
                    above120: false
                },
                description1: "For households with income between 80.01% and 100% AMI",
                description2: "Provides $15,000 in downpayment assistance"
            },
            {
                id: "bcsb3",
                name: "BCSB DPA: $10,000 Downpayment Assistance",
                active: true,
                eligibilityType: "county",
                states: {
                    ma: true,
                    ri: true
                },
                counties: {
                    bristol: true,
                    providence: true
                },
                towns: {
                    ma: [],
                    ri: []
                },
                incomeRanges: {
                    below80: false,
                    from80to100: false,
                    from100to120: true,
                    above120: false
                },
                description1: "For households with income between 100.01% and 120% AMI",
                description2: "Provides $10,000 in downpayment assistance"
            }
        ],
        mortgagePrograms: [
            {
                id: "fthb",
                name: "First Time Homebuyer",
                active: true,
                eligibilityType: "county",
                states: {
                    ma: true,
                    ri: true
                },
                counties: {
                    bristol: true,
                    providence: true
                },
                towns: {
                    ma: [],
                    ri: []
                },
                incomeRanges: {
                    below80: true,
                    from80to100: true,
                    from100to120: true,
                    above120: true
                },
                description1: "No income limit. Must be a first-time homebuyer. Available as a 30-year fixed or a 7/6 ARM.",
                description2: "Available in Providence County, RI or Bristol County, MA"
            },
            {
                id: "pcp",
                name: "Providence County Pathway",
                active: true,
                eligibilityType: "county",
                states: {
                    ma: true,
                    ri: true
                },
                counties: {
                    bristol: false,
                    providence: true
                },
                towns: {
                    ma: [],
                    ri: []
                },
                incomeRanges: {
                    below80: true,
                    from80to100: true,
                    from100to120: true,
                    above120: false
                },
                description1: "Must be at or below 120% AMI. Available as a 30-year fixed",
                description2: "Only available in Providence County, RI"
            },
            {
                id: "exclusive80",
                name: "Exclusive BCSB HomeBuyer",
                active: true,
                eligibilityType: "county",
                states: {
                    ma: true,
                    ri: true
                },
                counties: {
                    bristol: true,
                    providence: true
                },
                towns: {
                    ma: [],
                    ri: []
                },
                incomeRanges: {
                    below80: true,
                    from80to100: false,
                    from100to120: false,
                    above120: false
                },
                description1: "Must be at or below 80% AMI. Available as a 30-year fixed.",
                description2: "Available in Bristol County, MA or Providence County, RI"
            },
            {
                id: "buycities",
                name: "Buy Cities",
                active: true,
                eligibilityType: "town",
                states: { ma: true, ri: false },
                counties: { bristol: true },
                towns: {
                    ma: [
                        "Fall River", // Using town names instead of FIPS codes
                        "New Bedford",
                        "Taunton",
                        "Attleboro"
                    ],
                    ri: []
                },
                incomeLimitType: "fixedCompliance",
                maxComplianceIncome: 146205,
                description1: "Uses Borrower Compliance Income. Available as a 30-year fixed",
                description2: "Available in Fall River, New Bedford, Taunton, and Attleboro, MA."
            },
            {
                id: "affordablehousing",
                name: "Affordable Housing Program",
                active: true,
                eligibilityType: "county",
                states: { ma: true, ri: true },
                counties: { bristol: true, providence: true },
                towns: { ma: [], ri: [] },
                incomeLimitType: "fixedQualifying",
                maxQualifyingIncome: 92080,
                description1: "Uses Borrower Qualifying Income (HomeReady). Available as a 7/6 ARM.",
                description2: "Available in Bristol County, MA and Providence County, RI."
            }
        ]
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    debug('DOM fully loaded, setting up event listeners');

    // Add this to your document.addEventListener('DOMContentLoaded', function() {...}) block
    // This sets up the global income type toggle

    // Setup for global income type toggle
    const globalIncomeAnnual = document.getElementById('income-type-annual');
    const globalIncomeMonthly = document.getElementById('income-type-monthly');

    if (globalIncomeAnnual) {
        globalIncomeAnnual.addEventListener('change', function() {
            if (this.checked) {
                updateAllIncomePlaceholders('annual');
                // Update all income calculations with the current toggle state
                updateAMIPercentage();
                updateComplianceIncome();
                updateQualifyingIncome();
            }
        });
    }

    if (globalIncomeMonthly) {
        globalIncomeMonthly.addEventListener('change', function() {
            if (this.checked) {
                updateAllIncomePlaceholders('monthly');
                // Update all income calculations with the current toggle state
                updateAMIPercentage();
                updateComplianceIncome();
                updateQualifyingIncome();
            }
        });
    }

    // Load settings
    const settings = loadAmiToolSettings();

    // Set up state selection cards
    const maCard = document.getElementById('select-ma');
    const riCard = document.getElementById('select-ri');

    if (maCard) {
        maCard.addEventListener('click', function() {
            handleStateSelection('MA');
        });
    }

    if (riCard) {
        riCard.addEventListener('click', function() {
            handleStateSelection('RI');
        });
    }

    // Set up household size increment/decrement buttons
    const decreaseBtn = document.querySelector('.number-input .decrease');
    const increaseBtn = document.querySelector('.number-input .increase');
    const householdInput = document.getElementById('household');

    if (decreaseBtn && householdInput) {
        decreaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(householdInput.value);
            if (currentValue > parseInt(householdInput.min)) {
                householdInput.value = currentValue - 1;
            }
        });
    }

    if (increaseBtn && householdInput) {
        increaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(householdInput.value);
            if (currentValue < parseInt(householdInput.max)) {
                householdInput.value = currentValue + 1;
            }
        });
    }

    // Make the town dropdown searchable
    const townSelect = document.getElementById('town');
    if (townSelect) {
        // Convert the dropdown into a searchable one
        townSelect.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') return;

            const searchText = this.value.toLowerCase();
            const options = Array.from(this.options);

            // Skip the first option (placeholder)
            for (let i = 1; i < options.length; i++) {
                const option = options[i];
                const optionText = option.textContent.toLowerCase();

                if (optionText.includes(searchText)) {
                    option.style.display = '';
                } else {
                    option.style.display = 'none';
                }
            }
        });
    }

    // Set up navigation button listeners

    // Previous button on Town form (Step 2 -> Step 1)
    const townPrevBtn = document.getElementById('town-prev-btn');
    if (townPrevBtn) {
        townPrevBtn.addEventListener('click', function() {
            document.getElementById('town-form').classList.add('hidden-form');
            document.getElementById('state-form').classList.remove('hidden-form');
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step1').classList.add('active');
            updateProgressBar();
        });
    }

    // Previous button on Results form (Step 3 -> Step 2)
    const resultPrevBtn = document.getElementById('result-prev-btn');
    if (resultPrevBtn) {
        resultPrevBtn.addEventListener('click', function() {
            document.getElementById('result').classList.add('hidden-form');
            document.getElementById('town-form').classList.remove('hidden-form');
            document.getElementById('step3').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            updateProgressBar();
        });
    }

    // Previous button on Eligibility form (Step 4 -> Step 3)
    const eligibilityPrevBtn = document.getElementById('eligibility-prev-btn');
    if (eligibilityPrevBtn) {
        eligibilityPrevBtn.addEventListener('click', function() {
            document.getElementById('eligibility').classList.add('hidden-form');
            document.getElementById('result').classList.remove('hidden-form');
            document.getElementById('step4').classList.remove('active');
            document.getElementById('step3').classList.add('active');
            updateProgressBar();
        });
    }

    // Print buttons
    const printResultsBtn = document.getElementById('print-results-btn');
    if (printResultsBtn) {
        printResultsBtn.addEventListener('click', printResults);
    }

    const printEligibilityBtn = document.getElementById('print-eligibility-btn');
    if (printEligibilityBtn) {
        printEligibilityBtn.addEventListener('click', printResults);
    }

    // Restart button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', resetToInitialState);
    }

    // REMOVED OLD incomeMonthly/incomeAnnual listeners (now handled by global toggle)
    // Add event listener for income input to format as currency and update AMI percentage
    const incomeInput = document.getElementById('income-input');
    if (incomeInput) {
        incomeInput.addEventListener('input', function() {
            formatCurrency(this);
            updateAMIPercentage();
        });
    }

    // Town change event to detect county
    if (townSelect) {
        townSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            // const countyInfo = document.getElementById('county-info'); // countyInfo is updated in handleTownSelection

            if (selectedOption && selectedOption.dataset.county) {
                const county = selectedOption.dataset.county;
                userData.county = county;

                // Always use the cleaned town name
                userData.townName = selectedOption.dataset.cleanName || cleanTownNameString(selectedOption.textContent);
                userData.originalTownName = selectedOption.dataset.originalName || selectedOption.textContent;

                debug('Town selected (from DOM listener):', {
                    original: selectedOption.dataset.originalName,
                    cleaned: userData.townName,
                    county: county
                });

                // Check if in eligible county
                userData.isEligibleCounty = (county === 'Bristol' || county === 'Providence');
            } else {
                userData.county = '';
                userData.townName = '';
                userData.originalTownName = '';
                userData.isEligibleCounty = false;
            }
            handleTownSelection(); // Call the main handler to update UI like county-info
        });
    }

    // Household form submission
    const householdForm = document.getElementById('household-form');
    if (householdForm) {
        householdForm.addEventListener('submit', function(event) {
            event.preventDefault();
            debug('Household form submitted');

            const townCode = document.getElementById('town').value;
            const year = settings.year || "2025";
            const householdSize = document.getElementById('household').value;

            // Make sure we have a selected town and the town name is stored
            if (!townCode || !year || !householdSize) {
                alert('Please select a town and specify household size before continuing.');
                return;
            }

            // Ensure town name is set if not already
            if (!userData.townName) {
                const townSelect = document.getElementById('town');
                if (townSelect && townSelect.selectedIndex > 0) {
                    const selectedOption = townSelect.options[townSelect.selectedIndex];
                    userData.townName = selectedOption.dataset.cleanName || cleanTownNameString(selectedOption.textContent);
                    userData.county = selectedOption.dataset.county || '';
                    userData.isEligibleCounty = (userData.county === 'Bristol' || userData.county === 'Providence');
                }
            }

            debug('Household data:', {
                townCode,
                year,
                householdSize,
                townName: userData.townName,
                county: userData.county
            });

            userData.town = townCode;
            userData.year = year;
            userData.householdSize = householdSize;

            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
            submitButton.disabled = true;

            // Fetch income limit data
            fetch(`https://www.huduser.gov/hudapi/public/il/data/${townCode}?year=${year}`, {
                headers: {
                    'Authorization': `Bearer ${apiToken}`
                }
            })
            .then(response => response.json())
            .then(data => {
                debug('API response for income limits:', data);

                if (data && data.data) {
                    const ilData = data.data; // Base object for income limits
                    let incomeLimit50, incomeLimit80;

                    // HUD API structure can vary slightly (e.g. very_low_income vs very_low)
                    const veryLowKey = ilData.very_low_income ? 'very_low_income' : 'very_low';
                    const lowKey = ilData.low_income ? 'low_income' : 'low';

                    const il50Data = ilData[veryLowKey];
                    const il80Data = ilData[lowKey];

                    const il50Key = `il50_p${householdSize}`; // Or `il50_${householdSize}p` or similar, adjust if API changes
                    const il80Key = `il80_p${householdSize}`; // Or `il80_${householdSize}p`

                    if (il50Data && il80Data) {
                        incomeLimit50 = il50Data[il50Key] || il50Data[`il50_${householdSize}`]; // trying common variations
                        incomeLimit80 = il80Data[il80Key] || il80Data[`il80_${householdSize}`];
                    }


                    if (incomeLimit50 && incomeLimit80) {
                        // Update the results UI
                        updateResults(incomeLimit50, incomeLimit80, householdSize);
                    } else {
                        alert(`No income limit data available for ${householdSize} people. Check API structure or household size limits.`);
                        console.error('Missing income limit data for keys:', { il50Key, il80Key, il50Data, il80Data });
                    }
                } else {
                    console.error('Unexpected response structure or no data.data:', data);
                    alert('Error calculating income limits. Please try again.');
                }

                // Reset button
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            })
            .catch(error => {
                console.error('Error fetching income limits:', error);
                alert('Error calculating income limits. Please try again.');
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }

    // Check eligibility button
    const checkEligibilityBtn = document.getElementById('check-eligibility');
    if (checkEligibilityBtn) {
        checkEligibilityBtn.addEventListener('click', function() {
            debug('Check eligibility button clicked');

            // Ensure income is entered
            const incomeInput = document.getElementById('income-input');
            if (incomeInput && (!incomeInput.value || parseFloat(incomeInput.value.replace(/,/g, '')) === 0)) {
                alert('Please enter your household income before checking program eligibility.');
                incomeInput.focus();
                return;
            }

            checkEligibility();
        });
    }
});

// Enable debugging
const DEBUG = true;

// Global user data
let userData = {
    state: '',
    town: '',
    townName: '',
    originalTownName: '', // Added for clarity
    county: '',
    year: 2025,
    householdSize: 1,
    incomeLimit50: 0,
    incomeLimit80: 0,
    incomeLimit100: 0,
    incomeLimit120: 0,
    isEligibleCounty: false,
    currentIncome: 0,
    borrowerComplianceIncome: 0,
    borrowerQualifyingIncome: 0
};

// Town to county mapping for eligibility checking
const countyMapping = {
    // Massachusetts - Bristol County towns
    'Acushnet': 'Bristol',
    'Attleboro': 'Bristol',
    'Berkley': 'Bristol',
    'Dartmouth': 'Bristol',
    'Dighton': 'Bristol',
    'Easton': 'Bristol',
    'Fairhaven': 'Bristol',
    'Fall River': 'Bristol',
    'Freetown': 'Bristol',
    'Mansfield': 'Bristol',
    'New Bedford': 'Bristol',
    'North Attleborough': 'Bristol',
    'Norton': 'Bristol',
    'Raynham': 'Bristol',
    'Rehoboth': 'Bristol',
    'Seekonk': 'Bristol',
    'Somerset': 'Bristol',
    'Swansea': 'Bristol',
    'Taunton': 'Bristol',
    'Westport': 'Bristol',
    // Rhode Island - Providence County towns
    'Burrillville': 'Providence',
    'Central Falls': 'Providence',
    'Cranston': 'Providence',
    'Cumberland': 'Providence',
    'East Providence': 'Providence',
    'Foster': 'Providence',
    'Glocester': 'Providence',
    'Johnston': 'Providence',
    'Lincoln': 'Providence',
    'North Providence': 'Providence',
    'North Smithfield': 'Providence',
    'Pawtucket': 'Providence',
    'Providence': 'Providence',
    'Scituate': 'Providence',
    'Smithfield': 'Providence',
    'Woonsocket': 'Providence'
};

// API Token
const apiToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI2IiwianRpIjoiZmM3YWYxYzMwNjBhYmM1NTVjN2IyYzc0YzFiOWQ3YTBmYmIzMjg1NzkxYTYwNTVmOTMyOGIxNTk1MzczNjM3MDAwY2Y1YzQ1MmZmMjYwZWUiLCJpYXQiOjE3MTk2OTE3MTQuMTI0MjAyLCJuYmYiOjE3MTk2OTE3MTQuMTI0MjA0LCJleHAiOjIwMzUyMjQ1MTQuMTIwNjc3LCJzdWIiOiI3MzA3NCIsInNjb3BlcyI6W119.QOAzQdjx3I_j6sHIHNMKTYaE7UIag-sXs5AQQZvRDfCTVuko2IOYrIMDObisKgZgWMy01RcWAOUtQxkAVDn1Fg';

// Constants for program limits
const MASSHOUSING_INCOME_LIMIT = 146205; // $146,205
const HOMEREADY_INCOME_LIMIT = 92080; // $92,080

// Money formatter
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
});

// Update progress bar based on active step
function updateProgressBar() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');
    const progressBar = document.getElementById('progress-bar');

    if (step4.classList.contains('active')) {
        progressBar.style.width = '100%';
        step1.classList.add('completed');
        step2.classList.add('completed');
        step3.classList.add('completed');
    } else if (step3.classList.contains('active')) {
        progressBar.style.width = '66%';
        step1.classList.add('completed');
        step2.classList.add('completed');
        step3.classList.remove('completed');
    } else if (step2.classList.contains('active')) {
        progressBar.style.width = '33%';
        step1.classList.add('completed');
        step2.classList.remove('completed');
    } else {
        progressBar.style.width = '0%';
        step1.classList.remove('completed');
    }
}

// Function to print or save as PDF
function printResults() {
    window.print();
}

// Function to format currency input
function formatCurrency(input) {
    // Remove non-digit characters
    let value = input.value.replace(/[^\d]/g, '');

    // Format with commas for thousands
    if (value) {
        value = parseInt(value).toLocaleString('en-US');
    }

    input.value = value;
}

// Function to update all income input placeholders based on type (NEW FUNCTION)
function updateAllIncomePlaceholders(type) {
    const isMonthly = type === 'monthly';

    // Update household income placeholder
    const incomeInput = document.getElementById('income-input');
    if (incomeInput) {
        incomeInput.setAttribute('placeholder', isMonthly ? 'Enter monthly income' : 'Enter annual income');
        const label = document.querySelector('label[for="income-input"]');
        if (label) {
            label.innerHTML = `Enter Your ${isMonthly ? 'Monthly' : 'Annual'} Household Income: <div class="tooltip"><i class="fas fa-info-circle"></i><span class="tooltip-text">${isMonthly ? 'Monthly income will be converted to annual' : 'Enter total annual income for all household members'}</span></div>`;
        }
    }

    // Update compliance income placeholder
    const complianceInput = document.getElementById('compliance-income-input');
    if (complianceInput) {
        complianceInput.setAttribute('placeholder', isMonthly ? 'Enter monthly compliance income' : 'Enter annual compliance income');
    }

    // Update qualifying income placeholder
    const qualifyingInput = document.getElementById('qualifying-income-input');
    if (qualifyingInput) {
        qualifyingInput.setAttribute('placeholder', isMonthly ? 'Enter monthly qualifying income' : 'Enter annual qualifying income');
    }
}


// Modify updateAMIPercentage function to use global toggle (REPLACED)
function updateAMIPercentage() {
    const incomeInput = document.getElementById('income-input');
    // Remove commas from the input value before parsing
    let incomeValue = parseFloat(incomeInput.value.replace(/,/g, '')) || 0;

    // Check if monthly income is selected and convert to annual
    const incomeTypeMonthly = document.getElementById('income-type-monthly').checked;
    if (incomeTypeMonthly) {
        incomeValue = incomeValue * 12;
    }

    // Store the current income for later use
    userData.currentIncome = incomeValue;

    // Determine AMI category and update display
    let amiCategory = "None";
    let categoryClass = "neutral";

    if (incomeValue <= userData.incomeLimit80) {
        amiCategory = "80% AMI or below (Low Income)";
        categoryClass = "success";
    } else if (incomeValue <= userData.incomeLimit100) {
        amiCategory = "80.01% - 100% AMI (Moderate Income)";
        categoryClass = "info";
    } else if (incomeValue <= userData.incomeLimit120) {
        amiCategory = "100.01% - 120% AMI (Middle Income)";
        categoryClass = "warning";
    } else {
        amiCategory = "Above 120% AMI";
        categoryClass = "danger";
    }

    // Update AMI category display
    const amiDisplay = document.getElementById('ami-category-display');
    if (amiDisplay) {
        amiDisplay.innerHTML = amiCategory;
        // Remove all existing classes and add the new one
        amiDisplay.className = 'ami-category-label ' + categoryClass;
    }
}

// Logging helper
function debug(message, data) {
    if (DEBUG) {
        if (data !== undefined) { // Check if data is actually passed
            console.log(message, data);
        } else {
            console.log(message);
        }
    }
}

// Function to find county from town name (handling suffixes like "City" and "Town")
function findCountyFromTownName(townName) {
    // Clean the town name first
    const cleanName = cleanTownNameString(townName);

    // Try exact match first with the clean name
    if (countyMapping[cleanName]) {
        return countyMapping[cleanName];
    }

    // Try original name as fallback
    if (countyMapping[townName]) {
        return countyMapping[townName];
    }

    // Log for debugging
    debug(`County not found for town: "${townName}", cleaned: "${cleanName}"`);
    return '';
}

// Helper function to standardize town name cleaning
function cleanTownNameString(townName) {
    if (!townName) return '';

    // Remove " city", " town", " City", " Town" suffixes
    let cleanName = townName.replace(/ city$| town$| City$| Town$/i, ''); // Case-insensitive for suffixes

    // Additional cleaning for more variations
    cleanName = cleanName.replace(/ CDP$| cdp$/i, ''); // For Census Designated Places
    cleanName = cleanName.replace(/ village$| Village$/i, ''); // For Villages

    // debug(`Cleaned town name from "${townName}" to "${cleanName}"`); // Can be noisy, enable if needed
    return cleanName.trim(); // Trim any leading/trailing spaces
}

// Update AMI results - For Step 3
function updateResults(incomeLimit50, incomeLimit80, householdSize) {
    debug('Updating results with:', {incomeLimit50, incomeLimit80, householdSize});
    debug('Current user data for results:', userData);
    
    const incomeLimit100 = incomeLimit50 * 2;
    const incomeLimit120 = incomeLimit50 * 2.4;

    // Update user data
    userData.incomeLimit50 = incomeLimit50;
    userData.incomeLimit80 = incomeLimit80;
    userData.incomeLimit100 = incomeLimit100;
    userData.incomeLimit120 = incomeLimit120;

    // Update location info
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
        locationInfo.innerHTML = `
            <h3>Income Limits for ${userData.townName || 'Selected Town'}</h3>
            <p>Based on a household size of ${householdSize}</p>
        `;
    }

    // Update income limits table with monthly calculations
    const incomeLimits = document.getElementById('income-limits');
    if (incomeLimits) {
        incomeLimits.innerHTML = `
            <tr>
                <td>80% AMI (Low Income)</td>
                <td>${formatter.format(incomeLimit80)}</td>
                <td>${formatter.format(Math.round(incomeLimit80 / 12))}</td>
            </tr>
            <tr>
                <td>100% AMI (Area Median Income)</td>
                <td>${formatter.format(incomeLimit100)}</td>
                <td>${formatter.format(Math.round(incomeLimit100 / 12))}</td>
            </tr>
            <tr>
                <td>120% AMI</td>
                <td>${formatter.format(incomeLimit120)}</td>
                <td>${formatter.format(Math.round(incomeLimit120 / 12))}</td>
            </tr>
        `;
    }

    // Reset AMI category display
    const amiCategoryDisplay = document.getElementById('ami-category-display');
    if (amiCategoryDisplay) {
        amiCategoryDisplay.innerHTML = 'Please enter your income';
        amiCategoryDisplay.className = 'ami-category-label neutral';
    }

    // Clear all income inputs
    const incomeInput = document.getElementById('income-input');
    if (incomeInput) {
        incomeInput.value = '';
    }
    userData.currentIncome = 0; // Reset in userData
    
    const complianceInput = document.getElementById('compliance-income-input');
    if (complianceInput) {
        complianceInput.value = '';
    }
    userData.borrowerComplianceIncome = 0; // Reset in userData
    
    const qualifyingInput = document.getElementById('qualifying-income-input');
    if (qualifyingInput) {
        qualifyingInput.value = '';
    }
    userData.borrowerQualifyingIncome = 0; // Reset in userData
    
    // Reset income display spans
    const complianceIncomeValue = document.getElementById('compliance-income-value');
    if(complianceIncomeValue) {
        complianceIncomeValue.textContent = 'No income entered';
    }
    
    const qualifyingIncomeValue = document.getElementById('qualifying-income-value');
    if(qualifyingIncomeValue) {
        qualifyingIncomeValue.textContent = 'No income entered';
    }
    
    // Reset income type toggle to annual
    if(document.getElementById('income-type-annual')) {
        document.getElementById('income-type-annual').checked = true;
    }

    // Update visibility and status for special income fields
    updateComplianceIncomeVisibility(); // This will also call status updates

    // Set up print button
    const printResultsBtn = document.getElementById('print-results-btn');
    if (printResultsBtn) {
        printResultsBtn.onclick = printResults;
    }

    // Show Step 3 (Results)
    const townForm = document.getElementById('town-form');
    const resultForm = document.getElementById('result');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    
    if (townForm) townForm.classList.add('hidden-form');
    if (resultForm) resultForm.classList.remove('hidden-form');
    if (step2) step2.classList.remove('active');
    if (step3) step3.classList.add('active');
    
    // Update progress bar
    updateProgressBar();
    
    debug('Results updated successfully');
}

// Fixed checkEligibility function with proper state-level eligibility
// Fixed checkEligibility function with proper eligibility type comparison
// Copy this to your script.js file to fix the Buy Cities and Affordable Housing Programs

// Function to check eligibility and show available programs
function checkEligibility() {
    debug('Checking eligibility');
    debug('Current userData for eligibility:', userData);

    // Get the household income value
    let incomeValue = userData.currentIncome;

    // If no income value stored, get it from the input (shouldn't be needed if updateAMIPercentage runs on input)
    if (incomeValue === 0 && document.getElementById('income-input').value) {
        updateAMIPercentage(); // Ensure userData.currentIncome is set
        incomeValue = userData.currentIncome;
    }

    // Force debug output of critical data for diagnosis
    console.log('Household Income for eligibility check:', incomeValue);
    console.log('Town data:', { townName: userData.townName, county: userData.county, state: userData.state });
    // console.log('Town FIPS code:', userData.town); // Usually not needed for display logic
    console.log('Special program income values:', {
        borrowerComplianceIncome: userData.borrowerComplianceIncome,
        borrowerQualifyingIncome: userData.borrowerQualifyingIncome
    });

    // Set county eligibility notice
    const countyNote = document.getElementById('county-eligibility-note');

    if (!userData.townName) { // Fallback if townName somehow empty
        userData.townName = "Your selected town";
    }

    // Update county eligibility message
    if (countyNote) {
        if (userData.county === 'Bristol' || userData.county === 'Providence') {
            userData.isEligibleCounty = true;
            countyNote.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success);"></i> ${userData.townName} is in ${userData.county} County and is in an eligible location for specialty affordable programs.`;
        } else {
            userData.isEligibleCounty = false;
            countyNote.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i> ${userData.townName} is outside of our service area and is not eligible for specialty affordable programs.`;
        }
    }

    // Clear and set up program cards
    const programsContainer = document.getElementById('programs-container');
    if (!programsContainer) {
        debug('Error: programs-container element not found');
        return;
    }

    programsContainer.innerHTML = ''; // Clear previous cards

    // Create separate sections for DPA and Mortgage Products
    programsContainer.innerHTML = `
        <div class="program-section" id="dpa-programs">
            <h3>Down Payment Assistance Programs</h3>
        </div>
        <div class="program-section" id="mortgage-programs">
            <h3>First Mortgage Products</h3>
        </div>
    `;

    const dpaContainer = document.getElementById('dpa-programs');
    const mortgageContainer = document.getElementById('mortgage-programs');

    if (!dpaContainer || !mortgageContainer) {
        debug('Error: DPA or Mortgage container elements not found');
        return;
    }

    const settings = loadAmiToolSettings();
    // debug('Loaded settings for eligibility check:', settings); // Can be very verbose

    const isBelow80 = incomeValue <= userData.incomeLimit80;
    const is80to100 = incomeValue > userData.incomeLimit80 && incomeValue <= userData.incomeLimit100;
    const is100to120 = incomeValue > userData.incomeLimit100 && incomeValue <= userData.incomeLimit120;
    const isAbove120 = incomeValue > userData.incomeLimit120;

    // debug('Income brackets:', {isBelow80, is80to100, is100to120, isAbove120});

    const isBristolCounty = userData.county === 'Bristol';
    const isProvidenceCounty = userData.county === 'Providence';
    const isMA = userData.state === 'MA';
    const isRI = userData.state === 'RI';

    // Process DPA Programs
    if (settings.dpaPrograms && settings.dpaPrograms.length > 0) {
        let programsAdded = 0;
        settings.dpaPrograms.forEach(program => {
            if (!program.active) return;
            let isLocationEligible = false;
            const normalizedEligibilityType = normalizeEligibilityType(program.eligibilityType);

            if (normalizedEligibilityType === "state") {
                isLocationEligible = (isMA && program.states?.ma) || (isRI && program.states?.ri);
            } else if (normalizedEligibilityType === "county" || !normalizedEligibilityType) {
                isLocationEligible = (isBristolCounty && program.counties?.bristol) || (isProvidenceCounty && program.counties?.providence);
            } else if (normalizedEligibilityType === "town") {
                // Town logic for DPA (if any program uses it)
                // Example: isLocationEligible = (isMA && program.states?.ma && program.towns?.ma?.includes(userData.townName)) || ...
            }

            if (!isLocationEligible) return;

            const incomeRanges = program.incomeRanges || { below80: true }; // Default if missing
            const isIncomeEligible =
                (isBelow80 && incomeRanges.below80) ||
                (is80to100 && incomeRanges.from80to100) ||
                (is100to120 && incomeRanges.from100to120) ||
                (isAbove120 && incomeRanges.above120);

            const programCard = document.createElement('div');
            programCard.className = 'program-card';
            programCard.classList.add(isIncomeEligible ? 'eligible' : 'ineligible');
            programCard.innerHTML = `
                <div class="program-card-header">
                    ${program.name}
                    <span class="badge ${isIncomeEligible ? 'badge-success' : 'badge-danger'}">
                        ${isIncomeEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                </div>
                <p>${program.description1 || ''}</p>
                <p>${program.description2 || ''}</p>
                <p>Your Household Income: ${formatter.format(incomeValue)}</p>
            `;
            dpaContainer.appendChild(programCard);
            programsAdded++;
        });
        if (programsAdded === 0) {
            dpaContainer.innerHTML += `<div class="program-card"><p>No DPA programs match your criteria.</p></div>`;
        }
    } else {
        dpaContainer.innerHTML = `<div class="program-card"><p>No DPA programs configured.</p></div>`;
    }

    // Process Mortgage Programs
    if (settings.mortgagePrograms && settings.mortgagePrograms.length > 0) {
        let programsAdded = 0;
        settings.mortgagePrograms.forEach(program => {
            if (!program.active) return;

            let isLocationEligible = false;
            let isIncomeEligible = false;
            let programCardInnerHTML = '';
            const normalizedEligibilityType = normalizeEligibilityType(program.eligibilityType);

            // debug(`Processing mortgage: ${program.name}`, { id: program.id, incomeLimitType: program.incomeLimitType, eligibilityType: normalizedEligibilityType });

            if (program.incomeLimitType === "fixedCompliance") { // "Buy Cities"
                const buyCitiesTowns = program.towns?.ma || []; // From settings
                isLocationEligible = normalizedEligibilityType === "town" && isMA && program.states?.ma && buyCitiesTowns.includes(userData.townName);

                if (isLocationEligible) {
                    isIncomeEligible = userData.borrowerComplianceIncome > 0 && userData.borrowerComplianceIncome <= program.maxComplianceIncome;
                    programCardInnerHTML = `
                        <div class="program-card-header">
                            ${program.name}
                            <span class="badge ${isIncomeEligible ? 'badge-success' : 'badge-danger'}">${isIncomeEligible ? 'Eligible' : 'Not Eligible'}</span>
                        </div>
                        <p>${program.description1 || ''}</p><p>${program.description2 || ''}</p>
                        <p>Your Borrower Compliance Income: ${formatter.format(userData.borrowerComplianceIncome || 0)}</p>
                        <p>Max Income Allowed: ${formatter.format(program.maxComplianceIncome)}</p>`;
                }
            } else if (program.incomeLimitType === "fixedQualifying") { // "Affordable Housing Program"
                if (normalizedEligibilityType === "county") {
                    isLocationEligible = ((isBristolCounty && program.counties?.bristol && isMA && program.states?.ma) ||
                        (isProvidenceCounty && program.counties?.providence && isRI && program.states?.ri));
                }
                if (isLocationEligible) {
                    isIncomeEligible = userData.borrowerQualifyingIncome > 0 && userData.borrowerQualifyingIncome <= program.maxQualifyingIncome;
                    programCardInnerHTML = `
                        <div class="program-card-header">
                            ${program.name}
                            <span class="badge ${isIncomeEligible ? 'badge-success' : 'badge-danger'}">${isIncomeEligible ? 'Eligible' : 'Not Eligible'}</span>
                        </div>
                        <p>${program.description1 || ''}</p><p>${program.description2 || ''}</p>
                        <p>Your Borrower Qualifying Income: ${formatter.format(userData.borrowerQualifyingIncome || 0)}</p>
                        <p>Max Income Allowed: ${formatter.format(program.maxQualifyingIncome)}</p>`;
                }
            } else { // AMI-based mortgage programs
                if (normalizedEligibilityType === "state") {
                    isLocationEligible = (isMA && program.states?.ma) || (isRI && program.states?.ri);
                } else if (normalizedEligibilityType === "county" || !normalizedEligibilityType) {
                    isLocationEligible = (isBristolCounty && program.counties?.bristol) || (isProvidenceCounty && program.counties?.providence);
                }

                if (isLocationEligible) {
                    const incomeRanges = program.incomeRanges || { below80: true, from80to100: true, from100to120: true, above120: true }; // Default all true if missing
                    isIncomeEligible =
                        (isBelow80 && incomeRanges.below80) ||
                        (is80to100 && incomeRanges.from80to100) ||
                        (is100to120 && incomeRanges.from100to120) ||
                        (isAbove120 && incomeRanges.above120);
                    programCardInnerHTML = `
                        <div class="program-card-header">
                            ${program.name}
                            <span class="badge ${isIncomeEligible ? 'badge-success' : 'badge-danger'}">${isIncomeEligible ? 'Eligible' : 'Not Eligible'}</span>
                        </div>
                        <p>${program.description1 || ''}</p><p>${program.description2 || ''}</p>
                        <p>Your Household Income: ${formatter.format(incomeValue)}</p>`;
                }
            }

            if (isLocationEligible || (program.id === "affordablehousing" && (isBristolCounty || isProvidenceCounty))) { // Ensure BuyCities and AffordableHousing show if location generally matches
                if (!programCardInnerHTML && isLocationEligible) { // Location eligible, but some other criteria (like income type not set) made it not fill innerHTML
                    let incomeToCheck = program.incomeLimitType === "fixedCompliance" ? userData.borrowerComplianceIncome : (program.incomeLimitType === "fixedQualifying" ? userData.borrowerQualifyingIncome : incomeValue);
                    let maxIncome = program.incomeLimitType === "fixedCompliance" ? program.maxComplianceIncome : (program.incomeLimitType === "fixedQualifying" ? program.maxQualifyingIncome : "N/A");
                    let incomeTypeString = program.incomeLimitType === "fixedCompliance" ? "Borrower Compliance Income" : (program.incomeLimitType === "fixedQualifying" ? "Borrower Qualifying Income" : "Household Income");
                    isIncomeEligible = false; // Default to not eligible if card innerHTML wasn't built by specific logic
                    programCardInnerHTML = `
                        <div class="program-card-header">
                            ${program.name}
                            <span class="badge badge-danger">Not Eligible</span>
                        </div>
                        <p>${program.description1 || ''}</p><p>${program.description2 || ''}</p>
                        <p>Your ${incomeTypeString}: ${formatter.format(incomeToCheck || 0)}</p>
                        ${maxIncome !== "N/A" ? `<p>Max Allowed: ${formatter.format(maxIncome)}</p>` : ''}
                        <p>Reason: Income criteria not met or specific income type not provided.</p>`;
                }


                if (programCardInnerHTML) {
                    const programCard = document.createElement('div');
                    programCard.className = 'program-card';
                    programCard.classList.add(isIncomeEligible ? 'eligible' : 'ineligible');
                    programCard.innerHTML = programCardInnerHTML;
                    mortgageContainer.appendChild(programCard);
                    programsAdded++;
                }
            }
        });
        if (programsAdded === 0) {
            mortgageContainer.innerHTML += `<div class="program-card"><p>No mortgage programs match your criteria.</p></div>`;
        }
    } else {
        mortgageContainer.innerHTML = `<div class="program-card"><p>No mortgage programs configured.</p></div>`;
    }

    // Set up print button
    const printEligibilityBtn = document.getElementById('print-eligibility-btn');
    if (printEligibilityBtn) {
        printEligibilityBtn.onclick = printResults;
    }

    // Show Step 4 (Eligibility)
    const resultSection = document.getElementById('result');
    const eligibilitySection = document.getElementById('eligibility');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');

    if (resultSection) resultSection.classList.add('hidden-form');
    if (eligibilitySection) eligibilitySection.classList.remove('hidden-form');
    if (step3) step3.classList.remove('active');
    if (step4) step4.classList.add('active');

    updateProgressBar();
}

// Helper function to normalize eligibility type
function normalizeEligibilityType(eligibilityType) {
    if (!eligibilityType) return "county"; // Default
    const type = eligibilityType.toLowerCase();
    if (type.includes("state")) return "state";
    if (type.includes("town")) return "town";
    return "county"; // Default for "county", "county-level", or anything else
}

// Helper function to normalize FIPS codes for comparison (not actively used but good utility)
function normalizeFipsCode(fipsCode) {
    if (!fipsCode) return "";
    return fipsCode.toString().replace(/[^a-zA-Z0-9]/g, '');
}

// Town selection handler with improved county detection
function handleTownSelection() {
    const townSelect = document.getElementById('town');
    const selectedOption = townSelect.options[townSelect.selectedIndex];
    const countyInfo = document.getElementById('county-info'); // Get county info display

    if (selectedOption && selectedOption.value) { // Ensure a town is selected
        let county = selectedOption.dataset.county;
        const cleanName = selectedOption.dataset.cleanName || cleanTownNameString(selectedOption.textContent);
        const originalName = selectedOption.dataset.originalName || selectedOption.textContent;

        // If county isn't in the dataset, try to get it from the mapping
        if (!county) {
            county = findCountyFromTownName(originalName); // Use original name for mapping
            if (county) {
                selectedOption.dataset.county = county; // Store for next time
            }
        }

        userData.county = county || ''; // Store county or empty string
        userData.townName = cleanName;
        userData.originalTownName = originalName;
        userData.isEligibleCounty = (county === 'Bristol' || county === 'Providence');

        debug('handleTownSelection:', { town: cleanName, county: userData.county, isEligibleCounty: userData.isEligibleCounty });

        if (countyInfo) {
            if (county) {
                if (userData.isEligibleCounty) {
                    countyInfo.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success);"></i> ${cleanName} is in ${county} County.`;
                } else {
                    countyInfo.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i> ${cleanName} is in ${county} County. Some programs may have limited eligibility.`;
                }
            } else {
                countyInfo.innerHTML = `<i class="fas fa-question-circle" style="color: var(--neutral-dark);"></i> County for ${cleanName} could not be determined.`;
            }
        }
    } else { // No town selected or placeholder selected
        userData.county = '';
        userData.townName = '';
        userData.originalTownName = '';
        userData.isEligibleCounty = false;
        if (countyInfo) {
            countyInfo.innerHTML = ''; // Clear county info
        }
    }
}

// Add county information to town options when populating the dropdown
function populateTownDropdown(towns, stateCode) {
    const townSelect = document.getElementById('town');
    if (!townSelect) return;

    townSelect.innerHTML = '<option value="">-- Select a city/town --</option>'; // Reset

    towns.forEach(town => {
        if (town.town_name) {
            const originalTownName = town.town_name;
            const cleanTownName = cleanTownNameString(originalTownName);

            const option = document.createElement('option');
            option.value = town.fips_code;
            option.textContent = cleanTownName; // Display clean name

            option.dataset.originalName = originalTownName;
            option.dataset.cleanName = cleanTownName;

            const county = findCountyFromTownName(originalTownName); // Use original for mapping
            if (county) {
                option.dataset.county = county;
            }

            // debug(`Populating dropdown: Town: "${originalTownName}", Clean: "${cleanTownName}", County: ${county || 'unknown'}`);
            townSelect.appendChild(option);
        }
    });

    // Note: The 'change' event listener for townSelect is now set up in the main DOMContentLoaded
    // to call handleTownSelection. No need to add it here again.
}

// Function to completely reset the application state
function resetToInitialState() {
    debug('Resetting application to initial state...');
    // Reset forms
    const householdForm = document.getElementById('household-form');
    if (householdForm) householdForm.reset();
    
    // Clear all income fields
    const incomeInput = document.getElementById('income-input');
    if(incomeInput) incomeInput.value = '';
    
    const complianceInput = document.getElementById('compliance-income-input');
    if(complianceInput) complianceInput.value = '';
    
    const qualifyingInput = document.getElementById('qualifying-income-input');
    if(qualifyingInput) qualifyingInput.value = '';
    
    // Reset income displays
    const complianceIncomeValue = document.getElementById('compliance-income-value');
    if(complianceIncomeValue) complianceIncomeValue.textContent = 'No income entered';
    
    const qualifyingIncomeValue = document.getElementById('qualifying-income-value');
    if(qualifyingIncomeValue) qualifyingIncomeValue.textContent = 'No income entered';
    
    const householdSizeInput = document.getElementById('household');
    if(householdSizeInput) householdSizeInput.value = '1'; // Default household size

    // Reset state card selection
    const maCard = document.getElementById('select-ma');
    const riCard = document.getElementById('select-ri');
    if (maCard) maCard.classList.remove('active');
    if (riCard) riCard.classList.remove('active');
    
    const stateField = document.getElementById('state');
    if (stateField) stateField.value = '';
    
    // Hide all sections except state form
    ['town-form', 'result', 'eligibility'].forEach(id => {
        const section = document.getElementById(id);
        if (section) section.classList.add('hidden-form');
    });
    
    const stateForm = document.getElementById('state-form');
    if (stateForm) stateForm.classList.remove('hidden-form');
    
    // Reset steps
    ['step1', 'step2', 'step3', 'step4'].forEach((id, index) => {
        const step = document.getElementById(id);
        if (step) {
            step.classList.toggle('active', index === 0);
            step.classList.remove('completed');
        }
    });
    
    updateProgressBar();
    
    // Reset user data object
    userData = {
        state: '', town: '', townName: '', originalTownName: '', county: '',
        year: 2025, householdSize: 1,
        incomeLimit50: 0, incomeLimit80: 0, incomeLimit100: 0, incomeLimit120: 0,
        isEligibleCounty: false, currentIncome: 0,
        borrowerComplianceIncome: 0, borrowerQualifyingIncome: 0
    };
    
    const townSelect = document.getElementById('town');
    if (townSelect) {
        townSelect.innerHTML = '<option value="">-- Select after choosing state --</option>';
    }
    
    const countyInfo = document.getElementById('county-info');
    if (countyInfo) countyInfo.innerHTML = '';
    
    const amiCategoryDisplay = document.getElementById('ami-category-display');
    if (amiCategoryDisplay) {
        amiCategoryDisplay.innerHTML = 'Please enter your income';
        amiCategoryDisplay.className = 'ami-category-label neutral';
    }

    // Reset income type toggle to annual
    if(document.getElementById('income-type-annual')) {
        document.getElementById('income-type-annual').checked = true;
    }

    // Update compliance and qualifying income status displays
    if (typeof updateComplianceIncomeStatus === 'function') {
        updateComplianceIncomeStatus();
    }
    
    if (typeof updateQualifyingIncomeStatus === 'function') {
        updateQualifyingIncomeStatus();
    }
    
    updateComplianceIncomeVisibility(); // This will call status updates too
    debug('Application reset complete.');
}

// Function to handle state selection and fetch towns
function handleStateSelection(state) {
    if (!state) return;
    debug(`State selected: ${state}`);
    userData.state = state;

    const stateField = document.getElementById('state');
    if (stateField) stateField.value = state;

    const maCard = document.getElementById('select-ma');
    const riCard = document.getElementById('select-ri');
    if (maCard) maCard.classList.toggle('active', state === 'MA');
    if (riCard) riCard.classList.toggle('active', state === 'RI');

    const selectedCard = document.getElementById(`select-${state.toLowerCase()}`);
    let originalCardContent = '';
    if (selectedCard) {
        originalCardContent = selectedCard.innerHTML; // Store original content
        selectedCard.innerHTML = `<div class="state-icon"><i class="fas fa-spinner fa-spin"></i></div><div class="state-name">Loading...</div>`;
    }

    fetch(`https://www.huduser.gov/hudapi/public/fmr/listCounties/${state}`, { // listCounties gives town_name for MA/RI
        headers: { 'Authorization': `Bearer ${apiToken}` }
    })
        .then(response => {
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // debug(`API response for towns in ${state}:`, data);
            if (selectedCard) selectedCard.innerHTML = originalCardContent; // Restore card

            if (Array.isArray(data)) {
                populateTownDropdown(data, state); // Use the dedicated function

                const stateForm = document.getElementById('state-form');
                const townForm = document.getElementById('town-form');
                const step1 = document.getElementById('step1');
                const step2 = document.getElementById('step2');

                if (stateForm && townForm && step1 && step2) {
                    stateForm.classList.add('hidden-form');
                    townForm.classList.remove('hidden-form');
                    step1.classList.remove('active');
                    step2.classList.add('active');
                    updateProgressBar();
                }
            } else {
                console.error('Unexpected API response structure for towns:', data);
                alert('Error loading cities/towns. Please try again.');
                if (maCard) maCard.classList.remove('active');
                if (riCard) riCard.classList.remove('active');
                if (stateField) stateField.value = '';
            }
        })
        .catch(error => {
            console.error('Error fetching towns:', error);
            alert(`Error loading cities/towns for ${state}. Please try again. ${error.message}`);
            if (selectedCard) selectedCard.innerHTML = originalCardContent; // Restore card on error
            if (maCard) maCard.classList.remove('active');
            if (riCard) riCard.classList.remove('active');
            if (stateField) stateField.value = '';
        });

    // This is also called from enhanceHandleStateSelection which is good
    updateComplianceIncomeVisibility();
}

// REMOVED setupIncomeToggleHandlers() - no longer needed as there's a global toggle
// Function to update compliance income value based on monthly/annual selection (REPLACED)
function updateComplianceIncome() {
    const complianceInput = document.getElementById('compliance-income-input');
    // Now uses the global income type toggle
    const isMonthly = document.getElementById('income-type-monthly').checked;
    let rawValue = 0;

    if (complianceInput && complianceInput.value.trim() !== '') {
        rawValue = parseFloat(complianceInput.value.replace(/,/g, ''));
        if (isNaN(rawValue)) {
            rawValue = 0;
        }
    }

    userData.borrowerComplianceIncome = isMonthly ? rawValue * 12 : rawValue;
    debug('Compliance Income SET in userData:', userData.borrowerComplianceIncome);

    updateComplianceIncomeStatus();
}

// Modify updateQualifyingIncome to use the global toggle (REPLACED)
function updateQualifyingIncome() {
    const qualifyingInput = document.getElementById('qualifying-income-input');
    // Now uses the global income type toggle
    const isMonthly = document.getElementById('income-type-monthly').checked;
    let rawValue = 0;

    if (qualifyingInput && qualifyingInput.value.trim() !== '') {
        rawValue = parseFloat(qualifyingInput.value.replace(/,/g, ''));
        if (isNaN(rawValue)) {
            rawValue = 0;
        }
    }

    userData.borrowerQualifyingIncome = isMonthly ? rawValue * 12 : rawValue;
    debug('Qualifying Income SET in userData:', userData.borrowerQualifyingIncome);

    updateQualifyingIncomeStatus();
}

// Setup for "Same as household income" copy buttons
function setupCopyButtons() {
    const copyToComplianceBtn = document.getElementById('copy-to-compliance');
    const copyToQualifyingBtn = document.getElementById('copy-to-qualifying');

    if (copyToComplianceBtn) {
        copyToComplianceBtn.addEventListener('click', function() {
            copyFromHouseholdIncome('compliance');
        });
    }

    if (copyToQualifyingBtn) {
        copyToQualifyingBtn.addEventListener('click', function() {
            copyFromHouseholdIncome('qualifying');
        });
    }
}

// Modify copyFromHouseholdIncome to use global toggle (REPLACED)
function copyFromHouseholdIncome(targetField) {
    const householdInput = document.getElementById('income-input');

    if (!householdInput || !householdInput.value) {
        alert('Please enter your household income first.');
        householdInput.focus();
        return;
    }

    const householdValueStr = householdInput.value; // This is formatted with commas

    if (targetField === 'compliance') {
        const complianceInput = document.getElementById('compliance-income-input');
        complianceInput.value = householdValueStr; // Set the formatted string value
        highlightField(complianceInput);

        // Update userData and status display by calling the main update function
        updateComplianceIncome(); // This will read the input, parse, set userData, and update status
        debug('Copied to Compliance Income. userData:', userData.borrowerComplianceIncome);
    }

    if (targetField === 'qualifying') {
        const qualifyingInput = document.getElementById('qualifying-income-input');
        qualifyingInput.value = householdValueStr; // Set the formatted string value
        highlightField(qualifyingInput);

        // Update userData and status display
        updateQualifyingIncome();
        debug('Copied to Qualifying Income. userData:', userData.borrowerQualifyingIncome);
    }
}


// Function to highlight a field with brief animation
function highlightField(field) {
    field.parentNode.classList.add('highlight-flash');
    setTimeout(function() {
        field.parentNode.classList.remove('highlight-flash');
    }, 1000);
}

// Function to update compliance income status display
function updateComplianceIncomeStatus() {
    const statusContainer = document.getElementById('compliance-income-status');
    if (!statusContainer) {
        debug('ERROR: compliance-income-status element NOT FOUND when trying to update display.');
        return;
    }

    const statusIcon = statusContainer.querySelector('.status-icon');
    const statusTitle = statusContainer.querySelector('.status-title');
    const incomeValueSpan = document.getElementById('compliance-income-value');

    const income = userData.borrowerComplianceIncome;

    debug(`updateComplianceIncomeStatus: Current userData.borrowerComplianceIncome = ${income}`);

    if (incomeValueSpan) {
        incomeValueSpan.textContent = income > 0 ? formatter.format(income) : 'No income entered';
    } else {
        debug('ERROR: #compliance-income-value span within compliance-income-status NOT FOUND.');
    }

    if (!statusIcon || !statusTitle) {
        debug('ERROR: .status-icon or .status-title not found in compliance-income-status');
    }

    if (statusIcon) statusIcon.className = 'status-icon';
    if (statusTitle) statusTitle.className = 'status-title';

    if (income === 0) {
        if (statusTitle) statusTitle.textContent = 'Waiting for input';
        if (statusIcon) statusIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
    } else if (income <= MASSHOUSING_INCOME_LIMIT) {
        if (statusTitle) statusTitle.textContent = 'Eligible';
        if (statusIcon) {
            statusIcon.className = 'status-icon eligible';
            statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        }
    } else {
        if (statusTitle) statusTitle.textContent = 'Income Exceeds Limit';
        if (statusIcon) {
            statusIcon.className = 'status-icon ineligible';
            statusIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        }
    }
}

// Function to update qualifying income status display
function updateQualifyingIncomeStatus() {
    const statusContainer = document.getElementById('qualifying-income-status');
    if (!statusContainer) {
        debug('ERROR: qualifying-income-status element NOT FOUND when trying to update display.');
        return;
    }

    const statusIcon = statusContainer.querySelector('.status-icon');
    const statusTitle = statusContainer.querySelector('.status-title');
    const incomeValueSpan = document.getElementById('qualifying-income-value');

    const income = userData.borrowerQualifyingIncome;

    debug(`updateQualifyingIncomeStatus: Current userData.borrowerQualifyingIncome = ${income}`);

    if (incomeValueSpan) {
        incomeValueSpan.textContent = income > 0 ? formatter.format(income) : 'No income entered';
    } else {
        debug('ERROR: #qualifying-income-value span within qualifying-income-status NOT FOUND.');
    }

    if (!statusIcon || !statusTitle) {
        debug('ERROR: .status-icon or .status-title not found in qualifying-income-status');
    }

    if (statusIcon) statusIcon.className = 'status-icon';
    if (statusTitle) statusTitle.className = 'status-title';

    if (income === 0) {
        if (statusTitle) statusTitle.textContent = 'Waiting for input';
        if (statusIcon) statusIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
    } else if (income <= HOMEREADY_INCOME_LIMIT) {
        if (statusTitle) statusTitle.textContent = 'Eligible';
        if (statusIcon) {
            statusIcon.className = 'status-icon eligible';
            statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        }
    } else {
        if (statusTitle) statusTitle.textContent = 'Income Exceeds Limit';
        if (statusIcon) {
            statusIcon.className = 'status-icon ineligible';
            statusIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        }
    }
}

// Function to show/hide and configure compliance income field based on state
function updateComplianceIncomeVisibility() {
    const complianceContainer = document.getElementById('compliance-income-container'); // Input field container
    const masshousingEligibilityDisplay = document.getElementById('masshousing-eligibility'); // Status display card

    const showForMA = userData.state === 'MA';

    if (complianceContainer) {
        complianceContainer.classList.toggle('state-ma', showForMA);
        if (!showForMA) {
            const complianceInput = document.getElementById('compliance-income-input');
            if (complianceInput) complianceInput.value = '';
            // userData.borrowerComplianceIncome = 0; // updateComplianceIncome will handle this if called
        }
    }
    if (masshousingEligibilityDisplay) {
        masshousingEligibilityDisplay.classList.toggle('state-ma', showForMA);
    }

    // Always update status displays as visibility might change or state might clear income
    updateComplianceIncomeStatus();
    updateQualifyingIncomeStatus(); // Keep this one general, always visible
}

// Enhance the original handleStateSelection function
if (typeof handleStateSelection === 'function') {
    const originalHandleStateSelection = handleStateSelection;
    handleStateSelection = function(state) { // Re-assign to global handleStateSelection
        originalHandleStateSelection(state);
        updateComplianceIncomeVisibility(); // Called after original logic
    };
    debug('Enhanced handleStateSelection function wraps original.');
}


// Initialize the additional functionality (This is the main DOMContentLoaded for these features)
document.addEventListener('DOMContentLoaded', function() {
    debug('Setting up additional income field handlers and listeners (main DOMContentLoaded block for these).');

    // REMOVED setupIncomeToggleHandlers();

    setupCopyButtons();

    const complianceIncomeInput = document.getElementById('compliance-income-input');
    if (complianceIncomeInput) {
        complianceIncomeInput.addEventListener('input', function() {
            formatCurrency(this);
            updateComplianceIncome();
        });
    }

    const qualifyingIncomeInput = document.getElementById('qualifying-income-input');
    if (qualifyingIncomeInput) {
        qualifyingIncomeInput.addEventListener('input', function() {
            formatCurrency(this);
            updateQualifyingIncome();
        });
    }

    // Initial call to set visibility and status based on default/loaded state
    updateComplianceIncomeVisibility();
});