/**
 * performance.js — Core Optimization & Analytics
 * 1. Image lazy loading observer
 * 2. Intersection observer for view-time tracking
 * 3. Throttled scroll & resize listeners
 * 4. Resource prefetching
 */

const Performance = {
  init() {
    this.setupLazyLoading();
    this.setupScrollThrottling();
    this.setupViewStats();
    this.prefetchLinks();
  },

  setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add('loaded');
            }
            imgObserver.unobserve(img);
          }
        });
      }, { rootMargin: '0px 0px 400px 0px' });

      images.forEach(img => imgObserver.observe(img));
    }
  },

  setupScrollThrottling() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Global scroll-based triggers can be centralized here if needed
          ticking = false;
        });
        ticking = true;
      }
    });
  },

  setupViewStats() {
    // Track how long users stay on specific sections (local only)
    const sections = document.querySelectorAll('section');
    const viewLog = JSON.parse(localStorage.getItem('nm_view_log') || '{}');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          viewLog[id] = (viewLog[id] || 0) + 1;
          localStorage.setItem('nm_view_log', JSON.stringify(viewLog));
        }
      });
    }, { threshold: 0.6 });

    sections.forEach(s => observer.observe(s));
  },

  prefetchLinks() {
    // Prefetch assets for major sections on hover
    const links = document.querySelectorAll('.nav-links a, .btn-cv');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href && href.endsWith('.pdf')) {
          const prefetch = document.createElement('link');
          prefetch.rel = 'prefetch';
          prefetch.href = href;
          document.head.appendChild(prefetch);
        }
      }, { once: true });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Performance.init());
