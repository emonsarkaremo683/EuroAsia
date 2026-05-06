/* ================================================================
   EUROASIA CO. — script.js
   Modules: Navbar | Animations | Counters | Product Carousel
            See More Toggle | Workflow | Scroll Top | Form
   ================================================================ */

'use strict';

/* ── DOM Ready ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initScrollAnimations();
  initCounters();
  initScrollTopBtn();
  initWorkflowCycle();
  injectShakeKeyframe();
  initHeroCarousel();
  initActiveNavLink();
  
  await loadDynamicContent();
});

async function loadDynamicContent() {
  try {
    const res = await fetch('assets/json/products.json');
    const data = await res.json();
    populateProducts(data.categories);
    populateCerts(data.certificates.standards);
  } catch (err) {
    console.error('Failed to load dynamic content:', err);
  }
}

function populateProducts(categories) {
  const tabsWrap = document.getElementById('prodTabs');
  const panelsWrap = document.getElementById('prodPanelsContainer');
  if (!tabsWrap || !panelsWrap) return;

  tabsWrap.innerHTML = '';
  panelsWrap.innerHTML = '';

  let isFirst = true;
  for (const [catKey, products] of Object.entries(categories)) {
    // Add Tab
    const tabName = catKey.charAt(0).toUpperCase() + catKey.slice(1);
    const tabBtn = document.createElement('button');
    tabBtn.className = `prod-tab ${isFirst ? 'active' : ''}`;
    tabBtn.setAttribute('data-cat', catKey);
    tabBtn.textContent = tabName + ' Wear';
    tabsWrap.appendChild(tabBtn);

    // Add Panel
    const panel = document.createElement('div');
    panel.className = `prod-panel ${isFirst ? 'active' : ''}`;
    panel.setAttribute('data-panel', catKey);

    const track = document.createElement('div');
    track.className = 'prod-track';
    track.id = `track-${catKey}`;

    products.forEach(p => {
      const slide = document.createElement('div');
      slide.className = 'prod-slide';
      slide.innerHTML = `
        <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'">
          <div class="product-img-wrap">
            <img src="${p.image}" alt="${p.name}" class="product-img"/>
            <span class="brand-badge">NON BRAND</span>
          </div>
          <div class="product-info">
            <h6 class="product-name">${p.name}</h6>
            <span class="product-cat">${p.category}</span>
          </div>
        </div>`;
      track.appendChild(slide);
    });

    panel.appendChild(track);
    panelsWrap.appendChild(panel);

    isFirst = false;
  }

  // Initialize carousel logic after DOM generation
  initProductCarousel();
}

function populateCerts(standards) {
  const certsGrid = document.getElementById('certsGrid');
  if (!certsGrid) return;
  certsGrid.innerHTML = '';
  
  const icons = ['bi-patch-check-fill', 'bi-globe2', 'bi-shield-fill-check', 'bi-leaf-fill', 'bi-recycle', 'bi-award-fill'];

  standards.forEach((cert, i) => {
    const col = document.createElement('div');
    col.className = 'col-6 col-sm-4 col-md-3 col-lg-2';
    col.setAttribute('data-animate', 'fade-up');
    col.setAttribute('data-delay', (i * 80).toString());
    const iconClass = icons[i % icons.length];

    col.innerHTML = `
      <div class="cert-card">
        <div class="cert-icon"><i class="bi ${iconClass}"></i></div>
        <span class="cert-name">${cert.name}</span>
        <span class="cert-desc">${cert.desc}</span>
      </div>`;
    certsGrid.appendChild(col);
  });
  
  // Re-trigger scroll animations for dynamically added items
  initScrollAnimations();
}

/* ================================================================
   1. NAVBAR — transparent → solid on scroll
================================================================ */
function initNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  function updateNav() {
    if (nav.getAttribute('data-solid') === 'true') {
      nav.classList.add('scrolled');
      nav.classList.remove('transparent');
      return;
    }
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
      nav.classList.remove('transparent');
    } else {
      nav.classList.remove('scrolled');
      nav.classList.add('transparent');
    }
  }

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  // Smooth scroll for all anchor links + close mobile menu
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      // Close mobile collapse if open
      const collapseEl = document.getElementById('navMenu');
      if (collapseEl && collapseEl.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
}

/* ================================================================
   2. SCROLL ANIMATIONS — Intersection Observer
================================================================ */
function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      setTimeout(() => el.classList.add('animated'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ================================================================
   3. COUNTER ANIMATION — Factory Stats
================================================================ */
function initCounters() {
  const counterEls = document.querySelectorAll('[data-count]');
  if (!counterEls.length) return;
  let started = false;

  const factorySection = document.getElementById('factory');
  if (!factorySection) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      counterEls.forEach(el => animateCounter(el));
    }
  }, { threshold: 0.25 });

  observer.observe(factorySection);

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 2000;
    const start = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.round(easeOut(progress) * target);
      el.textContent = formatNum(current);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = formatNum(target);
    }

    requestAnimationFrame(tick);
  }

  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000)    return n.toLocaleString();
    return n.toString();
  }
}

