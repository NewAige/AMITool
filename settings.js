// Add a program to the UI
function addProgramToUI(container, program) {
    const template = document.getElementById('program-template');
    if (!template) return;
    
    const clone = document.importNode(template.content, true);
    const programCard = clone.querySelector('.program-settings-card');
    
    // Set program ID and eligibility type as data attributes
    programCard.dataset.programId = program.id;
    programCard.dataset.eligibilityType = program.eligibilityType || 'county';
    
    // Set program name
    const nameInput = programCard.querySelector('.program-name');
    if (nameInput) nameInput.value = program.name;
    
    // Set active state
    const activeCheckbox = programCard.querySelector('.program-active');
    if (activeCheckbox) activeCheckbox.checked = program.active;
    
    // Set state checkboxes
    const maStateCheckbox = programCard.querySelector('.state-ma');
    if (maStateCheckbox && program.states) maStateCheckbox.checked = program.states.ma;
    
    const riStateCheckbox = programCard.querySelector('.state-ri');
    if (riStateCheckbox && program.states) riStateCheckbox.checked = program.states.ri;
    
    // Set county checkboxes
    const bristolCheckbox = programCard.querySelector('.county-bristol');
    if (bristolCheckbox) bristolCheckbox.checked = program.counties.bristol;
    
    const providenceCheckbox = programCard.querySelector('.county-providence');
    if (providenceCheckbox) providenceCheckbox.checked = program.counties.providence;
    
    const otherCountiesCheckbox = programCard.querySelector('.county-other');
    if (otherCountiesCheckbox && program.counties.other !== undefined) 
        otherCountiesCheckbox.checked = program.counties.other;
    
    // Set income range checkboxes
    const below80Checkbox = programCard.querySelector('.income-80');
    if (below80Checkbox) below80Checkbox.checked = program.incomeRanges.below80;
    
    const from80to100Checkbox = programCard.querySelector('.income-80-100');
    if (from80to100Checkbox) from80to100Checkbox.checked = program.incomeRanges.from80to100;
    
    const from100to120Checkbox = programCard.querySelector('.income-100-120');
    if (from100to120Checkbox) from100to120Checkbox.checked = program.incomeRanges.from100to120;
    
    const above120Checkbox = programCard.querySelector('.income-above-120');
    if (above120Checkbox) above120Checkbox.checked = program.incomeRanges.above120;
    
    // Set descriptions
    const desc1Input = programCard.querySelector('.program-desc-1');
    if (desc1Input) desc1Input.value = program.description1;
    
    const desc2Input = programCard.querySelector('.program-desc-2');
    if (desc2Input) desc2Input.value = program.description2;
    
    // Set up tab activation based on eligibility type
    const tabButtons = programCard.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === (program.eligibilityType || 'county')) {
            btn.classList.add('active');
        }
    });
    
    const tabContents = programCard.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.dataset.tab === (program.eligibilityType || 'county')) {
            content.classList.add('active');
        }
    });
    
    // Set town selections if available
    const maTownSelect = programCard.querySelector('.town-select-ma');
    if (maTownSelect && program.towns && program.towns.ma) {
        // Wait for towns to be loaded
        setTimeout(() => {
            program.towns.ma.forEach(town => {
                const option = Array.from(maTownSelect.options).find(opt => opt.value === town.code);
                if (option) option.selected = true;
            });
        }, 500);
    }
    
    const riTownSelect = programCard.querySelector('.town-select-ri');
    if (riTownSelect && program.towns && program.towns.ri) {
        // Wait for towns to be loaded
        setTimeout(() => {
            program.towns.ri.forEach(town => {
                const option = Array.from(riTownSelect.options).find(opt => opt.value === town.code);
                if (option) option.selected = true;
            });
        }, 500);
    }
    
    // Set up delete button
    const deleteButton = programCard.querySelector('.delete-program');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this program?')) {
                programCard.remove();
                showStatusMessage('Program deleted successfully', 'success');
            }
        });
    }
    
    /* Removing tab event listeners for individual cards since we're using event delegation
    // Set up the tab switching for this specific program card
    programCard.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab button in this card
            programCard.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active tab content in this card
            programCard.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            programCard.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
            
            // Set the eligibility type on the parent program card
            programCard.dataset.eligibilityType = tabId;
        });
    });
    */
    
    container.appendChild(programCard);
}// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
    
    // Set up delegation for tab switching that will work for dynamically added elements
    document.addEventListener('click', function(event) {
        // Check if clicked element is a tab button
        if (event.target.classList.contains('tab-btn') || event.target.closest('.tab-btn')) {
            const button = event.target.classList.contains('tab-btn') ? event.target : event.target.closest('.tab-btn');
            const tabId = button.dataset.tab;
            const programCard = button.closest('.program-settings-card');
            
            if (programCard && tabId) {
                // Update active tab button in this specific card
                programCard.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                // Update active tab content in this specific card
                programCard.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                programCard.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
                
                // Set the eligibility type on the parent program card
                programCard.dataset.eligibilityType = tabId;
            }
        }
    });
});

