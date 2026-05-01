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
      const duration = 2000;
      const startTime = performance.now();

      el.classList.add('counting');

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current + (el.dataset.suffix || '');
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target + (el.dataset.suffix || '');
          el.classList.remove('counting');
        }
      }

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ── 2. BACK TO TOP ────────────────────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  if (btn.dataset.scrollBound === 'true') return;
  btn.dataset.scrollBound = 'true';

  const updateVisibility = (scrollY) => {
    btn.classList.toggle('visible', scrollY > 400);
  };

  // Use throttled global scroll bus to avoid duplicate heavy listeners
  window.addEventListener('optimizedScroll', (e) => {
    updateVisibility(e.detail?.scrollY ?? window.scrollY);
  });
  updateVisibility(window.scrollY);

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
  // Percent is now driven directly by audio.js animateBarTo()
  // This function is kept as a no-op to avoid breaking the init chain
}

// ── 5. MOBILE BOTTOM NAV ──────────────────────────────────────────────────────
function initMobileNav() {
  const nav = document.getElementById('mobile-bottom-nav');
  if (!nav) return;

  const links = nav.querySelectorAll('a');
  const sections = document.querySelectorAll('section[id]');

  const updateActiveLink = (scrollY) => {
    let current = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  };

  // Use centralized throttled scroll event
  window.addEventListener('optimizedScroll', (e) => {
    updateActiveLink(e.detail?.scrollY ?? window.scrollY);
  });
  updateActiveLink(window.scrollY);
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

// ── 7. "HACKER" KEYWORD EASTER EGG ───────────────────────────────────────────
function initKonami() {
  const secret = 'hacker';
  let typed = '';

  document.addEventListener('keydown', e => {
    // Ignore if user is typing in an input/textarea
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    typed += e.key.toLowerCase();
    if (typed.length > secret.length) typed = typed.slice(-secret.length);
    if (typed === secret) {
      typed = '';
      triggerEasterEgg();
    }
  });
}

window.triggerEasterEgg = function() {
  // ── HACKER TERMINAL OVERLAY ──────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'hacker-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 999999;
    background: #000; color: #00ff41;
    font-family: 'Courier New', monospace;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    overflow: hidden; cursor: default;
  `;

  // Matrix rain canvas
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;opacity:0.18;pointer-events:none;';
  overlay.appendChild(canvas);

  // Terminal box
  const term = document.createElement('div');
  term.style.cssText = `
    position: relative; z-index: 2;
    border: 1px solid #00ff41;
    box-shadow: 0 0 30px #00ff4166, inset 0 0 30px #00ff410a;
    padding: 36px 48px; max-width: 620px; width: 90%;
    background: rgba(0,0,0,0.85);
  `;

  const pre = document.createElement('pre');
  pre.style.cssText = 'margin:0; font-size:clamp(11px,1.6vw,14px); line-height:1.7; color:#00ff41; white-space:pre-wrap;';
  term.appendChild(pre);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '[ ESC / CLICK TO EXIT ]';
  closeBtn.style.cssText = `
    display:block; margin-top:28px; background:transparent;
    border:1px solid #00ff41; color:#00ff41; padding:8px 24px;
    font-family:inherit; font-size:12px; cursor:pointer; letter-spacing:2px;
    transition: background 0.2s, color 0.2s;
  `;
  closeBtn.onmouseenter = () => { closeBtn.style.background='#00ff41'; closeBtn.style.color='#000'; };
  closeBtn.onmouseleave = () => { closeBtn.style.background='transparent'; closeBtn.style.color='#00ff41'; };
  term.appendChild(closeBtn);
  overlay.appendChild(term);
  document.body.appendChild(overlay);

  // ── Matrix rain ──────────────────────────────────────────────────────────
  const ctx = canvas.getContext('2d');
  let rafId;
  function resizeCanvas() {
    canvas.width  = overlay.offsetWidth;
    canvas.height = overlay.offsetHeight;
  }
  resizeCanvas();
  const cols = Math.floor(canvas.width / 16);
  const drops = Array(cols).fill(1);
  function drawMatrix() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = '14px monospace';
    drops.forEach((y, i) => {
      const ch = String.fromCharCode(0x30A0 + Math.random() * 96);
      ctx.fillText(ch, i * 16, y * 16);
      if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
    rafId = requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  // ── Typewriter lines ─────────────────────────────────────────────────────
  const lines = [
    '> SECRET KEYWORD DETECTED...',
    '> INITIATING BACKDOOR ACCESS...',
    '> BYPASSING FIREWALL [████████] 100%',
    '> DECRYPTING PORTFOLIO DATA...',
    '',
    '  ACCESS GRANTED — WELCOME, HACKER.',
    '',
    '  You just unlocked the secret layer.',
    '  You typed the magic word: "hacker"',
    '',
    '  Navneet hid this for people like you.',
    '  The curious ones. The real ones. 🖤',
    '',
    '> CONNECTION SECURE. HAVE FUN. 🔓',
  ];

  let lineIdx = 0, charIdx = 0;
  function typeNext() {
    if (lineIdx >= lines.length) return;
    const line = lines[lineIdx];
    if (charIdx <= line.length) {
      pre.textContent = lines.slice(0, lineIdx).join('\n') + '\n' + line.slice(0, charIdx) + (charIdx < line.length ? '█' : '');
      charIdx++;
      setTimeout(typeNext, charIdx === 1 ? 80 : 28);
    } else {
      lineIdx++; charIdx = 0;
      setTimeout(typeNext, lineIdx < lines.length ? 120 : 0);
    }
  }
  setTimeout(typeNext, 200);

  // ── Close logic ──────────────────────────────────────────────────────────
  function closeOverlay() {
    cancelAnimationFrame(rafId);
    overlay.style.transition = 'opacity 0.4s ease';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 420);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') closeOverlay(); }
  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', onKey);

  // Auto-close after 18s
  setTimeout(closeOverlay, 18000);
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

  const updateCursor = (scrollY) => {
    let current = 'home';
    document.querySelectorAll('section[id]').forEach(s => {
      if (scrollY >= s.offsetTop - 200) current = s.id;
    });
    const cfg = sectionCursors[current] || sectionCursors['home'];
    dot.style.background = cfg.color;
    dot.style.width = cfg.size;
    dot.style.height = cfg.size;
    dot.style.boxShadow = `0 0 10px ${cfg.color}, 0 0 20px ${cfg.color}40`;
  };

  window.addEventListener('optimizedScroll', (e) => {
    updateCursor(e.detail?.scrollY ?? window.scrollY);
  });
  updateCursor(window.scrollY);
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
