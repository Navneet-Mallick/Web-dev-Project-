/**
 * Main Application Entry Point
 * Coordinates all modules and handles global initialization
 */

const App = {
  init() {
    this.setupSmoothScroll();
    this.setupBackToTop();
    this.logPerformance();
  },

  setupSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  },

  setupBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    const updateVisibility = (scrollY) => {
      if (scrollY > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    };

    // Prefer centralized throttled scroll event when available
    window.addEventListener('optimizedScroll', (e) => {
      updateVisibility(e.detail?.scrollY ?? window.scrollY);
    });
    updateVisibility(window.scrollY);

    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  },

  logPerformance() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        console.log('%c👋 Hey there, curious dev!', 'color:#00d9ff;font-size:18px;font-weight:bold;');
        console.log('%cYou found the console easter egg 🥚', 'color:#7c3aed;font-size:13px;');
        console.log('%cNavneet Mallick — Portfolio v2.0', 'color:#f59e0b;font-size:12px;');
        console.log('%cBuilt with: HTML · CSS · Vanilla JS · Passion ❤️', 'color:#e8f0ff;font-size:11px;');
        console.log('%c→ github.com/Navneet-Mallick', 'color:#00d9ff;font-size:11px;');
      }, 1000);
    });
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => App.init());