// Load town data for MA and RI
let maTowns = [];
let riTowns = [];

// Default settings structure
const defaultSettings = {
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
            counties: {
                bristol: true,
                providence: true
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
            counties: {
                bristol: true,
                providence: true
            },
            incomeRanges: {
                below80: false,
                from80to100: false,
                from100to120: true,
                above120: false
            },
            description1: "For households with income between 100.01% and 120% AMI",
            description2: "Provides $10,000 in downpayment assistance"
        },
        {
            id: "ebp",
            name: "Federal Home Loan Bank of Boston: Equity Builder Program",
            active: true,
            counties: {
                bristol: true,
                providence: true
            },
            incomeRanges: {
                below80: true,
                from80to100: false,
                from100to120: false,
                above120: false
            },
            description1: "For households with income at or below 80% AMI",
            description2: "Program provided through Federal Home Loan Bank of Boston"
        },
        {
            id: "how",
            name: "Federal Home Loan Bank of Boston: Housing Our Workforce",
            active: true,
            counties: {
                bristol: true,
                providence: true
            },
            incomeRanges: {
                below80: false,
                from80to100: true,
                from100to120: true,
                above120: false
            },
            description1: "For households with income between 80.01% and 120% AMI",
            description2: "Program provided through Federal Home Loan Bank of Boston"
        }
    ],
    mortgagePrograms: [
        {
            id: "fthb",
            name: "First Time Homebuyer",
            active: true,
            counties: {
                bristol: true,
                providence: true
            },
            incomeRanges: {
                below80: true,
                from80to100: true,
                from100to120: true,
                above120: true
            },
            description1: "No income limit, but must be a first-time homebuyer",
            description2: "Available in Providence County, RI or Bristol County, MA"
        },
        {
            id: "pcp",
            name: "Providence County Pathway",
            active: true,
            counties: {
                bristol: false,
                providence: true
            },
            incomeRanges: {
                below80: true,
                from80to100: true,
                from100to120: true,
                above120: false
            },
            description1: "Must be at or below 120% AMI",
            description2: "Only available in Providence County, RI"
        },
        {
            id: "exclusive80",
            name: "Exclusive BCSB HomeBuyer",
            active: true,
            counties: {
                bristol: true,
                providence: true
            },
            incomeRanges: {
                below80: true,
                from80to100: false,
                from100to120: false,
                above120: false
            },
            description1: "Must be at or below 80% AMI",
            description2: "Available in Bristol County, MA or Providence County, RI"
        }
    ]
};

