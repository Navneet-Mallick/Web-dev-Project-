/**
 * cherry.js — Lightweight cherry-on-top extras
 * No dependencies, no interference with existing code
 */

// ── 1. DYNAMIC PAGE TITLE ON SCROLL ──────────────────────────────────────────
(function dynamicTitle() {
  const base = 'Navneet Mallick | Portfolio';
  const labels = {
    home:         '👋 Navneet Mallick',
    about:        '🙋 About Me',
    'terminal-intro': '💻 Terminal',
    stats:        '📊 Stats',
    projects:     '🚀 Projects',
    'github-stats': '📈 GitHub',
    education:    '🎓 Education',
    experience:   '💼 Experience',
    certifications: '🏆 Certifications',
    skills:       '🧠 Skills',
    location:     '📍 Location',
    contact:      '📬 Contact',
  };

  let lastId = '';
  window.addEventListener('scroll', () => {
    let current = 'home';
    document.querySelectorAll('section[id]').forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    if (current !== lastId) {
      lastId = current;
      document.title = labels[current] ? `${labels[current]} — Portfolio` : base;
    }
  });
})();


// ── 2. MAGNETIC NAV LINKS ─────────────────────────────────────────────────────
(function magneticNav() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('mousemove', e => {
      const r = link.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.25;
      const y = (e.clientY - r.top  - r.height / 2) * 0.25;
      link.style.transform = `translate(${x}px, ${y}px)`;
    });
    link.addEventListener('mouseleave', () => {
      link.style.transform = '';
    });
  });
})();


// ── 3. CONTACT TEXTAREA CHARACTER COUNTER ────────────────────────────────────
(function charCounter() {
  const textarea = document.querySelector('.contact-form textarea');
  if (!textarea) return;

  const counter = document.createElement('div');
  counter.style.cssText = `
    text-align: right;
    font-size: 11px;
    opacity: 0.5;
    margin-top: -10px;
    margin-bottom: 4px;
    transition: color 0.3s ease;
    font-family: monospace;
  `;
  counter.textContent = '0 / 500';
  textarea.insertAdjacentElement('afterend', counter);

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    const max = 500;
    counter.textContent = `${len} / ${max}`;
    counter.style.color = len > max * 0.9
      ? '#f59e0b'
      : len > max
        ? '#ff4500'
        : '';
    counter.style.opacity = len > 0 ? '0.7' : '0.4';
  });
})();


// ── 4. PROJECT CARD HUE SHIFT ON MOUSE POSITION ──────────────────────────────
(function cardHueShift() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const hue = Math.round(x * 60); // 0–60 deg shift
      card.style.filter = `hue-rotate(${hue}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.filter = '';
    });
  });
})();


// ── 5. SKILLS TABLE ROW TILT ─────────────────────────────────────────────────
(function skillsRowTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.skills-tabular tbody tr').forEach(row => {
    row.style.transition = 'transform 0.2s ease';
    row.addEventListener('mousemove', ev => {
      const r = row.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width  - 0.5) * 4;
      const y = ((ev.clientY - r.top)  / r.height - 0.5) * 4;
      row.style.transform = `perspective(600px) rotateX(${-y}deg) rotateY(${x}deg)`;
    });
    row.addEventListener('mouseleave', () => {
      row.style.transform = '';
    });
  });
})();


// ── 6. TYPING SOUND ON TERMINAL INPUT ────────────────────────────────────────
(function terminalTypingSound() {
  // Subtle visual feedback — flash the terminal cursor on keypress
  document.addEventListener('keydown', e => {
    const input = document.querySelector('.t-input');
    if (!input || document.activeElement !== input) return;
    input.style.textShadow = '0 0 8px var(--accent)';
    clearTimeout(input._glowTimer);
    input._glowTimer = setTimeout(() => input.style.textShadow = '', 120);
  });
})();


// ── 7. AVAILABILITY BADGE TOOLTIP ────────────────────────────────────────────
(function availBadgeTooltip() {
  const badge = document.querySelector('.availability-badge');
  if (!badge) return;

  const tip = document.createElement('div');
  tip.textContent = '👀 Open to internships, freelance & collabs';
  tip.style.cssText = `
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    background: var(--card-bg);
    border: 1px solid var(--accent);
    color: var(--text-color);
    font-size: 12px;
    padding: 6px 14px;
    border-radius: 8px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
    box-shadow: 0 4px 20px var(--accent-glow);
    z-index: 100;
  `;
  badge.style.position = 'relative';
  badge.appendChild(tip);

  badge.addEventListener('mouseenter', () => {
    tip.style.opacity = '1';
    tip.style.transform = 'translateX(-50%) scale(1)';
  });
  badge.addEventListener('mouseleave', () => {
    tip.style.opacity = '0';
    tip.style.transform = 'translateX(-50%) scale(0.9)';
  });
})();


// ── 8. FOOTER YEAR PULSE ─────────────────────────────────────────────────────
(function footerYearPulse() {
  const yr = document.getElementById('footer-year');
  if (!yr) return;
  yr.style.cssText = 'color: var(--accent); font-weight: 700; cursor: default;';
  yr.title = 'Made in ' + new Date().getFullYear();
})();
