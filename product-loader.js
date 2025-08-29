document.addEventListener('DOMContentLoaded', () => {
    if (document.body.id === 'productListBody') {
        loadProductList();
    } else if (document.body.id === 'productDetailBody') {
        loadProductDetail();
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

let allProducts = []; // Cache for all products
let selectedProducts = new Set(); // To store IDs of products selected for comparison

async function loadProductList() {
    allProducts = await fetchProducts();
    const productListContainer = document.getElementById('product-list-container');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const compareBtn = document.getElementById('compare-btn');
    const modal = document.getElementById('compare-modal');
    const closeBtn = document.querySelector('.close-btn');

    if (!productListContainer) return;

    // Initial render
    renderProductList(allProducts);
    updateCompareButton();

    // Event listener for search
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredProducts = allProducts.filter(product =>
            product.program_name.toLowerCase().includes(searchTerm) ||
            product.sub_category.toLowerCase().includes(searchTerm) ||
            product.Purpose.toLowerCase().includes(searchTerm)
        );
        renderProductList(filteredProducts);
    });

    // Event listener for sorting
    sortSelect.addEventListener('change', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredProducts = allProducts.filter(product =>
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

    // Group products by sub_category
    const productsBySubCategory = products.reduce((acc, product) => {
        const subCategory = product.sub_category || 'Uncategorized';
        if (!acc[subCategory]) {
            acc[subCategory] = [];
        }
        acc[subCategory].push(product);
        return acc;
    }, {});

    let html = '';
    for (const subCategory in productsBySubCategory) {
        html += `<h2 class="category-header">${subCategory}</h2>`;
        html += '<div class="product-grid">';
        productsBySubCategory[subCategory].forEach(product => {
            const isSelected = selectedProducts.has(product.id);
            html += `
                <div class="product-tile ${isSelected ? 'selected' : ''}" data-id="${product.id}">
                    <div class="product-tile-content">
                        <a href="product-detail.html?id=${product.id}">
                            <h3 class="product-tile-title">${product.program_name}</h3>
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
    const count = selectedProducts.size;
    compareBtn.textContent = `Compare Selected (${count})`;
    compareBtn.disabled = count === 0;
}

function openCompareModal() {
    const modal = document.getElementById('compare-modal');
    const comparisonTableContainer = document.getElementById('comparison-table-container');

    const productsToCompare = allProducts.filter(p => selectedProducts.has(p.id));

    if (productsToCompare.length === 0) {
        comparisonTableContainer.innerHTML = '<p>No products selected for comparison.</p>';
        modal.style.display = 'block';
        return;
    }

    let tableHTML = '<table>';
    // Headers
    tableHTML += '<thead><tr><th>Feature</th>';
    productsToCompare.forEach(p => {
        tableHTML += `<th>${p.program_name}</th>`;
    });
    tableHTML += '</tr></thead>';

    // Body
    tableHTML += '<tbody>';
    const allKeys = new Set();
    productsToCompare.forEach(p => {
        Object.keys(p).forEach(key => {
            if (key !== 'id' && key !== 'program_name' && key !== 'category' && key !== 'sub_category') {
                allKeys.add(key);
            }
        });
    });

    allKeys.forEach(key => {
        tableHTML += `<tr><td>${key.replace(/_/g, ' ')}</td>`;
        productsToCompare.forEach(p => {
            tableHTML += `<td>${p[key] || ''}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    comparisonTableContainer.innerHTML = tableHTML;
    modal.style.display = 'block';
}

function closeCompareModal() {
    const modal = document.getElementById('compare-modal');
    modal.style.display = 'none';
}

async function loadProductDetail() {
    const products = await fetchProducts();
    const productDetailContainer = document.getElementById('product-detail-container');

    if (!productDetailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const product = products.find(p => p.id === productId);

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
            // Exclude fields that are empty or not useful for display
            if (key !== 'id' && key !== 'program_name' && key !== 'category' && key !== 'sub_category' && product[key]) {
                html += `
                    <div class="detail-item">
                        <span class="detail-item-label">${key.replace(/_/g, ' ')}</span>
                        <span class="detail-item-value">${product[key]}</span>
                    </div>
                `;
            }
        });

        html += '</div>';

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
