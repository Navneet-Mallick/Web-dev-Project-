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
      this.dropdown.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.dropdown.contains(e.target) && !this.hamburger.contains(e.target)) {
        this.dropdown.classList.remove('active');
      }
    });

    // Close when clicking a link
    this.dropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.dropdown.classList.remove('active');
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
    window.addEventListener('scroll', () => {
      let current = '';

      this.sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      this.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    });
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Navigation.init());
