/* ============================================================
   ScriptFlow — main.js
   All interactive features & animations
   ============================================================ */

'use strict';

/* ===== UTILITIES ===== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ===== SCROLL PROGRESS BAR ===== */
function initProgressBar() {
  const bar = $('#progress-bar');
  if (!bar) return;
  const update = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const pct = (scrollTop / (scrollHeight - clientHeight)) * 100;
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
}

/* ===== CUSTOM CURSOR ===== */
function initCursor() {
  const cursor = $('#cursor');
  const ring   = $('#cursor-ring');
  if (!cursor || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = -100, my = -100, rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  const smoothRing = () => {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(smoothRing);
  };
  smoothRing();

  const hoverEls = 'a, button, [data-cursor-hover]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) {
      cursor.classList.add('hovering');
      ring.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) {
      cursor.classList.remove('hovering');
      ring.classList.remove('hovering');
    }
  });

  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(0.7)';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  });
}

/* ===== NAVBAR ===== */
function initNavbar() {
  const nav     = $('#navbar');
  const burger  = $('#hamburger');
  const menu    = $('#mobile-menu');
  const overlay = $('#mobile-overlay');
  if (!nav) return;

  /* Scroll behavior */
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active link highlighting */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')
      || href.endsWith(currentPage)) {
      link.classList.add('active');
    }
  });

  /* Hamburger toggle */
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    /* Close on overlay click */
    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }
    /* Close on link click */
    $$('.mobile-nav-link', menu).forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  function closeMenu() {
    menu && menu.classList.remove('open');
    burger && burger.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ===== PAGE TRANSITION ===== */
function initPageTransitions() {
  const overlay = $('#page-overlay');
  if (!overlay) return;

  /* Fade in on load */
  overlay.classList.add('visible');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.remove('visible');
    });
  });

  /* Fade out on navigation */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:')
      || href.startsWith('tel:') || href.startsWith('http')
      || link.target === '_blank') return;

    e.preventDefault();
    overlay.classList.add('visible');
    setTimeout(() => { window.location.href = href; }, 380);
  });
}

/* ===== SCROLL REVEAL ===== */
function initScrollReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ===== HERO CANVAS (Particle Network) ===== */
function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, mouse = { x: -9999, y: -9999 };
  const PARTICLE_COUNT = window.innerWidth < 768 ? 50 : 100;
  const CONNECTION_DIST = 140;
  const GOLD  = 'rgba(200,169,81,';
  const WHITE = 'rgba(200,185,150,';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Update & draw particles */
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      /* Mouse repulsion */
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        p.x += dx / dist * force * 1.5;
        p.y += dy / dist * force * 1.5;
      }

      /* Wrap */
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = GOLD + p.opacity + ')';
      ctx.fill();
    });

    /* Draw connections */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          const alpha = (1 - d / CONNECTION_DIST) * 0.25;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = GOLD + alpha + ')';
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createParticles(); }, { passive: true });
  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  resize();
  createParticles();
  draw();
}

/* ===== TYPEWRITER ===== */
function initTypewriter() {
  const el = $('.hero-typewriter');
  if (!el) return;

  const words = [
    'Web Scraping',
    'Browser Automation',
    'Data Extraction',
    'AI Workflows',
    'Pipeline Orchestration',
  ];
  let wi = 0, ci = 0, deleting = false;

  const type = () => {
    const word = words[wi];
    if (!deleting) {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
      setTimeout(type, 80);
    } else {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 45);
    }
  };
  setTimeout(type, 1200);
}

/* ===== COUNTER ANIMATION ===== */
function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const isFloat = target % 1 !== 0;
      const duration = 2000;
      const start  = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const val = target * ease;
        el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ===== TESTIMONIAL CAROUSEL ===== */
function initTestimonials() {
  const track  = $('#testi-track');
  const dots   = $$('.testi-dot');
  const prev   = $('#testi-prev');
  const next   = $('#testi-next');
  if (!track) return;

  const cards = $$('.testimonial-card', track);
  let current = 0, auto;

  function goTo(idx) {
    current = (idx + cards.length) % cards.length;
    cards.forEach((c, i) => c.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    const cardW = cards[0].offsetWidth + 24; /* gap */
    track.style.transform = `translateX(-${current * cardW}px)`;
  }

  function startAuto() {
    auto = setInterval(() => goTo(current + 1), 4500);
  }
  function stopAuto() { clearInterval(auto); }

  dots.forEach((d, i) => {
    d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
  });
  if (prev) prev.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  if (next) next.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  /* Touch / swipe */
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { stopAuto(); goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
  });

  goTo(0);
  startAuto();
}