// Load settings from localStorage or use defaults
function loadSettings() {
    let settings;
    
    try {
        const savedSettings = localStorage.getItem('amiToolSettings');
        settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
        console.error('Error loading settings:', error);
        settings = defaultSettings;
    }
    
    // Set year dropdown
    const yearSelect = document.getElementById('settings-year');
    if (yearSelect) {
        yearSelect.value = settings.year || "2024";
    }
    
    // Load DPA programs
    const dpaContainer = document.getElementById('dpa-programs-container');
    if (dpaContainer && settings.dpaPrograms) {
        dpaContainer.innerHTML = ''; // Clear existing programs
        settings.dpaPrograms.forEach(program => {
            addProgramToUI(dpaContainer, program);
        });
    }
    
    // Load mortgage programs
    const mortgageContainer = document.getElementById('mortgage-programs-container');
    if (mortgageContainer && settings.mortgagePrograms) {
        mortgageContainer.innerHTML = ''; // Clear existing programs
        settings.mortgagePrograms.forEach(program => {
            addProgramToUI(mortgageContainer, program);
        });
    }
}

// Fetch town data for MA and RI
async function fetchTowns() {
    const apiToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI2IiwianRpIjoiZmM3YWYxYzMwNjBhYmM1NTVjN2IyYzc0YzFiOWQ3YTBmYmIzMjg1NzkxYTYwNTVmOTMyOGIxNTk1MzczNjM3MDAwY2Y1YzQ1MmZmMjYwZWUiLCJpYXQiOjE3MTk2OTE3MTQuMTI0MjAyLCJuYmYiOjE3MTk2OTE3MTQuMTI0MjA0LCJleHAiOjIwMzUyMjQ1MTQuMTIwNjc3LCJzdWIiOiI3MzA3NCIsInNjb3BlcyI6W119.QOAzQdjx3I_j6sHIHNMKTYaE7UIag-sXs5AQQZvRDfCTVuko2IOYrIMDObisKgZgWMy01RcWAOUtQxkAVDn1Fg';
    
    try {
        // Fetch MA towns
        const maResponse = await fetch(`https://www.huduser.gov/hudapi/public/fmr/listCounties/MA`, {
            headers: {
                'Authorization': `Bearer ${apiToken}`
            }
        });
        const maData = await maResponse.json();
        if (Array.isArray(maData)) {
            maTowns = maData.map(town => ({
                code: town.fips_code,
                name: cleanTownNameString(town.town_name)
            }));
            
            // Populate MA town selects
            const maTownSelects = document.querySelectorAll('.town-select-ma');
            maTownSelects.forEach(select => {
                select.innerHTML = '';
                maTowns.forEach(town => {
                    const option = document.createElement('option');
                    option.value = town.code;
                    option.textContent = town.name;
                    select.appendChild(option);
                });
            });
        }
        
        // Fetch RI towns
        const riResponse = await fetch(`https://www.huduser.gov/hudapi/public/fmr/listCounties/RI`, {
            headers: {
                'Authorization': `Bearer ${apiToken}`
            }
        });
        const riData = await riResponse.json();
        if (Array.isArray(riData)) {
            riTowns = riData.map(town => ({
                code: town.fips_code,
                name: cleanTownNameString(town.town_name)
            }));
            
            // Populate RI town selects
            const riTownSelects = document.querySelectorAll('.town-select-ri');
            riTownSelects.forEach(select => {
                select.innerHTML = '';
                riTowns.forEach(town => {
                    const option = document.createElement('option');
                    option.value = town.code;
                    option.textContent = town.name;
                    select.appendChild(option);
                });
            });
        }
    } catch (error) {
        console.error('Error fetching towns:', error);
    }
}

// Helper function to clean town names
function cleanTownNameString(townName) {
    if (!townName) return '';
    
    // Remove " city", " town", " City", " Town" suffixes
    let cleanName = townName.replace(/ city$| town$| City$| Town$/, '');
    
    // Additional cleaning for more variations
    cleanName = cleanName.replace(/ CDP$| cdp$/, ''); // For Census Designated Places
    cleanName = cleanName.replace(/ village$| Village$/, ''); // For Villages
    
    return cleanName;
}

