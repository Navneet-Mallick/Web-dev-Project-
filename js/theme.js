/**
 * Theme Management - Dark/Light Mode Toggle
 */

(function () {
  function applyTheme(isLight) {
    if (isLight) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }

    var icon = document.getElementById('theme-icon');
    var text = document.getElementById('theme-text');
    if (icon) icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    if (text) text.innerText = isLight ? 'Light' : 'Dark';
  }

  // Apply saved theme immediately (before DOMContentLoaded to avoid flash)
  var saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light-mode');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-btn');
    if (!btn) {
      console.error('theme-btn not found!');
      return;
    }

    // Sync icon with current state
    applyTheme(document.body.classList.contains('light-mode'));

    btn.addEventListener('click', function () {
      var isLight = !document.body.classList.contains('light-mode');
      applyTheme(isLight);
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    console.log('Theme toggle ready');
  });
})();
