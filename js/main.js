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
    // Log page load performance
    window.addEventListener('load', () => {
      if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Page loaded in ${pageLoadTime}ms`);
      }
    });
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => App.init());
