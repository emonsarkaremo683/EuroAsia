'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initLeadershipDetail();
});

async function initLeadershipDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const roleId = urlParams.get('id');
    const container = document.getElementById('leadershipContent');

    if (!roleId) {
        window.location.href = 'index.html#messages';
        return;
    }

    try {
        const response = await fetch('assets/json/products.json');
        const data = await response.json();
        
        const profile = data.leadership && data.leadership[roleId];

        if (!profile) {
            container.innerHTML = `<div class="alert alert-warning">Profile not found. <a href="index.html#messages">Return to leadership</a></div>`;
            return;
        }

        renderProfile(profile);

    } catch (error) {
        console.error('Error loading leadership details:', error);
        container.innerHTML = `<div class="alert alert-danger">Error loading profile details. Please try again later.</div>`;
    }
}

function renderProfile(profile) {
    const container = document.getElementById('leadershipContent');
    document.title = `${profile.name} — EUROASIA Co.`;
    
    const contentHtml = profile.content.map(p => `<p>${p}</p>`).join('');

    container.innerHTML = `
        <div class="row g-5">
            <div class="col-12 col-lg-5" data-animate="fade-right">
                <div class="profile-img-wrap">
                    <img src="${profile.image}" alt="${profile.name}" class="profile-img"/>
                    <div class="profile-tag">${profile.tag}</div>
                </div>
            </div>
            <div class="col-12 col-lg-7" data-animate="fade-left">
                <h1 class="profile-name">${profile.name}</h1>
                <span class="profile-title">${profile.title}</span>
                
                <div class="profile-intro">
                    ${profile.intro}
                </div>
                
                <div class="profile-content">
                    ${contentHtml}
                    <p class="mt-4"><strong>${profile.name}</strong><br/><em>${profile.title}, EUROASIA Co. Ltd.</em></p>
                </div>
            </div>
        </div>
    `;

    // Re-trigger scroll animations for dynamically added items
    if (typeof initScrollAnimations === 'function') {
        initScrollAnimations();
    }
}
