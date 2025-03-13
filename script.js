// Load settings from localStorage
function loadAmiToolSettings() {
    try {
        const savedSettings = localStorage.getItem('amiToolSettings');
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
    
    // Return default settings if nothing is saved or there's an error
    return {
        year: "2024",
        dpaPrograms: [
            // Default programs would be included here...
        ],
        mortgagePrograms: [
            // Default mortgage programs would be included here...
        ]
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    debug('DOM fully loaded, setting up event listeners');
    
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
    
    // Add event listeners for income type toggles
    const incomeMonthly = document.getElementById('income-monthly');
    const incomeAnnual = document.getElementById('income-annual');
    
    if (incomeMonthly) {
        incomeMonthly.addEventListener('change', function() {
            if (this.checked) {
                const incomeInput = document.getElementById('income-input');
                if (incomeInput) {
                    incomeInput.setAttribute('placeholder', 'Enter monthly income');
                    const label = document.querySelector('label[for="income-input"]');
                    if (label) {
                        label.innerHTML = 'Enter Your Monthly Household Income: <div class="tooltip"><i class="fas fa-info-circle"></i><span class="tooltip-text">Monthly income will be converted to annual</span></div>';
                    }
                    
                    // Update AMI calculation for already entered value
                    updateAMIPercentage();
                }
            }
        });
    }
    
    if (incomeAnnual) {
        incomeAnnual.addEventListener('change', function() {
            if (this.checked) {
                const incomeInput = document.getElementById('income-input');
                if (incomeInput) {
                    incomeInput.setAttribute('placeholder', 'Enter annual income');
                    const label = document.querySelector('label[for="income-input"]');
                    if (label) {
                        label.innerHTML = 'Enter Your Annual Household Income: <div class="tooltip"><i class="fas fa-info-circle"></i><span class="tooltip-text">Enter total annual income for all household members</span></div>';
                    }
                    
                    // Update AMI calculation for already entered value
                    updateAMIPercentage();
                }
            }
        });
    }

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
            const countyInfo = document.getElementById('county-info');
            
            if (selectedOption && selectedOption.dataset.county) {
                const county = selectedOption.dataset.county;
                userData.county = county;
                
                // Always use the cleaned town name
                userData.townName = selectedOption.dataset.cleanName || cleanTownNameString(selectedOption.textContent);
                userData.originalTownName = selectedOption.dataset.originalName || selectedOption.textContent;
                
                debug('Town selected:', {
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
        });
    }

    // Household form submission
    const householdForm = document.getElementById('household-form');
    if (householdForm) {
        householdForm.addEventListener('submit', function(event) {
            event.preventDefault();
            debug('Household form submitted');

            const townCode = document.getElementById('town').value;
            const year = settings.year || "2024";
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
                    const il50Data = data.data.very_low;
                    const il80Data = data.data.low;
                    const il50Key = `il50_p${householdSize}`;
                    const il80Key = `il80_p${householdSize}`;
                    
                    const incomeLimit50 = il50Data[il50Key];
                    const incomeLimit80 = il80Data[il80Key];

                    if (incomeLimit50 && incomeLimit80) {
                        // Update the results UI
                        updateResults(incomeLimit50, incomeLimit80, householdSize);
                    } else {
                        alert(`No income limit data available for ${householdSize} people.`);
                    }
                } else {
                    console.error('Unexpected response structure:', data);
                    alert('Error calculating income limits. Please try again.');
                }
                
                // Reset button
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
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
});// Enable debugging
const DEBUG = true;

// Global user data
let userData = {
    state: '',
    town: '',
    townName: '',
    county: '',
    year: 2024,
    householdSize: 1,
    incomeLimit50: 0,
    incomeLimit80: 0,
    incomeLimit100: 0,
    incomeLimit120: 0,
    isEligibleCounty: false,
    currentIncome: 0
};

// Town to county mapping for eligibility checking
const countyMapping = {
    // Massachusetts - Bristol County towns
    'Attleboro': 'Bristol',
    'Berkley': 'Bristol',
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

// Function to update AMI category as user types
function updateAMIPercentage() {
    const incomeInput = document.getElementById('income-input');
    // Remove commas from the input value before parsing
    let incomeValue = parseFloat(incomeInput.value.replace(/,/g, '')) || 0;
    
    // Check if monthly income is selected and convert to annual
    const incomeTypeMonthly = document.getElementById('income-monthly').checked;
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
        if (data) {
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
    debug(`County not found for town: ${townName}, cleaned: ${cleanName}`);
    return '';
}

// Helper function to standardize town name cleaning
function cleanTownNameString(townName) {
    if (!townName) return '';
    
    // Remove " city", " town", " City", " Town" suffixes
    let cleanName = townName.replace(/ city$| town$| City$| Town$/, '');
    
    // Additional cleaning for more variations
    cleanName = cleanName.replace(/ CDP$| cdp$/, ''); // For Census Designated Places
    cleanName = cleanName.replace(/ village$| Village$/, ''); // For Villages
    
    debug(`Cleaned town name from "${townName}" to "${cleanName}"`);
    return cleanName;
}

// Update AMI results - For Step 3
function updateResults(incomeLimit50, incomeLimit80, householdSize) {
    debug('Updating results with:', {incomeLimit50, incomeLimit80, householdSize});
    debug('Current user data:', userData);
    
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

    // Clear any existing income input
    const incomeInput = document.getElementById('income-input');
    if (incomeInput) {
        incomeInput.value = '';
    }

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

// Check eligibility - For Step 4
// Replace the checkEligibility function with this updated version
function checkEligibility() {
    debug('Checking eligibility');
    debug('Current userData:', userData);
    
    // Get the income value
    let incomeValue = userData.currentIncome;
    
    // If no income value stored, get it from the input
    if (incomeValue === 0) {
        const incomeInput = document.getElementById('income-input');
        if (incomeInput) {
            // Remove commas from the input value before parsing
            incomeValue = parseFloat(incomeInput.value.replace(/,/g, '')) || 0;
            
            // Check if monthly income is selected and convert to annual
            const incomeTypeMonthly = document.getElementById('income-monthly').checked;
            if (incomeTypeMonthly) {
                incomeValue = incomeValue * 12;
            }
            
            // Store for later use
            userData.currentIncome = incomeValue;
        }
    }
    
    // Set county eligibility notice
    const countyNote = document.getElementById('county-eligibility-note');
    
    // Double-check that we have the town name
    if (!userData.townName || userData.townName === '') {
        // Try to retrieve it one more time
        const townSelect = document.getElementById('town');
        if (townSelect && townSelect.selectedIndex > 0) {
            const selectedOption = townSelect.options[townSelect.selectedIndex];
            userData.townName = selectedOption.dataset.cleanName || cleanTownNameString(selectedOption.textContent);
            userData.county = selectedOption.dataset.county || '';
        }
        
        // If still empty, use a fallback
        if (!userData.townName || userData.townName === '') {
            userData.townName = "Your selected town";
        }
    }
    
    if (countyNote) {
        if (userData.isEligibleCounty) {
            countyNote.innerHTML = `<i class="fas fa-check-circle" style="color: var(--success);"></i> ${userData.townName} is in ${userData.county} County and is eligible for downpayment assistance programs.`;
        } else {
            countyNote.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i> ${userData.townName} is not in Bristol or Providence County and is not eligible for downpayment assistance programs.`;
        }
    }

    // Clear and set up program cards
    const programsContainer = document.getElementById('programs-container');
    if (!programsContainer) {
        debug('Error: programs-container element not found');
        return;
    }
    
    programsContainer.innerHTML = '';

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
    
    // Make sure containers exist before proceeding
    if (!dpaContainer || !mortgageContainer) {
        debug('Error: DPA or Mortgage container elements not found');
        return;
    }

    // Only display program options if in eligible county
    if (userData.isEligibleCounty) {
        // Load settings
        const settings = loadAmiToolSettings();
        
        // Determine which income bracket the user falls into
        const isBelow80 = incomeValue <= userData.incomeLimit80;
        const is80to100 = incomeValue > userData.incomeLimit80 && incomeValue <= userData.incomeLimit100;
        const is100to120 = incomeValue > userData.incomeLimit100 && incomeValue <= userData.incomeLimit120;
        const isAbove120 = incomeValue > userData.incomeLimit120;
        
        // Determine which county the user is in
        const isBristolCounty = userData.county === 'Bristol';
        const isProvidenceCounty = userData.county === 'Providence';
        
        // Process DPA Programs
        if (settings.dpaPrograms && dpaContainer) {
            settings.dpaPrograms.forEach(program => {
                // Skip inactive programs
                if (!program.active) return;
                
                // Check county eligibility
                const isCountyEligible = 
                    (isBristolCounty && program.counties.bristol) || 
                    (isProvidenceCounty && program.counties.providence);
                
                if (!isCountyEligible) return;
                
                // Check income eligibility
                const isIncomeEligible = 
                    (isBelow80 && program.incomeRanges.below80) ||
                    (is80to100 && program.incomeRanges.from80to100) ||
                    (is100to120 && program.incomeRanges.from100to120) ||
                    (isAbove120 && program.incomeRanges.above120);
                
                // Create program card
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
                    <p>${program.description1}</p>
                    <p>${program.description2}</p>
                    <p>Your income: ${formatter.format(incomeValue)}</p>
                `;
                
                dpaContainer.appendChild(programCard);
            });
        }
        
        // Process Mortgage Programs
        if (settings.mortgagePrograms && mortgageContainer) {
            settings.mortgagePrograms.forEach(program => {
                // Skip inactive programs
                if (!program.active) return;
                
                // Check county eligibility
                const isCountyEligible = 
                    (isBristolCounty && program.counties.bristol) || 
                    (isProvidenceCounty && program.counties.providence);
                
                if (!isCountyEligible) return;
                
                // Check income eligibility
                const isIncomeEligible = 
                    (isBelow80 && program.incomeRanges.below80) ||
                    (is80to100 && program.incomeRanges.from80to100) ||
                    (is100to120 && program.incomeRanges.from100to120) ||
                    (isAbove120 && program.incomeRanges.above120);
                
                // Create program card
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
                    <p>${program.description1}</p>
                    <p>${program.description2}</p>
                    <p>Your income: ${formatter.format(incomeValue)}</p>
                `;
                
                mortgageContainer.appendChild(programCard);
            });
        }
    } else {
        // Not in eligible county
        const ineligibleCard = document.createElement('div');
        ineligibleCard.className = 'program-card ineligible';
        ineligibleCard.innerHTML = `
            <div class="program-card-header">
                All Programs
                <span class="badge badge-danger">Not Eligible</span>
            </div>
            <p>Down payment assistance and mortgage products are only available to residents in Bristol County, MA and Providence County, RI.</p>
            <p>${userData.townName} is in ${userData.county || 'a different'} County and does not qualify for these programs.</p>
        `;
        dpaContainer.appendChild(ineligibleCard);
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
    
    // Update progress bar
    updateProgressBar();
}

// Function to completely reset the application state
function resetToInitialState() {
    // Reset forms
    const householdForm = document.getElementById('household-form');
    
    if (householdForm) householdForm.reset();
    
    // Reset state card selection
    const maCard = document.getElementById('select-ma');
    const riCard = document.getElementById('select-ri');
    if (maCard) maCard.classList.remove('active');
    if (riCard) riCard.classList.remove('active');
    
    // Reset state hidden field
    const stateField = document.getElementById('state');
    if (stateField) stateField.value = '';
    
    // Hide all sections except state form
    const sections = ['town-form', 'result', 'eligibility'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.classList.add('hidden-form');
    });
    
    // Show state form
    const stateForm = document.getElementById('state-form');
    if (stateForm) stateForm.classList.remove('hidden-form');
    
    // Reset steps
    const steps = ['step1', 'step2', 'step3', 'step4'];
    steps.forEach((id, index) => {
        const step = document.getElementById(id);
        if (step) {
            if (index === 0) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
                step.classList.remove('completed');
            }
        }
    });
    
    // Reset progress bar
    updateProgressBar();
    
    // Reset user data
    userData = {
        state: '',
        town: '',
        townName: '',
        county: '',
        year: 2024,
        householdSize: 1,
        incomeLimit50: 0,
        incomeLimit80: 0,
        incomeLimit100: 0,
        incomeLimit120: 0,
        isEligibleCounty: false,
        currentIncome: 0
    };
    
    // Reset town dropdown if it exists
    const townSelect = document.getElementById('town');
    if (townSelect) {
        townSelect.innerHTML = '<option value="">-- Select after choosing state --</option>';
    }
    
    // Reset county info if it exists
    const countyInfo = document.getElementById('county-info');
    if (countyInfo) {
        countyInfo.innerHTML = '';
    }
    
    debug('Application reset to initial state');
}

// Function to handle state selection and fetch towns
function handleStateSelection(state) {
    if (!state) return;
    
    userData.state = state;
    
    // Update UI for selected state
    const stateField = document.getElementById('state');
    if (stateField) stateField.value = state;
    
    const maCard = document.getElementById('select-ma');
    const riCard = document.getElementById('select-ri');
    
    if (state === 'MA' && maCard) {
        maCard.classList.add('active');
        if (riCard) riCard.classList.remove('active');
    } else if (state === 'RI' && riCard) {
        riCard.classList.add('active');
        if (maCard) maCard.classList.remove('active');
    }

    // Show loading state in UI
    const selectedCard = document.getElementById(`select-${state.toLowerCase()}`);
    if (selectedCard) {
        const originalContent = selectedCard.innerHTML;
        selectedCard.innerHTML = `
            <div class="state-icon"><i class="fas fa-spinner fa-spin"></i></div>
            <div class="state-name">Loading...</div>
        `;
        
        // Store the original content to restore later
        selectedCard.dataset.originalContent = originalContent;
    }

    // Fetch cities/towns for the selected state
    fetch(`https://www.huduser.gov/hudapi/public/fmr/listCounties/${state}`, {
        headers: {
            'Authorization': `Bearer ${apiToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        debug('API response for towns:', data);
        
        // Restore the original content of the state card
        if (selectedCard && selectedCard.dataset.originalContent) {
            selectedCard.innerHTML = selectedCard.dataset.originalContent;
        }
        
        if (Array.isArray(data)) {
            const towns = data;
            const townSelect = document.getElementById('town');
            if (townSelect) {
                townSelect.innerHTML = '<option value="">-- Select a city/town --</option>';

                towns.forEach(town => {
                    if (town.town_name) {
                        // Clean up town name by removing any suffixes
                        const cleanTownName = cleanTownNameString(town.town_name);
                        
                        const option = document.createElement('option');
                        option.value = town.fips_code;
                        
                        // Display the clean name in the dropdown instead of the full name
                        option.textContent = cleanTownName;
                        
                        // Store both the original and clean names
                        option.dataset.originalName = town.town_name;
                        option.dataset.cleanName = cleanTownName;
                        
                        // Find county for this town
                        const county = findCountyFromTownName(town.town_name);
                        option.dataset.county = county;
                        
                        // Log county mapping for debugging
                        debug(`Town: ${town.town_name}, Clean: ${cleanTownName}, County: ${county}`);
                        
                        townSelect.appendChild(option);
                    }
                });

                // Move to next step
                const stateForm = document.getElementById('state-form');
                const townForm = document.getElementById('town-form');
                const step1 = document.getElementById('step1');
                const step2 = document.getElementById('step2');
                
                if (stateForm && townForm && step1 && step2) {
                    stateForm.classList.add('hidden-form');
                    townForm.classList.remove('hidden-form');
                    step1.classList.remove('active');
                    step2.classList.add('active');
                    
                    // Update progress bar
                    updateProgressBar();
                }
            }
        } else {
            console.error('Unexpected response structure:', data);
            alert('Error loading cities/towns. Please try again.');
            
            // Reset the state selection if there was an error
            const maCard = document.getElementById('select-ma');
            const riCard = document.getElementById('select-ri');
            if (maCard) maCard.classList.remove('active');
            if (riCard) riCard.classList.remove('active');
            
            // Reset state hidden field
            const stateField = document.getElementById('state');
            if (stateField) stateField.value = '';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error loading cities/towns. Please try again.');
        
        // Reset the state selection if there was an error
        const maCard = document.getElementById('select-ma');
        const riCard = document.getElementById('select-ri');
        if (maCard) maCard.classList.remove('active');
        if (riCard) riCard.classList.remove('active');
        
        // Reset state hidden field
        const stateField = document.getElementById('state');
        if (stateField) stateField.value = '';
        
        // Restore the original content of the state card
        if (selectedCard && selectedCard.dataset.originalContent) {
            selectedCard.innerHTML = selectedCard.dataset.originalContent;
        }
    });
}