/* ================================================================
   4. PRODUCT CATEGORY CAROUSEL
   - Tab switching (6 categories)
   - Prev / Next arrow buttons
   - Touch / Swipe support on mobile
   - Dot indicators per panel
   - Keyboard navigation
================================================================ */
function initProductCarousel() {
  const tabs       = document.querySelectorAll('.prod-tab');
  const panels     = document.querySelectorAll('.prod-panel');
  const prevBtn    = document.getElementById('prodPrevBtn');
  const nextBtn    = document.getElementById('prodNextBtn');
  const dotsWrap   = document.getElementById('prodDots');

  if (!tabs.length || !panels.length) return;

  // State per category
  const state = {};
  panels.forEach(panel => {
    const cat   = panel.getAttribute('data-panel');
    const track = panel.querySelector('.prod-track');
    const slides = track ? track.querySelectorAll('.prod-slide') : [];
    state[cat] = { index: 0, total: slides.length };
  });

  const firstCat = tabs[0] ? tabs[0].getAttribute('data-cat') : 'mens';
  let activeCat = firstCat;

  /* ── Calculate how many slides are visible ── */
  function visibleCount() {
    const w = window.innerWidth;
    if (w <= 480)  return 2;
    if (w <= 767)  return 2;
    if (w <= 991)  return 3;
    return 4;
  }

  /* ── Slide width + gap helper ── */
  function getSlideWidth(track) {
    const slide = track.querySelector('.prod-slide');
    if (!slide) return 0;
    const style = getComputedStyle(track);
    const gap   = parseFloat(style.gap) || 20;
    return slide.offsetWidth + gap;
  }

  /* ── Apply transform to active track ── */
  function applyTransform(cat) {
    const panel = document.querySelector(`.prod-panel[data-panel="${cat}"]`);
    if (!panel) return;
    const track = panel.querySelector('.prod-track');
    if (!track) return;

    const s = state[cat];
    const vis = visibleCount();
    const maxIndex = Math.max(0, s.total - vis);
    s.index = Math.min(Math.max(s.index, 0), maxIndex);

    const slideW = getSlideWidth(track);
    track.style.transform = `translateX(-${s.index * slideW}px)`;

    // Update arrow states
    const needsCarousel = s.total > vis;
    if (prevBtn) {
      prevBtn.style.display = needsCarousel ? '' : 'none';
      prevBtn.disabled = (s.index === 0);
    }
    if (nextBtn) {
      nextBtn.style.display = needsCarousel ? '' : 'none';
      nextBtn.disabled = (s.index >= maxIndex);
    }

    renderDots(cat, needsCarousel);
  }

  /* ── Build dot indicators ── */
  function renderDots(cat, needsCarousel = true) {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    if (!needsCarousel) return;

    const s      = document.querySelector(`.prod-panel[data-panel="${cat}"]`);
    const vis    = visibleCount();
    const total  = state[cat]?.total || 0;
    const pages  = Math.ceil(total / vis);

    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'prod-dot' + (i === Math.floor(state[cat].index / vis) ? ' active' : '');
      dot.setAttribute('aria-label', `Page ${i + 1}`);
      dot.addEventListener('click', () => {
        state[cat].index = i * vis;
        applyTransform(cat);
        resetAutoSlide();
      });
      dotsWrap.appendChild(dot);
    }
  }

  /* ── Switch category tab ── */
  function switchTab(cat) {
    activeCat = cat;

    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-cat') === cat));
    panels.forEach(p => {
      const isActive = p.getAttribute('data-panel') === cat;
      p.classList.toggle('active', isActive);
      // Reset transform on hidden panels
      if (!isActive) {
        const track = p.querySelector('.prod-track');
        if (track) track.style.transform = 'translateX(0)';
      }
    });

    // Reset index for newly shown category
    if (state[cat]) state[cat].index = 0;
    applyTransform(cat);
  }

  /* ── Tab click ── */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.getAttribute('data-cat')));
  });

  /* ── Arrow buttons ── */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      state[activeCat].index--;
      applyTransform(activeCat);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      state[activeCat].index++;
      applyTransform(activeCat);
    });
  }

  /* ── Keyboard navigation ── */
  document.addEventListener('keydown', e => {
    const section = document.getElementById('products');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft')  { state[activeCat].index--; applyTransform(activeCat); }
    if (e.key === 'ArrowRight') { state[activeCat].index++; applyTransform(activeCat); }
  });

  /* ── Touch / Swipe support ── */
  panels.forEach(panel => {
    const track = panel.querySelector('.prod-track');
    if (!track) return;
    const cat = panel.getAttribute('data-panel');
    let startX = 0, startY = 0, isDragging = false;

    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      // Only prevent default if clearly horizontal
      if (Math.abs(dx) > Math.abs(dy) + 10) {
        e.preventDefault();
      }
    }, { passive: false });

    track.addEventListener('touchend', e => {
      if (!isDragging) return;
      isDragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      const threshold = 50;
      if (dx < -threshold) {
        state[cat].index++;
        applyTransform(cat);
        resetAutoSlide();
      } else if (dx > threshold) {
        state[cat].index--;
        applyTransform(cat);
        resetAutoSlide();
      }
    }, { passive: true });
  });

  /* ── Recalculate on resize ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => applyTransform(activeCat), 150);
  });

  /* ── Initial render ── */
  switchTab(firstCat);

  /* ── Auto Slide ── */
  let autoSlideInterval;
  const startAutoSlide = () => {
    stopAutoSlide(); // Ensure no duplicates
    autoSlideInterval = setInterval(() => {
      const s = state[activeCat];
      if (!s) return;
      const vis = visibleCount();
      const maxIndex = Math.max(0, s.total - vis);
      if (s.index >= maxIndex) {
        s.index = 0;
      } else {
        s.index++;
      }
      applyTransform(activeCat);
    }, 4500);
  };

  const stopAutoSlide = () => clearInterval(autoSlideInterval);
  const resetAutoSlide = () => { if (autoSlideInterval) startAutoSlide(); };

  startAutoSlide();

  const carouselContainer = document.querySelector('.prod-carousel-outer');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
  }

  /* ── Add reset to interactions ── */
  tabs.forEach(tab => tab.addEventListener('click', resetAutoSlide));
  if (prevBtn) prevBtn.addEventListener('click', resetAutoSlide);
  if (nextBtn) nextBtn.addEventListener('click', resetAutoSlide);
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') resetAutoSlide();
  });
}


