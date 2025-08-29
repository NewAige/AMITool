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

async function loadProductList() {
    const products = await fetchProducts();
    const productListContainer = document.getElementById('product-list-container');

    if (!productListContainer) return;

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
        html += `<h2>${category}</h2>`;
        html += '<div class="product-grid">';
        productsByCategory[category].forEach(product => {
            html += `
                <a href="product-detail.html?id=${product.id}" class="product-card">
                    <div class="product-card-body">
                        <h5 class="product-card-title">${product.program_name}</h5>
                        <p class="product-card-subtitle">${product.sub_category}</p>
                        <p class="product-card-text">${product.Purpose}</p>
                    </div>
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
        let html = `
            <div class="card">
                <div class="card-header">
                    <h2>${product.program_name}</h2>
                    <p class="text-muted">${product.category} > ${product.sub_category}</p>
                </div>
                <div class="card-body">
                    <div class="product-details-grid">
        `;

        // Dynamically create the detail grid
        const headers = Object.keys(product);
        headers.forEach(key => {
            if (key !== 'id' && product[key]) { // Don't display the ID, and don't display empty fields
                html += `
                    <div class="detail-item">
                        <strong class="detail-label">${key.replace(/_/g, ' ')}:</strong>
                        <span class="detail-value">${product[key]}</span>
                    </div>
                `;
            }
        });

        html += `
                    </div>
                     <div style="text-align: center; margin-top: 2rem;">
                        <a href="product-list.html" class="btn btn-primary">
                            <i class="fas fa-arrow-left"></i> Back to Product List
                        </a>
                    </div>
                </div>
            </div>
        `;
        productDetailContainer.innerHTML = html;
    } else {
        productDetailContainer.innerHTML = '<p>Product not found.</p>';
    }
}
