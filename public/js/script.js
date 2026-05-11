// Global Scripts for all pages
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Navbar scroll effect
    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainNav.classList.add('scrolled', 'shadow-sm');
                if (mainNav.classList.contains('transparent')) mainNav.classList.remove('transparent');
            } else {
                mainNav.classList.remove('scrolled', 'shadow-sm');
                if (mainNav.dataset.solid !== 'true') mainNav.classList.add('transparent');
            }
        });
        // trigger once on load
        window.dispatchEvent(new Event('scroll'));
    }

    // Scroll to top button
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.getAttribute('data-delay') || '0');
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
                // observer.unobserve(entry.target); // Optional: if we only want it to animate once
            }
        });
    }, { threshold: 0.1 });

    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => observer.observe(el));

    // Helper to observe new elements
    window.observeNewElements = (container) => {
        container.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    };

    // Products Data & other dynamic data fetching
    let appData = null;
    try {
        const res = await fetch('assets/json/data.json');
        appData = await res.json();
    } catch (e) {
        console.error("Failed to load data.json:", e);
    }

    // Render Infinite Product Rows
    const productsContainer = document.getElementById('infiniteProductsContainer');

    if (productsContainer && appData && appData.categories) {
        let containerHtml = '';

        const categoriesArray = Object.keys(appData.categories).map(key => {
            let title = key.charAt(0).toUpperCase() + key.slice(1);
            // if (key === 'mens') title = "Men's Wear";
            // else if (key === 'ladies') title = "Ladies Wear";
            // else if (key === 'kids') title = "Kids Wear";
            return {
                // id: key,
                // title: title,
                items: appData.categories[key]
            };
        });

        categoriesArray.forEach((cat, index) => {
            let groupHtml = '';
            // Ensure enough items for smooth loop
            let displayItems = [...cat.items];
            while (displayItems.length < 10) {
                displayItems = displayItems.concat(cat.items);
            }

            displayItems.forEach(item => {
                groupHtml += `
                    <div class="marquee-slide">
                        <div class="product-card" onclick="window.location.href='product-detail.html?id=${item.id}'">
                            <span class="brand-badge">OEM</span>
                            <div class="product-img-wrap">
                                <img src="${item.image}" alt="${item.name}" class="product-img">
                            </div>
                            <div class="product-info">
                                <h4 class="product-name">${item.name}</h4>
                                <span class="product-cat">${item.category}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            containerHtml += `
                <div class="marquee-row" data-animate="fade-up" data-delay="${index * 100}">
                    
                    <div class="marquee-track-container" dir="ltr">
                       <div class="marquee-track" data-direction="${index % 2 !== 0 ? 'reverse' : 'normal'}">
                           <div class="marquee-group">${groupHtml}</div>
                           <div class="marquee-group" aria-hidden="true">${groupHtml}</div>
                       </div>
                    </div>
                </div>
            `;
        });

        productsContainer.innerHTML = containerHtml;
        observeNewElements(productsContainer);
    }

    // Certs Grid
    const certsGrid = document.getElementById('certsGrid');
    if (certsGrid && appData && appData.certificates) {
        certsGrid.innerHTML = appData.certificates.standards.map((c, i) => `
            <div class="col-6 col-sm-4 col-lg-3" data-animate="fade-up" data-delay="${i * 80}">
                <div class="cert-card">
                    <div class="cert-icon"><i class="bi ${c.icon}"></i></div>
                    <h6 class="cert-name mb-1">${c.name}</h6>
                    <span class="cert-desc">${c.desc}</span>
                </div>
            </div>
        `).join('');
        observeNewElements(certsGrid);
    }

    // Number counter animation
    const statVals = document.querySelectorAll('.factory-stat-val, .counter-percent');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const isPercent = el.classList.contains('counter-percent');
                const targetAttr = isPercent ? 'data-target' : 'data-count';
                const target = parseInt(el.getAttribute(targetAttr));
                const duration = 2000;
                const step = target / (duration / 16); // 60fps
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        el.textContent = Math.ceil(current).toLocaleString() + (isPercent ? '%' : '');
                        requestAnimationFrame(updateCounter);
                    } else {
                        el.textContent = target.toLocaleString() + (isPercent ? '%' : '');
                    }
                };

                // If it's a percent counter, also animate the sibling progress bar
                if (isPercent) {
                    setTimeout(() => {
                        const bar = el.closest('.tracker-item').querySelector('.progress-bar');
                        if (bar) {
                            bar.style.width = bar.getAttribute('data-width') + '%';
                        }
                    }, 100);
                }

                updateCounter();
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statVals.forEach(val => counterObserver.observe(val));

    // Workflow Animation
    const workflowSteps = document.querySelectorAll('.workflow-step');
    if (workflowSteps.length > 0) {
        let currentStep = 0;
        setInterval(() => {
            workflowSteps.forEach(step => step.classList.remove('active-step'));
            workflowSteps[currentStep].classList.add('active-step');
            currentStep = (currentStep + 1) % workflowSteps.length;
        }, 1500);
    }

    // Populate Clients Marquee
    if (appData && appData.clients) {
        const clientGroupHtml = appData.clients.map(client => `
            <div class="px-5">
                <img src="${client.image}" alt="${client.name}" style="height: 40px; opacity: 0.6; filter: grayscale(100%); transition: all 0.3s ease;" class="client-logo-hover">
            </div>
        `).join('');

        const g1 = document.getElementById('clientLogosGroup');
        const g2 = document.getElementById('clientLogosGroupClone');
        if (g1 && g2) {
            // Repeat to fill space if few clients
            let finalHtml = clientGroupHtml;
            while (finalHtml.split('<img').length < 8) {
                finalHtml += clientGroupHtml;
            }
            g1.innerHTML = finalHtml;
            g2.innerHTML = finalHtml;
        }
    }
    // Initialize Marquees
    initMarquees();

    // Populate Leadership Messages
    const leadershipMessagesContainer = document.querySelector('#messages .row.g-4');
    if (leadershipMessagesContainer && appData && appData.leadership) {
        const ceoData = appData.leadership.find(leader => leader.tag === 'CEO');
        const mdData = appData.leadership.find(leader => leader.tag === 'MD');
        const directorData = appData.leadership.find(leader => leader.tag === 'Director');

        const populateLeaderCard = (cardId, leader) => {
            if (!leader) return;
            const card = document.getElementById(cardId);
            if (card) {
                card.querySelector('.message-avatar-img').src = leader.image;
                card.querySelector('.message-avatar-img').alt = leader.name;
                card.querySelector('.message-name').textContent = leader.name;
                card.querySelector('.message-title').textContent = leader.role;
                card.querySelector('.msg-visible').textContent = leader.content[0].substring(0, 200) + '...';
                card.querySelector('.btn-see-more').onclick = () => { window.location.href=`leadership.html?id=${leader.tag.toLowerCase()}` };
            }
        };
        
        populateLeaderCard('ceoCard', ceoData);
        populateLeaderCard('mdCard', mdData);
        populateLeaderCard('directorCard', directorData);
        observeNewElements(leadershipMessagesContainer);
    }
});

function initMarquees() {
    const containers = document.querySelectorAll('.marquee-track-container');

    containers.forEach(container => {
        let isDown = false;
        let startX;
        let scrollLeft;
        let animationId;
        const track = container.querySelector('.marquee-track');
        if (!track) return;

        const isReverse = track.getAttribute('data-direction') === 'reverse';
        let speed = isReverse ? -1 : 1;

        const playMarquee = () => {
            if (isDown) return;
            const groups = track.querySelectorAll('.marquee-group');
            if (groups.length < 2) return;
            const groupWidth = groups[0].offsetWidth;

            // Wait until width is valid
            if (groupWidth === 0) {
                animationId = requestAnimationFrame(playMarquee);
                return;
            }

            if (isReverse) {
                if (container.scrollLeft <= 0) container.scrollLeft += groupWidth;
                container.scrollLeft += speed;
            } else {
                if (container.scrollLeft >= groupWidth) container.scrollLeft -= groupWidth;
                container.scrollLeft += speed;
            }
            animationId = requestAnimationFrame(playMarquee);
        };

        // Pause on hover
        container.addEventListener('mouseenter', () => {
            if (!isDown) cancelAnimationFrame(animationId);
        });

        container.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                container.style.cursor = 'grab';
            }
            cancelAnimationFrame(animationId);
            playMarquee();
        });

        // Drag events
        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            cancelAnimationFrame(animationId);
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
            cancelAnimationFrame(animationId);
            playMarquee();
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5;
            container.scrollLeft = scrollLeft - walk;

            const groups = track.querySelectorAll('.marquee-group');
            if (groups.length < 2) return;
            const groupWidth = groups[0].offsetWidth;

            if (isReverse && container.scrollLeft <= 0) {
                container.scrollLeft += groupWidth;
                scrollLeft += groupWidth;
            } else if (!isReverse && container.scrollLeft >= groupWidth) {
                container.scrollLeft -= groupWidth;
                scrollLeft -= groupWidth;
            }
        });

        // Start
        setTimeout(() => {
            if (isReverse) {
                const groups = track.querySelectorAll('.marquee-group');
                if (groups.length >= 2) container.scrollLeft = groups[0].offsetWidth;
            }
            playMarquee();
        }, 500); // give time for layout
    });
}

function submitForm() {
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (form && success) {
        form.classList.add('d-none');
        success.classList.remove('d-none');
    }
}

// <!-- ============ Global footprint SCRIPT ============ -->

(function () {
  var pinData = {
    bgd: { title: 'Bangladesh — Headquarters', desc: 'Our production & logistics hub' },
    usa: { title: 'United States',              desc: 'Major retail & wholesale partner' },
    can: { title: 'Canada',                     desc: 'Growing distribution network' },
    eur: { title: 'Europe — UK, Germany, France', desc: 'Certified to EU quality standards' },
    aus: { title: 'Australia & New Zealand',    desc: 'Pacific-region supply chain' },
    jpn: { title: 'Japan & East Asia',          desc: 'Premium product segment' },
  };
 
  var svg     = document.getElementById('mapSvg');
  var wrap    = document.getElementById('mapWrap');
  var tooltip = document.getElementById('gfTooltip');
  var ttTitle = document.getElementById('gfTtTitle');
  var ttDesc  = document.getElementById('gfTtDesc');
 
  svg.querySelectorAll('.gf-pin').forEach(function (pin) {
    pin.addEventListener('mouseenter', function () {
      var id = pin.dataset.id;
      var d  = pinData[id];
      if (!d) return;
      ttTitle.textContent = d.title;
      ttDesc.textContent  = d.desc;
 
      // Map SVG coordinates → page coords → wrap-relative coords
      var match = pin.getAttribute('transform').match(/translate\(([^,]+),([^)]+)\)/);
      var cx = parseFloat(match[1]);
      var cy = parseFloat(match[2]);
      var pt = svg.createSVGPoint();
      pt.x = cx; pt.y = cy;
      var screen   = pt.matrixTransform(svg.getScreenCTM());
      var wrapRect = wrap.getBoundingClientRect();
      tooltip.style.left = (screen.x - wrapRect.left) + 'px';
      tooltip.style.top  = (screen.y - wrapRect.top - 10) + 'px';
      tooltip.classList.add('gf-show');
    });
    pin.addEventListener('mouseleave', function () {
      tooltip.classList.remove('gf-show');
    });
  });
 
  // Animate counters
  function animateStat(el, target, suffix) {
    var current  = 0;
    var step     = target / 40;
    var interval = setInterval(function () {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current) + (suffix || '');
      if (current >= target) clearInterval(interval);
    }, 30);
  }
 
  // Trigger when section enters viewport
  var statsAnimated = false;
  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !statsAnimated) {
      statsAnimated = true;
      // ↓ Update these numbers to match your real data
      animateStat(document.getElementById('gfS1'), 30, '+');
      animateStat(document.getElementById('gfS2'),  5, '');
      animateStat(document.getElementById('gfS3'),  6, '+');
      animateStat(document.getElementById('gfS4'), 500, '+');
    }
  }, { threshold: 0.2 });
 
  observer.observe(document.getElementById('globalFootprint'));
})();

// <!-- ============ END GLOBAL FOOTPRINT ============ -->