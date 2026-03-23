/**
 * Animations Module
 * Handles scroll animations, particles, and visual effects
 */

const Animations = {
  init() {
    this.createParticles();
    this.setupScrollReveal();
    this.setupProjectCardReveal();
    this.setupSkillBars();
    this.setupParallax();
  },

  // Create floating particles
  createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      particlesContainer.appendChild(particle);
    }
  },

  // Scroll reveal for sections
  setupScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;

      reveals.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < windowHeight - 100) {
          el.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
  },

  // Staggered reveal for project cards
  setupProjectCardReveal() {
    const revealProjectCards = () => {
      const cards = document.querySelectorAll('.project-card');
      
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        
        if (isVisible && !card.classList.contains('reveal-card')) {
          setTimeout(() => {
            card.classList.add('reveal-card');
          }, index * 100);
        }
      });
    };

    window.addEventListener('scroll', revealProjectCards);
    revealProjectCards(); // Initial check
  },

  // Animated skill bars
  setupSkillBars() {
    const animateSkillBars = () => {
      const skillFills = document.querySelectorAll('.skill-fill');
      
      skillFills.forEach(fill => {
        const rect = fill.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible && !fill.classList.contains('animated')) {
          const targetWidth = fill.getAttribute('data-width') || fill.style.width;
          setTimeout(() => {
            fill.style.width = targetWidth;
            fill.classList.add('animated');
          }, 100);
        }
      });
    };

    window.addEventListener('scroll', animateSkillBars);
    setTimeout(animateSkillBars, 500); // Initial check after delay
  },

  // Parallax effect for hero section
  setupParallax() {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero');
      
      if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / 600);
      }
    });
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Animations.init());
