'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initDivisionDetail();
});

async function initDivisionDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const divId = urlParams.get('id');

    if (!divId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('assets/json/products.json');
        const data = await response.json();
        
        const division = data.divisions.find(d => d.id === divId);

        if (!division) {
            document.getElementById('divisionName').textContent = "Division Not Found";
            return;
        }

        renderDivision(division);

    } catch (error) {
        console.error('Error loading division details:', error);
    }
}

function renderDivision(div) {
    document.title = `${div.name} — VeraStitch Co.`;
    document.getElementById('divisionName').textContent = div.name;
    document.getElementById('divisionShortDesc').textContent = div.description;
    document.getElementById('divisionLongDesc').textContent = div.longDescription;
    document.getElementById('divisionHeroBg').style.backgroundImage = `url('${div.image}')`;

    const capGrid = document.getElementById('capabilitiesGrid');
    div.capabilities.forEach(cap => {
        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `<div class="capability-item"><i class="bi bi-check-circle-fill"></i> ${cap}</div>`;
        capGrid.appendChild(col);
    });

    const statsCont = document.getElementById('statsContainer');
    Object.entries(div.stats).forEach(([label, val]) => {
        const item = document.createElement('div');
        item.className = 'mb-3 pb-3 border-bottom border-secondary';
        item.innerHTML = `
            <div class="small text-uppercase opacity-75">${label}</div>
            <div class="h4 m-0">${val}</div>
        `;
        statsCont.appendChild(item);
    });
}
