/**
 * performance.js — Core Optimization & Analytics
 * 1. Image lazy loading observer
 * 2. Intersection observer for view-time tracking
 * 3. Throttled scroll & resize listeners
 * 4. Resource prefetching
 * 5. Mobile-specific optimizations (60fps scroll, touch handling)
 */

const Performance = {
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  
  init() {
    this.detectLowEndDevice();
    this.setupLazyLoading();
    this.setupScrollThrottling();
    this.setupViewStats();
    this.prefetchLinks();
    this.optimizeMobilePerformance();
    this.setupAdaptiveRefreshRate();
  },

  detectLowEndDevice() {
    // Disable heavy animations on low-end devices
    const cores = navigator.hardwareConcurrency || 1;
    const memory = navigator.deviceMemory || 4;
    const connection = navigator.connection?.effectiveType || '4g';
    
    if (cores <= 2 || memory <= 2 || connection === '2g' || connection === 'slow-2g') {
      document.documentElement.setAttribute('data-low-end', 'true');
    }
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
    // Centralized rAF-based scroll dispatcher — optimized for 60fps
    let ticking = false;
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY;
          
          // Dispatch custom event for other modules
          window.dispatchEvent(new CustomEvent('optimizedScroll', { 
            detail: { scrollY: currentScrollY, delta } 
          }));
          
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  setupViewStats() {
    // Track section views locally — debounced to avoid excessive localStorage writes
    const sections = document.querySelectorAll('section');
    const viewLog = JSON.parse(localStorage.getItem('nm_view_log') || '{}');
    let saveTimer;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          viewLog[id] = (viewLog[id] || 0) + 1;
          // Debounce: only write to localStorage after 1s of no new intersections
          clearTimeout(saveTimer);
          saveTimer = setTimeout(() => {
            localStorage.setItem('nm_view_log', JSON.stringify(viewLog));
          }, 1000);
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
  },

  optimizeMobilePerformance() {
    if (!this.isMobile) return;

    // 1. Disable hover effects on mobile (they cause lag)
    document.body.classList.add('mobile-device');
    
    // 2. Optimize touch event handling
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      touchEndY = e.touches[0].clientY;
    }, { passive: true });
    
    // 3. Reduce animation complexity on mobile
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 600px) {
        * {
          animation-timing-function: linear !important;
        }
        .project-card:hover,
        .cert-card:hover,
        .stat-card:hover {
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // 4. Optimize scroll performance
    this.enableMomentumScrolling();
  },

  enableMomentumScrolling() {
    // Enable native momentum scrolling on iOS
    const scrollableElements = document.querySelectorAll(
      '.terminal-body, .project-tabs, .skills-table-container, #nav-dropdown'
    );
    
    scrollableElements.forEach(el => {
      el.style.webkitOverflowScrolling = 'touch';
      el.style.overscrollBehavior = 'contain';
    });
  },

  setupAdaptiveRefreshRate() {
    // Detect and adapt to device refresh rate (60Hz, 90Hz, 120Hz)
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;
    
    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Adjust animation durations based on refresh rate
        if (fps > 90) {
          document.documentElement.style.setProperty('--animation-speed', '1.2');
        } else if (fps < 30) {
          // Low performance detected - trigger low-end mode
          document.documentElement.setAttribute('data-low-end', 'true');
          console.warn("Low performance detected, disabling heavy effects.");
        } else if (fps < 50) {
          document.documentElement.style.setProperty('--animation-speed', '0.8');
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    // Measure for first 3 seconds
    requestAnimationFrame(measureFPS);
    setTimeout(() => {
      console.log(`Detected refresh rate: ~${fps}Hz`);
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => Performance.init());
