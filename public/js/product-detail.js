document.addEventListener('DOMContentLoaded', async () => {
    let appData = null;
    try {
        const res = await fetch('../../assets/json/data.json');
        appData = await res.json();
    } catch (e) {
        console.error("Failed to load data.json:", e);
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get('id');

    let productDetails = null;

    // Search across all categories
    for (const key in appData.categories) {
        const item = appData.categories[key].find(p => p.id === prodId);
        if (item) {
            productDetails = item;
            break;
        }
    }

    // Fallback if not found
    if (!productDetails && appData.categories['mens']) {
        productDetails = appData.categories['mens'][0];
    }

    // --- Product Detail ---
    const content = document.getElementById('productDetailContent');
    if (content && productDetails) {
        const tagsHtml = productDetails.features
            ? productDetails.features.map(f => `<span class="feature-tag">${f}</span>`).join('')
            : '';
        const specsHtml = productDetails.specifications
            ? Object.entries(productDetails.specifications).map(([k, v]) => `
                <li class="spec-item">
                    <span class="spec-label">${k}</span>
                    <span class="spec-val">${v}</span>
                </li>`).join('')
            : '';

        content.innerHTML = `
            <div class="row g-4 g-lg-5">
                <div class="col-12 col-lg-6">
                    <div class="detail-img-wrap">
                        <img src="${productDetails.image}" alt="${productDetails.name}" class="detail-img">
                    </div>
                </div>
                <div class="col-12 col-lg-6">
                    <span class="detail-cat">${productDetails.category}</span>
                    <h1 class="detail-name">${productDetails.name}</h1>
                    <p class="detail-desc">${productDetails.description || ''}</p>
                    <div class="mb-4">${tagsHtml}</div>
                    <ul class="spec-list">${specsHtml}</ul>
                </div>
            </div>
        `;
    }

    // --- Related Products Carousel ---
    const relatedTrack = document.getElementById('relatedTrack');

    if (relatedTrack && productDetails) {
        const currentCategoryKey = Object.keys(appData.categories).find(key =>
            appData.categories[key].some(p => p.id === prodId)
        );

        const related = currentCategoryKey
            ? appData.categories[currentCategoryKey].filter(p => p.id !== prodId)
            : [];

        if (related.length === 0) {
            document.getElementById('relatedSection').style.display = 'none';
        } else {
            relatedTrack.innerHTML = related.map(p => `
                <div class="prod-card">
                    <a href="?id=${p.id}" class="prod-card-link">
                        <div class="prod-card-img-wrap">
                            <img src="${p.image}" alt="${p.name}" class="prod-card-img" loading="lazy">
                        </div>
                        <div class="prod-card-body">
                            <span class="prod-card-cat">${p.category}</span>
                            <h4 class="prod-card-name">${p.name}</h4>
                        </div>
                    </a>
                </div>
            `).join('');

            const prev = document.getElementById('relatedPrev');
            const next = document.getElementById('relatedNext');

            const getScrollAmount = () => {
                const card = relatedTrack.querySelector('.prod-card');
                if (!card) return 300;
                const gap = parseInt(getComputedStyle(relatedTrack).gap) || 24;
                return card.offsetWidth + gap;
            };

            const updateArrows = () => {
                const maxScroll = relatedTrack.scrollWidth - relatedTrack.clientWidth;
                prev.disabled = relatedTrack.scrollLeft <= 4;
                next.disabled = relatedTrack.scrollLeft >= maxScroll - 4;
                prev.style.opacity = prev.disabled ? '0.3' : '1';
                next.style.opacity = next.disabled ? '0.3' : '1';
            };

            prev.addEventListener('click', () => {
                relatedTrack.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
            });

            next.addEventListener('click', () => {
                relatedTrack.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
            });

            relatedTrack.addEventListener('scroll', updateArrows, { passive: true });

            updateArrows();
        }
    }

}); // ← single closing brace for DOMContentLoaded