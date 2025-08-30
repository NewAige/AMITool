let allProducts = []; // This will hold the raw product list
let fullProductData = []; // This will hold the merged data
let selectedProducts = new Set(); // To store IDs of products selected for comparison

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch and process data once
    try {
        const [products, armTable, armTranslationTable] = await Promise.all([
            fetchProducts(),
            fetchArmTable(),
            fetchArmTranslationTable()
        ]);
        allProducts = products;
        fullProductData = mergeProductData(products, armTable, armTranslationTable);

        // Route to the correct function based on body ID
        if (document.body.id === 'productListBody') {
            loadProductList();
        } else if (document.body.id === 'productDetailBody') {
            loadProductDetail();
        }
    } catch (error) {
        console.error("Failed to initialize application:", error);
        // Optionally, display an error message to the user
        const container = document.getElementById('product-list-container') || document.getElementById('product-detail-container');
        if (container) {
            container.innerHTML = '<p>Error loading product data. Please try again later.</p>';
        }
    }
});

// A simple CSV parser that can handle quoted fields.
function parseCSV(csvText) {
    const rows = csvText.trim().split('\n');
    const headers = rows[0].split(',').map(header => header.trim().replace(/^"""|"""$/g, ''));

    // Find and remove duplicate headers
    const uniqueHeaders = [];
    const headerMap = {};
    headers.forEach((header, index) => {
        if (!headerMap[header]) {
            headerMap[header] = 1;
            uniqueHeaders.push({ name: header, index: index });
        } else {
            // If you want to handle duplicate columns, e.g., by renaming
            // uniqueHeaders.push({ name: `${header}_${headerMap[header]++}`, index: index });
        }
    });

    const lines = csvText.trim().split('\n').slice(1);
    const data = lines.map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const row = {};
        uniqueHeaders.forEach(headerInfo => {
            let value = values[headerInfo.index] || '';
            // Clean up the value, removing extra quotes and trimming spaces
            value = value.trim().replace(/^"""|"""$/g, '').replace(/^"|"$/g, '').trim();
            row[headerInfo.name] = value;
        });
        return row;
    });
    return data;
}


async function fetchProducts() {
    try {
        const response = await fetch('Product List Updated.csv');
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error fetching or parsing product data:', error);
        return [];
    }
}

async function fetchArmTable() {
    try {
        const response = await fetch('armtable.csv');
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error fetching or parsing ARM table data:', error);
        return [];
    }
}

async function fetchArmTranslationTable() {
    try {
        const response = await fetch('armtabletranslation.csv');
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error fetching or parsing ARM translation data:', error);
        return [];
    }
}

function mergeProductData(products, armTable, armTranslationTable) {
    const armTranslationMap = armTranslationTable.reduce((map, item) => {
        map[item.id] = item.arm_plancode;
        return map;
    }, {});

    const armTableMap = armTable.reduce((map, item) => {
        map[item.arm_plancode] = item;
        return map;
    }, {});

    return products.map(product => {
        const armPlanCode = armTranslationMap[product.id];
        if (armPlanCode) {
            const armDetails = armTableMap[armPlanCode];
            if (armDetails) {
                return { ...product, armDetails: armDetails };
            }
        }
        return product;
    });
}

function loadProductList() {
    const productListContainer = document.getElementById('product-list-container');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const compareBtn = document.getElementById('compare-btn');
    const modal = document.getElementById('compare-modal');
    const closeBtn = document.querySelector('.close-btn');

    if (!productListContainer) return;

    // Initial render
    renderProductList(fullProductData);
    updateCompareButton();

    // Event listener for search
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredProducts = fullProductData.filter(product =>
            product.program_name.toLowerCase().includes(searchTerm) ||
            product.sub_category.toLowerCase().includes(searchTerm) ||
            product.Purpose.toLowerCase().includes(searchTerm)
        );
        renderProductList(filteredProducts);
    });

    // Event listener for sorting
    sortSelect.addEventListener('change', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredProducts = fullProductData.filter(product =>
            product.program_name.toLowerCase().includes(searchTerm) ||
            product.sub_category.toLowerCase().includes(searchTerm) ||
            product.Purpose.toLowerCase().includes(searchTerm)
        );
        sortAndRenderProducts(filteredProducts, sortSelect.value);
    });

    // Event listener for compare button
    compareBtn.addEventListener('click', () => {
        openCompareModal();
    });

    // Event listeners for modal
    closeBtn.addEventListener('click', closeCompareModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeCompareModal();
        }
    });
}

