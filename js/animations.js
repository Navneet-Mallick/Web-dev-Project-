/**
 * Animations Module
 * Handles scroll animations, particles, cursor trail, tilt, and visual effects
 */

const Animations = {
  init() {
    this.createParticles();
    this.setupScrollReveal();
    this.setupProjectCardReveal();
    this.setupSkillBars();
    this.setupParallax();
    this.setupScrollProgress();
    this.setupCursorTrail();
    this.setupCardTilt();
    this.setupSkillPopIn();
  },

  createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 20 + 's';
      p.style.animationDuration = (15 + Math.random() * 10) + 's';
      container.appendChild(p);
    }
  },

  setupScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const check = () => {
      reveals.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100)
          el.classList.add('active');
      });
    };
    window.addEventListener('scroll', check);
    check();
  },

  setupProjectCardReveal() {
    const check = () => {
      document.querySelectorAll('.project-card').forEach((card, i) => {
        if (card.getBoundingClientRect().top < window.innerHeight - 100 && !card.classList.contains('reveal-card')) {
          setTimeout(() => card.classList.add('reveal-card'), i * 100);
        }
      });
    };
    window.addEventListener('scroll', check);
    check();
  },

  setupSkillBars() {
    const animate = () => {
      document.querySelectorAll('.skill-fill').forEach(fill => {
        const rect = fill.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0 && !fill.classList.contains('animated')) {
          const target = fill.getAttribute('data-width') || fill.style.width;
          setTimeout(() => {
            fill.style.width = target;
            fill.classList.add('animated');
          }, 100);
        }
      });
    };
    window.addEventListener('scroll', animate);
    setTimeout(animate, 500);
  },

  setupParallax() {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero');
      if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / 600);
      }
    });
  },

  // Scroll progress bar
  setupScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (scrollTop / docHeight * 100) + '%';
    });
  },

  // Custom cursor trail
  setupCursorTrail() {
    // Only on non-touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    });

    // Smooth ring follow
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    };
    animateRing();

    // Expand ring on hoverable elements
    document.querySelectorAll('a, button, .btn, .project-card, #theme-btn, #hamburger-wrap').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
  },

  // 3D tilt effect on project cards
  setupCardTilt() {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -10;
        const rotateY = ((x - cx) / cx) * 10;
        card.style.transform = `translateY(-12px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  },

  // Pop-in animation for skill cards when visible
  setupSkillPopIn() {
    const check = () => {
      document.querySelectorAll('.skill').forEach((skill, i) => {
        const rect = skill.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50 && !skill.classList.contains('animated')) {
          setTimeout(() => skill.classList.add('animated'), i * 60);
        }
      });
    };
    window.addEventListener('scroll', check);
    setTimeout(check, 300);
  }
};

document.addEventListener('DOMContentLoaded', () => Animations.init());
