/**
 * extras.js — All additional features:
 * Stats counter, Back-to-top, Toast notifications,
 * Boot % preloader, Mobile bottom nav, Lazy images,
 * Konami easter egg, Section cursor shapes
 */

// ── 1. STATS COUNTER ─────────────────────────────────────────────────────────
function initStats() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target + (el.dataset.suffix || '');
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current) + (el.dataset.suffix || '');
        }
      }, 16);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ── 2. BACK TO TOP ────────────────────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── 3. TOAST NOTIFICATIONS ────────────────────────────────────────────────────
window.showToast = function (message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
};

// Patch contact form to use toast instead of alert
function patchContactAlerts() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  // Override the submit handler after ContactForm initializes
  setTimeout(() => {
    form.addEventListener('submit', () => {}, true); // ensure toast is available
  }, 500);
}

// ── 4. BOOT PRELOADER % ───────────────────────────────────────────────────────
function initBootPercent() {
  const pct = document.getElementById('boot-percent');
  const bar = document.getElementById('boot-bar');
  if (!pct || !bar) return;

  // Watch the bar width and mirror it as a percentage label
  const observer = new MutationObserver(() => {
    const w = parseFloat(bar.style.width) || 0;
    pct.textContent = Math.floor(w) + '%';
  });
  observer.observe(bar, { attributes: true, attributeFilter: ['style'] });
}

// ── 5. MOBILE BOTTOM NAV ──────────────────────────────────────────────────────
function initMobileNav() {
  const nav = document.getElementById('mobile-bottom-nav');
  if (!nav) return;

  const links = nav.querySelectorAll('a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
}

// ── 6. LAZY LOAD IMAGES WITH BLUR-UP ─────────────────────────────────────────
function initLazyImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.addEventListener('load', () => img.classList.add('loaded'));
      observer.unobserve(img);
    });
  }, { rootMargin: '100px' });

  imgs.forEach(img => observer.observe(img));
}

// ── 7. KONAMI CODE EASTER EGG ─────────────────────────────────────────────────
function initKonami() {
  const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;

  document.addEventListener('keydown', e => {
    if (e.key === code[idx]) {
      idx++;
      if (idx === code.length) {
        idx = 0;
        triggerEasterEgg();
      }
    } else {
      idx = e.key === code[0] ? 1 : 0;
    }
  });
}

function triggerEasterEgg() {
  showToast('🎮 KONAMI CODE! You found the easter egg!', 'info', 4000);

  // Rainbow body flash
  document.body.style.transition = 'filter 0.3s';
  let h = 0;
  const flash = setInterval(() => {
    document.body.style.filter = `hue-rotate(${h}deg) saturate(2)`;
    h += 15;
    if (h >= 360) {
      clearInterval(flash);
      document.body.style.filter = '';
    }
  }, 30);

  // Burst 60 particles from center
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'explosion-particle';
    const angle = (i / 60) * 360;
    const dist = 80 + Math.random() * 120;
    const tx = Math.cos(angle * Math.PI / 180) * dist;
    const ty = Math.sin(angle * Math.PI / 180) * dist;
    const colors = ['#00d9ff','#7c3aed','#f59e0b','#ff00c1','#00fff9','#fff'];
    p.style.cssText = `
      left:${window.innerWidth/2}px; top:${window.innerHeight/2}px;
      background:${colors[i % colors.length]};
      --tx:${tx}px; --ty:${ty}px;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

// ── 8. SECTION CURSOR SHAPES ─────────────────────────────────────────────────
function initSectionCursor() {
  const dot = document.querySelector('.cursor-dot');
  if (!dot || window.matchMedia('(hover: none)').matches) return;

  const sectionCursors = {
    'home':       { color: '#00d9ff', size: '8px' },
    'projects':   { color: '#7c3aed', size: '12px' },
    'skills':     { color: '#f59e0b', size: '8px' },
    'experience': { color: '#00d9ff', size: '8px' },
    'education':  { color: '#28c840', size: '8px' },
    'contact':    { color: '#ff4500', size: '10px' },
  };

  window.addEventListener('scroll', () => {
    let current = 'home';
    document.querySelectorAll('section[id]').forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    const cfg = sectionCursors[current] || sectionCursors['home'];
    dot.style.background = cfg.color;
    dot.style.width = cfg.size;
    dot.style.height = cfg.size;
    dot.style.boxShadow = `0 0 10px ${cfg.color}, 0 0 20px ${cfg.color}40`;
  });
}

// ── INIT ALL ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initStats();
  initBackToTop();
  initBootPercent();
  initMobileNav();
  initLazyImages();
  initKonami();
  initSectionCursor();
  patchContactAlerts();
});
