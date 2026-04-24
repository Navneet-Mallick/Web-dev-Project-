/**
 * Theme Management
 * Cycles: dark → light → neon → dark
 * Auto-detects system preference on first visit
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

  /**
   * Detect system preference for dark/light mode
   * Returns 'dark' or 'light' based on system settings
   */
  function detectSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Get initial theme:
   * 1. Check localStorage for saved preference
   * 2. If first visit, detect system preference
   * 3. Default to 'dark'
   */
  function getInitialTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;

    // First visit - detect system preference
    const systemPref = detectSystemPreference();
    localStorage.setItem('theme', systemPref);
    return systemPref;
  }

  /**
   * Listen for system theme changes
   * Update if user hasn't manually set a theme
   */
  function setupSystemPreferenceListener() {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkModeQuery.addEventListener('change', (e) => {
      // Only auto-update if user hasn't manually set a theme
      // (we can check if they've clicked the theme button)
      const userHasSetTheme = localStorage.getItem('theme-user-set');
      
      if (!userHasSetTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        applyTheme(newTheme, true);
        localStorage.setItem('theme', newTheme);
      }
    });
  }

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
  const saved = getInitialTheme();
  // Apply body class right away before DOMContentLoaded
  if (saved === 'light') document.body.classList.add('light-mode');
  if (saved === 'neon')  document.body.classList.add('neon-mode');

  /* ── Wire up button after DOM ready ─────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('theme-btn');
    if (!btn) return;

    // Sync icon/label with current state (no animation)
    applyTheme(saved, false);

    const handleThemeChange = function (e) {
      e.preventDefault();
      e.stopPropagation();
      const current = localStorage.getItem('theme') || 'dark';
      const next    = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
      applyTheme(next, true);
      localStorage.setItem('theme', next);
      
      // Mark that user has manually set theme
      localStorage.setItem('theme-user-set', 'true');
    };

    btn.addEventListener('click', handleThemeChange);
    btn.addEventListener('touchend', handleThemeChange, { passive: false });

    // Setup system preference listener
    setupSystemPreferenceListener();
  });

  // Expose for shortcuts.js (T key still works — just cycles)
  window.cycleTheme = function () {
    document.getElementById('theme-btn')?.click();
  };

})();