/* ===== PRICING TOGGLE ===== */
function initPricingToggle() {
  const toggle   = $('#pricing-toggle');
  const monthBtn = $('#monthly-label');
  const annBtn   = $('#annual-label');
  if (!toggle) return;

  let isAnnual = false;
  const prices = $$('[data-monthly]');

  function update() {
    toggle.classList.toggle('annual', isAnnual);
    monthBtn && monthBtn.classList.toggle('active', !isAnnual);
    annBtn   && annBtn.classList.toggle('active', isAnnual);

    prices.forEach(el => {
      const m = parseFloat(el.dataset.monthly);
      const a = parseFloat(el.dataset.annual);
      const target = isAnnual ? a : m;
      animatePrice(el, target);
    });
  }

  function animatePrice(el, target) {
    const current = parseFloat(el.textContent) || 0;
    const duration = 400, start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      el.textContent = Math.round(current + (target - current) * ease);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  toggle.addEventListener('click', () => { isAnnual = !isAnnual; update(); });
  update();
}

/* ===== FAQ ACCORDION ===== */
function initFAQ() {
  $$('.faq-item').forEach(item => {
    const q = $('.faq-q', item);
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach(o => o.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ===== FEATURE TABS ===== */
function initTabs() {
  const tabBtns   = $$('.tab-btn');
  const tabPanels = $$('.tab-panel');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.toggle('active', b === btn));
      tabPanels.forEach(p => {
        const wasActive = p.classList.contains('active');
        p.classList.toggle('active', p.id === target);
        if (p.id === target && !wasActive) {
          /* Re-trigger reveals inside newly-shown tab */
          $$('.reveal', p).forEach(el => {
            el.classList.remove('revealed');
            setTimeout(() => el.classList.add('revealed'), 50);
          });
        }
      });
    });
  });
  /* Activate first tab */
  if (tabBtns[0]) tabBtns[0].click();
}

/* ===== LOGO MARQUEE (duplicate items) ===== */
function initMarquee() {
  $$('.marquee-track').forEach(track => {
    const items = track.innerHTML;
    track.innerHTML = items + items; /* duplicate for seamless loop */
  });
}

/* ===== CONTACT FORM ===== */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const fields = {
    name:    { el: $('#f-name'),    msg: 'Please enter your name.' },
    email:   { el: $('#f-email'),   msg: 'Please enter a valid email.' },
    subject: { el: $('#f-subject'), msg: 'Please select a topic.' },
    message: { el: $('#f-message'), msg: 'Please enter your message.' },
  };

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(key, val) {
    if (key === 'email') return emailRx.test(val.trim());
    if (key === 'subject') return val !== '';
    return val.trim().length >= 2;
  }

  function setError(key, show) {
    const group = fields[key].el?.closest('.form-group');
    if (!group) return;
    group.classList.toggle('error', show);
    const errEl = $('.form-error', group);
    if (errEl) errEl.textContent = fields[key].msg;
  }

  /* Real-time validation */
  Object.keys(fields).forEach(key => {
    const el = fields[key].el;
    if (!el) return;
    el.addEventListener('blur', () => {
      setError(key, !validate(key, el.value));
    });
    el.addEventListener('input', () => {
      if (el.closest('.form-group').classList.contains('error')) {
        setError(key, !validate(key, el.value));
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    Object.keys(fields).forEach(key => {
      const el  = fields[key].el;
      const ok  = el && validate(key, el.value);
      setError(key, !ok);
      if (!ok) valid = false;
    });
    if (!valid) return;

    const btn = $('.form-submit .btn', form);
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

    setTimeout(() => {
      showToast('success', '✓ Message sent! We\'ll get back to you within 24 hours.');
      form.reset();
      if (btn) { btn.textContent = 'Send Message'; btn.disabled = false; }
      Object.keys(fields).forEach(k => setError(k, false));
    }, 1500);
  });
}

/* ===== TOAST SYSTEM ===== */
function showToast(type, message, duration = 4500) {
  let container = $('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
    <span class="toast-text">${message}</span>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

/* ===== CODE COPY BUTTON ===== */
function initCodeCopy() {
  $$('.code-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code-block')?.querySelector('pre');
      if (!pre) return;
      navigator.clipboard.writeText(pre.innerText).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.color = 'var(--gold-300)';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.color = '';
        }, 2000);
      });
    });
  });
}

/* ===== SMOOTH ANCHOR SCROLL ===== */
function initAnchorScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ===== STAGGER REVEAL for grid children ===== */
function initStaggerReveal() {
  $$('[data-stagger]').forEach(parent => {
    const children = parent.children;
    [...children].forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  initCursor();
  initNavbar();
  initPageTransitions();
  initStaggerReveal();
  initScrollReveal();
  initHeroCanvas();
  initTypewriter();
  initCounters();
  initTestimonials();
  initPricingToggle();
  initFAQ();
  initTabs();
  initMarquee();
  initContactForm();
  initCodeCopy();
  initAnchorScroll();
});