/* ================================================================
   6. WORKFLOW — auto-cycle steps when factory section in view
================================================================ */
function initWorkflowCycle() {
  const steps = document.querySelectorAll('.workflow-step');
  if (!steps.length) return;
  let intervalId = null;

  function highlight(i) {
    steps.forEach((s, idx) => s.classList.toggle('active-step', idx === i));
  }

  const factory = document.getElementById('factory');
  if (!factory) return;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      let i = 0;
      highlight(i);
      intervalId = setInterval(() => {
        i = (i + 1) % steps.length;
        highlight(i);
      }, 900);
    } else {
      clearInterval(intervalId);
      highlight(steps.length - 1); // default: last step
    }
  }, { threshold: 0.35 });

  observer.observe(factory);

  // Manual hover override
  steps.forEach((step, i) => {
    step.addEventListener('mouseenter', () => {
      clearInterval(intervalId);
      highlight(i);
    });
    step.addEventListener('mouseleave', () => {
      let idx = i;
      intervalId = setInterval(() => {
        idx = (idx + 1) % steps.length;
        highlight(idx);
      }, 900);
    });
  });
}

/* ================================================================
   7. SCROLL TO TOP BUTTON
================================================================ */
function initScrollTopBtn() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ================================================================
   8. CONTACT FORM — validation + success state
================================================================ */
function submitForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;

  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim()) {
      valid = false;
      field.style.borderColor = '#e53e3e';
      field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
    }
  });

  if (!valid) {
    const submitBtn = form.querySelector('button[type="button"]');
    if (submitBtn) {
      submitBtn.style.animation = 'shake .4s ease';
      setTimeout(() => { submitBtn.style.animation = ''; }, 400);
    }
    return;
  }

  const submitBtn = form.querySelector('button[type="button"]');
  if (submitBtn) { submitBtn.textContent = 'Sending…'; submitBtn.disabled = true; }

  setTimeout(() => {
    form.classList.add('d-none');
    success.classList.remove('d-none');
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 1200);
}

window.submitForm = submitForm;

/* ================================================================
   9. HERO CAROUSEL — Bootstrap safety init
================================================================ */
function initHeroCarousel() {
  const el = document.getElementById('heroCarousel');
  if (!el) return;
  
  // Bootstrap 5 auto-init might have already happened due to data-bs-ride="carousel"
  let c = bootstrap.Carousel.getInstance(el);
  if (!c) {
    c = new bootstrap.Carousel(el, {
      interval: 3500,
      ride: 'carousel',
      wrap: true
    });
  }
  
  // Force cycle to ensure it moves
  c.cycle();
}

/* ================================================================
   10. ACTIVE NAV LINK on scroll
================================================================ */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.navbar-nav .nav-link');
  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -30% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ================================================================
   HELPER — inject shake keyframe
================================================================ */
function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
}

