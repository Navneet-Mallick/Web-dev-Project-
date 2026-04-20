/**
 * Theme Management - Dark/Light Mode Toggle with smooth transition
 */

(function () {
  function applyTheme(isLight, animate) {
    if (animate) {
      // Smooth ripple transition
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed; inset: 0; z-index: 999998; pointer-events: none;
        background: ${isLight ? '#eef3ff' : '#0a0e27'};
        opacity: 0; transition: opacity 0.35s ease;
      `;
      document.body.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.opacity = '0.6';
        setTimeout(() => {
          if (isLight) document.body.classList.add('light-mode');
          else document.body.classList.remove('light-mode');
          ripple.style.opacity = '0';
          setTimeout(() => ripple.remove(), 350);
        }, 200);
      });
    } else {
      if (isLight) document.body.classList.add('light-mode');
      else document.body.classList.remove('light-mode');
    }

    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (icon) icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    if (text) text.innerText = isLight ? 'Light' : 'Dark';
  }

  // Apply saved theme immediately (no animation to avoid flash)
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.body.classList.add('light-mode');

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('theme-btn');
    if (!btn) return;

    applyTheme(document.body.classList.contains('light-mode'), false);

    btn.addEventListener('click', function () {
      const isLight = !document.body.classList.contains('light-mode');
      applyTheme(isLight, true);
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  });
})();
