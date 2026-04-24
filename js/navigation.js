/**
 * Navigation Module
 * Handles navbar behavior, dropdown menu, and scroll effects
 */

const Navigation = {
  init() {
    this.navbar = document.querySelector('.navbar');
    this.hamburger = document.getElementById('hamburger-wrap');
    this.dropdown = document.getElementById('nav-dropdown');
    this.navLinks = document.querySelectorAll('.nav-links a');
    this.sections = document.querySelectorAll('section');

    this.setupDropdown();
    this.setupScrollEffects();
    this.setupActiveLinks();
  },

  setupDropdown() {
    if (!this.hamburger || !this.dropdown) return;

    // Toggle dropdown
    this.hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = this.dropdown.classList.toggle('active');
      this.hamburger.classList.toggle('open', isOpen);
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.dropdown.contains(e.target) && !this.hamburger.contains(e.target)) {
        this.dropdown.classList.remove('active');
        this.hamburger.classList.remove('open');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.dropdown.classList.contains('active')) {
        this.dropdown.classList.remove('active');
        this.hamburger.classList.remove('open');
        this.hamburger.focus();
      }
    });

    // Close when clicking a link
    this.dropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.dropdown.classList.remove('active');
        this.hamburger.classList.remove('open');
      });
    });
  },

  setupScrollEffects() {
    window.addEventListener('scroll', () => {
      // Add scrolled class to navbar
      if (window.scrollY > 50) {
        this.navbar?.classList.add('scrolled');
      } else {
        this.navbar?.classList.remove('scrolled');
      }
    });
  },

  setupActiveLinks() {
    const mobileNav = document.getElementById('mobile-bottom-nav');
    const mobileLinks = mobileNav?.querySelectorAll('a') || [];

    window.addEventListener('scroll', () => {
      let current = '';

      this.sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      // Update desktop nav links
      this.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });

      // Update mobile bottom nav links
      mobileLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    });

    // Set initial active state
    if (mobileLinks.length > 0) {
      mobileLinks[0].classList.add('active');
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Navigation.init());
