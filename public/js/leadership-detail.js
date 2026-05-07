document.addEventListener('DOMContentLoaded', async () => {
    let appData = null;
    try {
        const res = await fetch('../../assets/json/data.json');
        appData = await res.json();
    } catch (e) {
        console.error("Failed to load Product.json:", e);
        const content = document.getElementById('leadershipContent');
        if (content) content.innerHTML = `<div class="alert alert-danger">Error loading data. Please try again later.</div>`;
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const leaderId = urlParams.get('id') || 'ceo';
    const data = appData.leadership ? appData.leadership[leaderId] : null;

    const content = document.getElementById('leadershipContent');
    if(content && data) {
        const paragraphs = data.content ? data.content.map(p => `<p>${p}</p>`).join('') : '';
        content.innerHTML = `
            <div class="row g-5 align-items-start">
                <div class="col-12 col-lg-5 text-center text-lg-start" data-animate="fade-right">
                    <div class="profile-img-wrap">
                        <span class="profile-tag">${data.tag}</span>
                        <img src="${data.image}" alt="${data.name}" class="profile-img">
                    </div>
                </div>
                <div class="col-12 col-lg-7 profile-content" data-animate="fade-left">
                    <h1 class="profile-name">${data.name}</h1>
                    <span class="profile-title">${data.title}</span>
                    <div class="profile-intro">
                        "${data.intro}"
                    </div>
                    <div class="profile-text text-muted">
                        ${paragraphs}
                    </div>
                </div>
            </div>
        `;
        
        // Trigger animations for injected elements
        if (typeof observeNewElements === 'function') {
            observeNewElements(content);
        } else {
            // fallback if script.js didn't expose it or load yet
            content.querySelectorAll('[data-animate]').forEach(el => {
                el.classList.add('animated');
            });
        }
    } else if (content) {
        content.innerHTML = `<div class="text-center py-5"><h3>Profile not found</h3><a href="index.html" class="btn btn-brand mt-3">Back to Home</a></div>`;
    }
});