// Set up event listeners
function setupEventListeners() {
    // Load towns for the town selector
    fetchTowns();
    
    /* Removing the old tab event listeners since we're using event delegation instead
    // Set up tab switching for location eligibility
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
            
            // Set the eligibility type on the parent program card
            const programCard = this.closest('.program-settings-card');
            if (programCard) {
                programCard.dataset.eligibilityType = tabId;
            }
        });
    });
    */
    
    // General settings form submit
    const generalSettingsForm = document.getElementById('general-settings-form');
    if (generalSettingsForm) {
        generalSettingsForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveGeneralSettings();
        });
    }
    
    // Add DPA program button
    const addDpaBtn = document.getElementById('add-dpa-program');
    if (addDpaBtn) {
        addDpaBtn.addEventListener('click', function() {
            const dpaContainer = document.getElementById('dpa-programs-container');
            if (dpaContainer) {
                const newProgram = {
                    id: 'dpa_' + Date.now(),
                    name: "New DPA Program",
                    active: true,
                    counties: {
                        bristol: true,
                        providence: true
                    },
                    incomeRanges: {
                        below80: true,
                        from80to100: false,
                        from100to120: false,
                        above120: false
                    },
                    description1: "Enter description here",
                    description2: "Enter additional information here"
                };
                
                addProgramToUI(dpaContainer, newProgram);
            }
        });
    }
    
    // Add mortgage program button
    const addMortgageBtn = document.getElementById('add-mortgage-program');
    if (addMortgageBtn) {
        addMortgageBtn.addEventListener('click', function() {
            const mortgageContainer = document.getElementById('mortgage-programs-container');
            if (mortgageContainer) {
                const newProgram = {
                    id: 'mortgage_' + Date.now(),
                    name: "New Mortgage Product",
                    active: true,
                    counties: {
                        bristol: true,
                        providence: true
                    },
                    incomeRanges: {
                        below80: true,
                        from80to100: true,
                        from100to120: true,
                        above120: false
                    },
                    description1: "Enter description here",
                    description2: "Enter additional information here"
                };
                
                addProgramToUI(mortgageContainer, newProgram);
            }
        });
    }
    
    // Save all settings button
    const saveAllBtn = document.getElementById('save-all-settings');
    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', function() {
            saveAllSettings();
        });
    }
}

