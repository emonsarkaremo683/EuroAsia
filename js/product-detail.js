'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initProductDetail();
});

async function initProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const container = document.getElementById('productDetailContent');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('assets/json/products.json');
        const data = await response.json();
        
        const categories = data.categories || {};
        let product = null;
        let category = null;

        // Find product across all categories
        for (const cat in categories) {
            const found = categories[cat].find(p => p.id === productId);
            if (found) {
                product = found;
                category = cat;
                break;
            }
        }

        if (!product) {
            container.innerHTML = `<div class="alert alert-warning">Product not found. <a href="index.html">Return to home</a></div>`;
            return;
        }

        renderProduct(product);
        renderRelated(categories[category], productId);

    } catch (error) {
        console.error('Error loading product details:', error);
        container.innerHTML = `<div class="alert alert-danger">Error loading product details. Please try again later.</div>`;
    }
}

function renderProduct(product) {
    const container = document.getElementById('productDetailContent');
    
    const specsHtml = Object.entries(product.specifications).map(([key, val]) => `
        <li class="spec-item">
            <span class="spec-label">${key}</span>
            <span class="spec-val">${val}</span>
        </li>
    `).join('');

    const featuresHtml = product.features.map(f => `<span class="feature-tag">${f}</span>`).join('');

    container.innerHTML = `
        <div class="row g-4 g-lg-5">
            <div class="col-12 col-lg-6">
                <div class="detail-img-wrap">
                    <img src="${product.image}" alt="${product.name}" class="detail-img" onerror="this.src='https://placehold.co/800x600?text=Image+Not+Found'"/>
                </div>
            </div>
            <div class="col-12 col-lg-6">
                <span class="detail-cat">${product.category}</span>
                <h1 class="detail-name">${product.name}</h1>
                <p class="detail-desc">${product.description}</p>
                
                <h5 class="mb-3">Key Features</h5>
                <div class="mb-4">
                    ${featuresHtml}
                </div>

                <h5 class="mb-3">Specifications</h5>
                <ul class="spec-list">
                    ${specsHtml}
                </ul>

                <a href="index.html#contact" class="btn btn-brand btn-lg px-5">Inquire About This Product</a>
            </div>
        </div>
    `;
}

function renderRelated(relatedProducts, currentId) {
    const track = document.getElementById('relatedTrack');
    if (!track) return;

    const filtered = relatedProducts.filter(p => p.id !== currentId);
    
    if (filtered.length === 0) {
        track.closest('section').style.display = 'none';
        return;
    }

    filtered.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'prod-slide';
        slide.style.flex = '0 0 280px';
        slide.innerHTML = `
            <div class="product-card" onclick="window.location.href='product.html?id=${item.id}'">
                <div class="product-img-wrap">
                    <img src="${item.image}" alt="${item.name}" class="product-img"/>
                    <span class="brand-badge">NON BRAND</span>
                </div>
                <div class="product-info">
                    <h6 class="product-name">${item.name}</h6>
                    <span class="product-cat">${item.category}</span>
                </div>
            </div>
        `;
        track.appendChild(slide);
    });

    // Simple touch scroll for related products
    track.style.display = 'flex';
    track.style.gap = '20px';
    track.style.overflowX = 'auto';
    track.style.paddingBottom = '20px';
}
