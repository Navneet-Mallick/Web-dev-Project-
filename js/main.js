/**
 * Main Application Entry Point
 * Coordinates all modules and handles global initialization
 */

const App = {
  init() {
    console.log('🚀 Portfolio initialized');
    
    // All modules are initialized via their own DOMContentLoaded listeners
    // This file serves as the main entry point and can handle global tasks
    
    this.setupSmoothScroll();
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

  logPerformance() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const [entry] = performance.getEntriesByType('navigation');
        if (entry) console.log(`⚡ Page loaded in ${Math.round(entry.duration)}ms`);
      }, 0);
    });
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => App.init());