// Add a program to the UI
function addProgramToUI(container, program) {
    const template = document.getElementById('program-template');
    if (!template) return;
    
    const clone = document.importNode(template.content, true);
    const programCard = clone.querySelector('.program-settings-card');
    
    // Set program ID and eligibility type as data attributes
    programCard.dataset.programId = program.id;
    programCard.dataset.eligibilityType = program.eligibilityType || 'county';
    
    // Set program name
    const nameInput = programCard.querySelector('.program-name');
    if (nameInput) nameInput.value = program.name;
    
    // Set active state
    const activeCheckbox = programCard.querySelector('.program-active');
    if (activeCheckbox) activeCheckbox.checked = program.active;
    
    // Set state checkboxes
    const maStateCheckbox = programCard.querySelector('.state-ma');
    if (maStateCheckbox && program.states) maStateCheckbox.checked = program.states.ma;
    
    const riStateCheckbox = programCard.querySelector('.state-ri');
    if (riStateCheckbox && program.states) riStateCheckbox.checked = program.states.ri;
    
    // Set county checkboxes
    const bristolCheckbox = programCard.querySelector('.county-bristol');
    if (bristolCheckbox) bristolCheckbox.checked = program.counties.bristol;
    
    const providenceCheckbox = programCard.querySelector('.county-providence');
    if (providenceCheckbox) providenceCheckbox.checked = program.counties.providence;
    
    const otherCountiesCheckbox = programCard.querySelector('.county-other');
    if (otherCountiesCheckbox && program.counties.other !== undefined) 
        otherCountiesCheckbox.checked = program.counties.other;
    
    // Set income range checkboxes
    const below80Checkbox = programCard.querySelector('.income-80');
    if (below80Checkbox) below80Checkbox.checked = program.incomeRanges.below80;
    
    const from80to100Checkbox = programCard.querySelector('.income-80-100');
    if (from80to100Checkbox) from80to100Checkbox.checked = program.incomeRanges.from80to100;
    
    const from100to120Checkbox = programCard.querySelector('.income-100-120');
    if (from100to120Checkbox) from100to120Checkbox.checked = program.incomeRanges.from100to120;
    
    const above120Checkbox = programCard.querySelector('.income-above-120');
    if (above120Checkbox) above120Checkbox.checked = program.incomeRanges.above120;
    
    // Set descriptions
    const desc1Input = programCard.querySelector('.program-desc-1');
    if (desc1Input) desc1Input.value = program.description1;
    
    const desc2Input = programCard.querySelector('.program-desc-2');
    if (desc2Input) desc2Input.value = program.description2;
    
    // Set up tab activation based on eligibility type
    const tabButtons = programCard.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === program.eligibilityType) {
            btn.classList.add('active');
        }
    });
    
    const tabContents = programCard.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.dataset.tab === program.eligibilityType) {
            content.classList.add('active');
        }
    });
    
    // Set town selections if available
    const maTownSelect = programCard.querySelector('.town-select-ma');
    if (maTownSelect && program.towns && program.towns.ma) {
        // Wait for towns to be loaded
        setTimeout(() => {
            program.towns.ma.forEach(town => {
                const option = Array.from(maTownSelect.options).find(opt => opt.value === town.code);
                if (option) option.selected = true;
            });
        }, 500);
    }
    
    const riTownSelect = programCard.querySelector('.town-select-ri');
    if (riTownSelect && program.towns && program.towns.ri) {
        // Wait for towns to be loaded
        setTimeout(() => {
            program.towns.ri.forEach(town => {
                const option = Array.from(riTownSelect.options).find(opt => opt.value === town.code);
                if (option) option.selected = true;
            });
        }, 500);
    }
    
    // Set up delete button
    const deleteButton = programCard.querySelector('.delete-program');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this program?')) {
                programCard.remove();
                showStatusMessage('Program deleted successfully', 'success');
            }
        });
    }
    
    // Set up the tab switching for this specific program card
    programCard.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab button in this card
            programCard.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update active tab content in this card
            programCard.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            programCard.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
            
            // Set the eligibility type on the parent program card
            programCard.dataset.eligibilityType = tabId;
        });
    });
    
    container.appendChild(programCard);
}

