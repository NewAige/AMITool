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

async function loadProductList() {
    allProducts = await fetchProducts();
    const productListContainer = document.getElementById('product-list-container');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    if (!productListContainer) return;

    // Initial render
    renderProductList(allProducts);

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
        // Re-filter based on current search term before sorting
        const searchTerm = searchInput.value.toLowerCase();
        const filteredProducts = allProducts.filter(product =>
            product.program_name.toLowerCase().includes(searchTerm) ||
            product.sub_category.toLowerCase().includes(searchTerm) ||
            product.Purpose.toLowerCase().includes(searchTerm)
        );
        sortAndRenderProducts(filteredProducts, sortSelect.value);
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

    // Group products by category
    const productsByCategory = products.reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    let html = '';
    for (const category in productsByCategory) {
        html += `<h2 class="category-header">${category}</h2>`;
        html += '<div class="product-grid">';
        productsByCategory[category].forEach(product => {
            html += `
                <a href="product-detail.html?id=${product.id}" class="product-tile">
                    <h3 class="product-tile-title">${product.program_name}</h3>
                    <p class="product-tile-category">${product.sub_category}</p>
                    <p class="product-tile-purpose">${product.Purpose}</p>
                </a>
            `;
        });
        html += '</div>';
    }

    productListContainer.innerHTML = html;
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
