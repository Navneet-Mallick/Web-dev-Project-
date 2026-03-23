/**
 * Animations Module - CRAZY EDITION
 * Matrix rain, cursor trail, 3D tilt, click explosions,
 * magnetic buttons, audio visualizer, scroll progress
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
    this.setupMatrixRain();
    this.setupClickExplosions();
    this.setupMagneticButtons();
    this.setupAudioVisualizer();
  },

  createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 35; i++) {
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
    const check = () => reveals.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 100)
        el.classList.add('active');
    });
    window.addEventListener('scroll', check);
    check();
  },

  setupProjectCardReveal() {
    const check = () => {
      document.querySelectorAll('.project-card').forEach((card, i) => {
        if (card.getBoundingClientRect().top < window.innerHeight - 100 && !card.classList.contains('reveal-card'))
          setTimeout(() => card.classList.add('reveal-card'), i * 100);
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
          setTimeout(() => { fill.style.width = target; fill.classList.add('animated'); }, 100);
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
        hero.style.transform = `translateY(${scrolled * 0.4}px)`;
        hero.style.opacity = 1 - (scrolled / 700);
      }
    });
  },

  setupScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      bar.style.width = pct + '%';
    });
  },

  setupCursorTrail() {
    if (window.matchMedia('(hover: none)').matches) return;

    const dot  = document.createElement('div'); dot.className  = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });

    const loop = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll('a, button, .btn, .project-card, #theme-btn, #hamburger-wrap, .skill').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
  },

  setupCardTilt() {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const rx = ((y - r.height/2) / r.height) * -12;
        const ry = ((x - r.width/2)  / r.width)  *  12;
        card.style.transform = `translateY(-12px) scale(1.02) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  },

  setupSkillPopIn() {
    const check = () => {
      document.querySelectorAll('.skill').forEach((s, i) => {
        if (s.getBoundingClientRect().top < window.innerHeight - 50 && !s.classList.contains('animated'))
          setTimeout(() => s.classList.add('animated'), i * 60);
      });
    };
    window.addEventListener('scroll', check);
    setTimeout(check, 300);
  },

  // Matrix rain on canvas
  setupMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF</>{}[]';
    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    let drops = Array(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00d9ff';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#00d9ff' : '#f59e0b';
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    setInterval(draw, 50);
    window.addEventListener('resize', () => {
      cols = Math.floor(canvas.width / fontSize);
      drops = Array(cols).fill(1);
    });
  },

  // Click explosion burst
  setupClickExplosions() {
    const colors = ['#00d9ff', '#7c3aed', '#f59e0b', '#ff00c1', '#00fff9', '#ffffff'];

    document.addEventListener('click', e => {
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'explosion-particle';
        const angle = (i / 12) * 360;
        const dist  = 40 + Math.random() * 60;
        const tx = Math.cos(angle * Math.PI / 180) * dist;
        const ty = Math.sin(angle * Math.PI / 180) * dist;
        p.style.cssText = `
          left: ${e.clientX}px; top: ${e.clientY}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          box-shadow: 0 0 6px ${colors[0]};
          --tx: ${tx}px; --ty: ${ty}px;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
      }
    });
  },

  // Magnetic pull on buttons
  setupMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width  / 2;
        const y = e.clientY - r.top  - r.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  },

  // Animated audio visualizer bars in footer
  setupAudioVisualizer() {
    const viz = document.getElementById('audio-viz');
    if (!viz) return;
    const barCount = 28;
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'audio-bar';
      bar.style.animationDelay = (i * 0.05) + 's';
      bar.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
      viz.appendChild(bar);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Animations.init());
