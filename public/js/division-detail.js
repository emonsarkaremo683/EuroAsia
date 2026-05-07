document.addEventListener('DOMContentLoaded', async () => {
    let appData = null;
    try {
        const res = await fetch('Product.json');
        appData = await res.json();
    } catch (e) {
        console.error("Failed to load Product.json:", e);
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const divId = urlParams.get('id') || 'garments';
    
    const data = appData.divisions.find(d => d.id === divId) || appData.divisions[0];

    const nameEl = document.getElementById('divisionName');
    const shortDescEl = document.getElementById('divisionShortDesc');
    const longDescEl = document.getElementById('divisionLongDesc');
    const capGrid = document.getElementById('capabilitiesGrid');
    const statsContainer = document.getElementById('statsContainer');

    if (nameEl) nameEl.textContent = data.name;
    if (shortDescEl) shortDescEl.textContent = data.description;
    if (longDescEl) longDescEl.textContent = data.longDescription;

    if (capGrid && data.capabilities) {
        capGrid.innerHTML = data.capabilities.map((c, i) => `
            <div class="col-sm-6">
                <div class="capability-item">
                    <i class="bi ${i%2==0 ? 'bi-check-circle' : 'bi-star'} fs-4"></i>
                    <span>${c}</span>
                </div>
            </div>
        `).join('');
    }

    if (statsContainer && data.stats) {
        statsContainer.innerHTML = Object.entries(data.stats).map(([label, value]) => `
            <div class="mb-4">
                <div class="fs-6 text-white-50 text-uppercase tracking-wide mb-1">${label}</div>
                <div class="display-5 fw-bold font-serif text-white">${value}</div>
            </div>
        `).join('');
    }
});