// Save general settings
function saveGeneralSettings() {
    const yearSelect = document.getElementById('settings-year');
    if (!yearSelect) return;
    
    const year = yearSelect.value;
    
    // Get current settings
    let settings;
    try {
        const savedSettings = localStorage.getItem('amiToolSettings');
        settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
        console.error('Error loading settings:', error);
        settings = defaultSettings;
    }
    
    // Update year
    settings.year = year;
    
    // Save settings
    try {
        localStorage.setItem('amiToolSettings', JSON.stringify(settings));
        showStatusMessage('General settings saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showStatusMessage('Error saving settings. Please try again.', 'error');
    }
}

// Save all settings
function saveAllSettings() {
    const yearSelect = document.getElementById('settings-year');
    if (!yearSelect) return;
    
    const year = yearSelect.value;
    
    // Collect DPA programs
    const dpaPrograms = [];
    const dpaCards = document.querySelectorAll('#dpa-programs-container .program-settings-card');
    dpaCards.forEach(card => {
        const program = getProgramFromCard(card);
        if (program) dpaPrograms.push(program);
    });
    
    // Collect mortgage programs
    const mortgagePrograms = [];
    const mortgageCards = document.querySelectorAll('#mortgage-programs-container .program-settings-card');
    mortgageCards.forEach(card => {
        const program = getProgramFromCard(card);
        if (program) mortgagePrograms.push(program);
    });
    
    // Create settings object
    const settings = {
        year: year,
        dpaPrograms: dpaPrograms,
        mortgagePrograms: mortgagePrograms
    };
    
    // Save settings
    try {
        localStorage.setItem('amiToolSettings', JSON.stringify(settings));
        showStatusMessage('All settings saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showStatusMessage('Error saving settings. Please try again.', 'error');
    }
}

// Extract program data from a card
function getProgramFromCard(card) {
    const programId = card.dataset.programId;
    if (!programId) return null;
    
    // Get eligibility type
    const eligibilityType = card.dataset.eligibilityType || 'county';
    
    // Get basic program info
    const nameInput = card.querySelector('.program-name');
    const activeCheckbox = card.querySelector('.program-active');
    const desc1Input = card.querySelector('.program-desc-1');
    const desc2Input = card.querySelector('.program-desc-2');
    
    // Get state eligibility
    const maStateCheckbox = card.querySelector('.state-ma');
    const riStateCheckbox = card.querySelector('.state-ri');
    
    // Get county eligibility
    const bristolCheckbox = card.querySelector('.county-bristol');
    const providenceCheckbox = card.querySelector('.county-providence');
    const otherCountiesCheckbox = card.querySelector('.county-other');
    
    // Get town eligibility
    const maTownSelect = card.querySelector('.town-select-ma');
    const riTownSelect = card.querySelector('.town-select-ri');
    
    // Get income range eligibility
    const below80Checkbox = card.querySelector('.income-80');
    const from80to100Checkbox = card.querySelector('.income-80-100');
    const from100to120Checkbox = card.querySelector('.income-100-120');
    const above120Checkbox = card.querySelector('.income-above-120');
    
    // Get selected MA towns
    const maTowns = [];
    if (maTownSelect) {
        Array.from(maTownSelect.selectedOptions).forEach(option => {
            maTowns.push({
                code: option.value,
                name: option.textContent
            });
        });
    }
    
    // Get selected RI towns
    const riTowns = [];
    if (riTownSelect) {
        Array.from(riTownSelect.selectedOptions).forEach(option => {
            riTowns.push({
                code: option.value,
                name: option.textContent
            });
        });
    }
    
    return {
        id: programId,
        name: nameInput ? nameInput.value : "Unnamed Program",
        active: activeCheckbox ? activeCheckbox.checked : true,
        eligibilityType: eligibilityType,
        states: {
            ma: maStateCheckbox ? maStateCheckbox.checked : true,
            ri: riStateCheckbox ? riStateCheckbox.checked : true
        },
        counties: {
            bristol: bristolCheckbox ? bristolCheckbox.checked : true,
            providence: providenceCheckbox ? providenceCheckbox.checked : true,
            other: otherCountiesCheckbox ? otherCountiesCheckbox.checked : false
        },
        towns: {
            ma: maTowns,
            ri: riTowns
        },
        incomeRanges: {
            below80: below80Checkbox ? below80Checkbox.checked : false,
            from80to100: from80to100Checkbox ? from80to100Checkbox.checked : false,
            from100to120: from100to120Checkbox ? from100to120Checkbox.checked : false,
            above120: above120Checkbox ? above120Checkbox.checked : false
        },
        description1: desc1Input ? desc1Input.value : "",
        description2: desc2Input ? desc2Input.value : ""
    };
}

// Show status message
function showStatusMessage(message, type) {
    // Remove any existing status messages
    const existingMessages = document.querySelectorAll('.status-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const statusMessage = document.createElement('div');
    statusMessage.className = `status-message status-${type}`;
    statusMessage.innerText = message;
    
    // Add message before the button container
    const saveAllBtn = document.getElementById('save-all-settings');
    if (saveAllBtn) {
        const buttonContainer = saveAllBtn.closest('.button-container');
        if (buttonContainer) {
            buttonContainer.parentNode.insertBefore(statusMessage, buttonContainer);
        }
    }
    
    // Show message
    statusMessage.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusMessage.style.opacity = '0';
        setTimeout(() => {
            statusMessage.remove();
        }, 300);
    }, 3000);
}