function sortAndRenderProducts(products, sortValue) {
    const [sortBy, sortOrder] = sortValue.split('-');

    const sortedProducts = [...products].sort((a, b) => {
        let valA, valB;
        if (sortBy === 'name') {
            valA = a.program_name.toLowerCase();
            valB = b.program_name.toLowerCase();
        } else if (sortBy === 'category') {
            valA = a.category.toLowerCase();
            valB = b.category.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    renderProductList(sortedProducts);
}

function renderProductList(products) {
    const productListContainer = document.getElementById('product-list-container');

    if (products.length === 0) {
        productListContainer.innerHTML = '<p>No products found.</p>';
        return;
    }

    // Group products by category and then by sub_category
    const productsByGroup = products.reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        const subCategory = product.sub_category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = {};
        }
        if (!acc[category][subCategory]) {
            acc[category][subCategory] = [];
        }
        acc[category][subCategory].push(product);
        return acc;
    }, {});

    let html = '';
    for (const category in productsByGroup) {
        html += `<h2 class="category-header">${category}</h2>`;
        for (const subCategory in productsByGroup[category]) {
            html += `<h3 class="sub-category-header">${subCategory}</h3>`;
            html += '<div class="product-grid">';
            productsByGroup[category][subCategory].forEach(product => {
                const isSelected = selectedProducts.has(product.id);
                html += `
                    <div class="product-tile ${isSelected ? 'selected' : ''}" data-id="${product.id}">
                        <div class="product-tile-content">
                            <a href="product-detail.html?id=${product.id}">
                                <h4 class="product-tile-title">${product.program_name}</h4>
                            </a>
                            <p class="product-tile-category">${product.sub_category}</p>
                            <p class="product-tile-purpose">${product.Purpose}</p>
                        </div>
                        <div class="product-tile-compare">
                            <input type="checkbox" class="compare-checkbox" data-id="${product.id}" ${isSelected ? 'checked' : ''}>
                            <label>Compare</label>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
    }

    productListContainer.innerHTML = html;
    addCheckboxListeners();
}

function addCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.compare-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const productId = e.target.dataset.id;
            if (e.target.checked) {
                if (selectedProducts.size < 3) {
                    selectedProducts.add(productId);
                } else {
                    e.target.checked = false;
                    alert('You can only compare up to 3 products at a time.');
                }
            } else {
                selectedProducts.delete(productId);
            }
            document.querySelector(`.product-tile[data-id="${productId}"]`).classList.toggle('selected', e.target.checked);
            updateCompareButton();
        });
    });
}

function updateCompareButton() {
    const compareBtn = document.getElementById('compare-btn');
    const compareContainer = document.getElementById('compare-container');
    const count = selectedProducts.size;

    compareBtn.textContent = `Compare Selected (${count})`;
    compareBtn.disabled = count === 0;

    if (count === 0) {
        compareContainer.classList.add('hidden');
    } else {
        compareContainer.classList.remove('hidden');
    }
}

function openCompareModal() {
    const modal = document.getElementById('compare-modal');
    const comparisonContainer = document.getElementById('comparison-table-container');

    const productsToCompare = fullProductData.filter(p => selectedProducts.has(p.id));

    if (productsToCompare.length < 2) {
        comparisonContainer.innerHTML = '<p>Please select at least two products to compare.</p>';
        modal.style.display = 'block';
        return;
    }

    const allKeys = new Set();
    productsToCompare.forEach(p => {
        Object.keys(p).forEach(key => {
            if (key !== 'id' && key !== 'armDetails') {
                allKeys.add(key);
            }
        });
    });

    let html = '<div class="comparison-grid">';
    // Header row
    html += '<div class="product-detail-card-header"><h4>Feature</h4></div>';
    productsToCompare.forEach(p => {
        html += `<div class="product-detail-card-header"><h4>${p.program_name}</h4></div>`;
    });

    // Generate rows for each feature
    allKeys.forEach(key => {
        const values = productsToCompare.map(p => p[key] || '');
        const allSame = values.every(v => v === values[0]);
        const highlightClass = allSame ? '' : 'highlight';

        // Feature label
        html += `<div class="detail-item-label ${highlightClass}">${key.replace(/_/g, ' ')}</div>`;

        // Product values for this feature
        productsToCompare.forEach(product => {
            const value = product[key] || '';
            html += `<div class="detail-item-value ${highlightClass}">${value}</div>`;
        });
    });

    html += '</div>';

    comparisonContainer.innerHTML = html;
    // Set the CSS variable for the grid
    comparisonContainer.querySelector('.comparison-grid').style.setProperty('--compare-count', productsToCompare.length);
    modal.style.display = 'block';
}

function closeCompareModal() {
    const modal = document.getElementById('compare-modal');
    modal.style.display = 'none';
}

function loadProductDetail() {
    const productDetailContainer = document.getElementById('product-detail-container');
    if (!productDetailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const product = fullProductData.find(p => p.id === productId);

    if (product) {
        document.title = `${product.program_name} - BCSB`;
        // Update the header to be more dynamic
        const pageHeader = document.querySelector('header h1');
        if (pageHeader) {
            pageHeader.textContent = product.program_name;
        }
        const pageSubtitle = document.querySelector('header .subtitle');
        if (pageSubtitle) {
            pageSubtitle.textContent = `${product.category} > ${product.sub_category}`;
        }

        let html = '<div class="product-detail-card">';

        const headers = Object.keys(product);
        headers.forEach(key => {
            // Exclude fields that are empty, not useful, or are the armDetails object
            if (key !== 'id' && key !== 'program_name' && key !== 'category' && key !== 'sub_category' && product[key] && key !== 'armDetails') {
                html += `
                    <div class="detail-item">
                        <span class="detail-item-label">${key.replace(/_/g, ' ')}</span>
                        <span class="detail-item-value">${product[key]}</span>
                    </div>
                `;
            }
        });

        html += '</div>'; // End of product-detail-card

        // Add ARM details if they exist
        if (product.armDetails) {
            html += `
                <div class="arm-detail-section card">
                    <div class="card-header">
                        <i class="fas fa-table"></i> ARM Details
                    </div>
                    <div class="card-body">
                        <table class="arm-detail-table">
                            ${Object.entries(product.armDetails).map(([key, value]) => `
                                <tr>
                                    <td>${key.replace(/_/g, ' ')}</td>
                                    <td>${value}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
            `;
        }

        html += `
            <div class="back-to-list">
                <a href="product-list.html" class="btn btn-outline">
                    <i class="fas fa-arrow-left"></i> Back to Product List
                </a>
            </div>
        `;

        productDetailContainer.innerHTML = html;
    } else {
        productDetailContainer.innerHTML = '<p>Product not found.</p>';
    }
}
