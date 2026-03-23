/**
 * Theme Management Module
 * Handles dark/light mode toggle and persistence
 */

const ThemeManager = {
  init() {
    this.themeBtn = document.getElementById('theme-btn');
    this.themeIcon = document.getElementById('theme-icon');
    this.themeText = document.getElementById('theme-text');
    this.body = document.body;

    // Load saved theme
    this.loadTheme();

    // Setup event listener
    if (this.themeBtn) {
      this.themeBtn.addEventListener('click', () => this.toggleTheme());
    }
  },

  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.body.classList.add('light-mode');
      this.updateIcon(true);
    }
  },

  toggleTheme() {
    this.body.classList.toggle('light-mode');
    const isLight = this.body.classList.contains('light-mode');
    
    this.updateIcon(isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  },

  updateIcon(isLight) {
    if (this.themeIcon && this.themeText) {
      if (isLight) {
        this.themeIcon.classList.replace('fa-moon', 'fa-sun');
        this.themeText.innerText = 'Light';
      } else {
        this.themeIcon.classList.replace('fa-sun', 'fa-moon');
        this.themeText.innerText = 'Dark';
      }
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
