/**
 * Theme Management
 * Cycles: dark → light → neon → dark
 * Saves to localStorage as 'dark' | 'light' | 'neon'
 */

(function () {
  'use strict';

  /* ── Theme definitions ──────────────────────────── */
  const THEMES = ['dark', 'light', 'neon'];

  const META = {
    dark:  { icon: 'fas fa-moon',        label: 'Dark',  ripple: '#0a0e27',  bodyClass: ''           },
    light: { icon: 'fas fa-sun',         label: 'Light', ripple: '#eef3ff',  bodyClass: 'light-mode' },
    neon:  { icon: 'fas fa-bolt',        label: 'Neon',  ripple: '#0d001a',  bodyClass: 'neon-mode'  },
  };

  /* ── Apply a theme ──────────────────────────────── */
  function applyTheme(name, animate) {
    const meta = META[name] || META.dark;

    const doSwitch = () => {
      // Remove all theme classes, then add the right one
      document.body.classList.remove('light-mode', 'neon-mode');
      if (meta.bodyClass) document.body.classList.add(meta.bodyClass);

      const icon = document.getElementById('theme-icon');
      const text = document.getElementById('theme-text');
      if (icon) icon.className = meta.icon;
      if (text) text.innerText  = meta.label;
    };

    if (animate) {
      const ripple = document.createElement('div');
      ripple.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:999998', 'pointer-events:none',
        `background:${meta.ripple}`,
        'opacity:0', 'transition:opacity 0.35s ease',
      ].join(';');
      document.body.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.opacity = '0.65';
        setTimeout(() => {
          doSwitch();
          ripple.style.opacity = '0';
          setTimeout(() => ripple.remove(), 350);
        }, 200);
      });
    } else {
      doSwitch();
    }
  }

  /* ── Restore saved theme immediately (no flash) ─── */
  const saved = localStorage.getItem('theme') || 'dark';
  // Apply body class right away before DOMContentLoaded
  if (saved === 'light') document.body.classList.add('light-mode');
  if (saved === 'neon')  document.body.classList.add('neon-mode');

  /* ── Wire up button after DOM ready ─────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('theme-btn');
    if (!btn) return;

    // Sync icon/label with current state (no animation)
    applyTheme(saved, false);

    btn.addEventListener('click', function () {
      const current = localStorage.getItem('theme') || 'dark';
      const next    = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
      applyTheme(next, true);
      localStorage.setItem('theme', next);
    });
  });

  // Expose for shortcuts.js (T key still works — just cycles)
  window.cycleTheme = function () {
    document.getElementById('theme-btn')?.click();
  };

})();
