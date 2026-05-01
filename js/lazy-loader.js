/**
 * Lazy Loader Module
 * Loads heavy assets (Three.js, non-critical CSS) only when needed
 * Improves initial page load performance
 */

const LazyLoader = {
  // Track what's been loaded
  loaded: {
    threeJs: false,
    advancedEffects: false,
    welcomeScreen: false
  },

  init() {
    this.setupIntersectionObserver();
    this.loadCriticalCSS();
  },

  /**
   * Load critical CSS immediately (already in HTML)
   * Non-critical CSS will be loaded on demand
   */
  loadCriticalCSS() {
    // Critical CSS already loaded in <head>:
    // - style.css
    // - mobile.css
    // - loading-screen.css
    // - mobile-performance.css
    
    // Non-critical CSS will be loaded when needed
  },

  /**
   * Setup Intersection Observer to detect when hero section is visible
   * Load Three.js only when user can see it
   */
  setupIntersectionObserver() {
    const heroCanvas = document.getElementById('hero-canvas');
    const matrixCanvas = document.getElementById('matrix-canvas');

    if (!heroCanvas && !matrixCanvas) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loaded.threeJs) {
          this.loadThreeJs();
        }
      });
    }, {
      rootMargin: '100px' // Start loading 100px before element is visible
    });

    if (heroCanvas) observer.observe(heroCanvas);
    if (matrixCanvas) observer.observe(matrixCanvas);
  },

  /**
   * Load Three.js library dynamically
   * Only loads when hero section becomes visible
   */
  loadThreeJs() {
    if (this.loaded.threeJs) return;
    if (document.documentElement.getAttribute('data-low-end') === 'true') return;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.loaded.threeJs = true;
      // Notify modules that Three.js is ready without injecting duplicate scripts
      document.dispatchEvent(new CustomEvent('threeJsReady'));
    };

    script.onerror = () => {
      // Silent fail: page has graceful fallback behavior
    };

    document.head.appendChild(script);
  },

  /**
   * Load advanced effects CSS when user scrolls to projects/effects section
   */
  loadAdvancedEffectsCSS() {
    if (this.loaded.advancedEffects) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'CSS/advanced-effects.css';

    link.onload = () => {
      this.loaded.advancedEffects = true;
    };

    link.onerror = () => {};

    document.head.appendChild(link);
  },

  /**
   * Load welcome screen CSS when user scrolls to welcome section
   */
  loadWelcomeScreenCSS() {
    if (this.loaded.welcomeScreen) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'CSS/welcome.css';

    link.onload = () => {
      this.loaded.welcomeScreen = true;
    };

    link.onerror = () => {};

    document.head.appendChild(link);
  },

  /**
   * Generic script loader
   */
  loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  },

  /**
   * Preload assets for better performance
   * Call this when user is idle
   */
  preloadNonCriticalAssets() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadAdvancedEffectsCSS();
        this.loadWelcomeScreenCSS();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.loadAdvancedEffectsCSS();
        this.loadWelcomeScreenCSS();
      }, 3000);
    }
  }
};

// Initialize lazy loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  LazyLoader.init();
  
  // Preload non-critical assets after 2 seconds of idle time
  setTimeout(() => LazyLoader.preloadNonCriticalAssets(), 2000);
});
