/**
 * Animations Module - CRAZY EDITION
 * Matrix rain, cursor trail, 3D tilt, click explosions,
 * magnetic buttons, audio visualizer, scroll progress
 */

const Animations = {
  init() {
    const isMobile = window.innerWidth < 900 || window.matchMedia('(hover: none)').matches;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.setupScrollReveal();
      this.setupProjectCardReveal();
      this.setupSkillTableAnimation();
      this.setupScrollProgress();
      return;
    }

    // On mobile: only run lightweight essentials
    if (isMobile) {
      this.setupScrollReveal();
      this.setupProjectCardReveal();
      this.setupScrollProgress();
      return;
    }

    // Desktop only: all effects
    this.createParticles();
    this.setupScrollReveal();
    this.setupProjectCardReveal();
    this.setupSkillTableAnimation();
    this.setupScrollProgress();
    this.setupMagneticButtons();
    this.setupAudioVisualizer();
    this.setupParallax();
    this.setupCursorTrail();
    this.setupCardTilt();
    this.setupClickExplosions();
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
    const onScroll = () => {
      reveals.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100)
          el.classList.add('active');
      });
    };
    window.addEventListener('optimizedScroll', onScroll);
    onScroll();
  },

  setupProjectCardReveal() {
    const onScroll = () => {
      document.querySelectorAll('.project-card').forEach((card, i) => {
        if (card.getBoundingClientRect().top < window.innerHeight - 100 && !card.classList.contains('reveal-card'))
          setTimeout(() => card.classList.add('reveal-card'), i * 50);
      });
    };
    window.addEventListener('optimizedScroll', onScroll);
    onScroll();
  },

  setupSkillTableAnimation() {
    const bars = document.querySelectorAll('.prof-fill');
    const onScroll = () => {
      bars.forEach(bar => {
        const rect = bar.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50 && !bar.classList.contains('animated')) {
          const targetWidth = bar.style.width;
          bar.style.width = '0';
          setTimeout(() => {
            bar.style.width = targetWidth;
            bar.classList.add('animated');
          }, 100);
        }
      });
    };
    window.addEventListener('optimizedScroll', onScroll);
    setTimeout(onScroll, 600);
  },

  setupParallax() {
    if (window.innerWidth < 900) return;
    window.addEventListener('optimizedScroll', (e) => {
      const scrolled = e.detail.scrollY;
      const hero = document.querySelector('.hero');
      if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.2}px)`;
      }
    });
  },

  setupScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('optimizedScroll', (e) => {
      const pct = (e.detail?.scrollY || window.scrollY) / (document.documentElement.scrollHeight - window.innerHeight) * 100;
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
    if (window.matchMedia('(hover: none)').matches) return;
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

  // Matrix rain on canvas
  setupMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / fontSize);
      drops = Array(cols).fill(1);
    };

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF</>{}[]';
    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    let drops = Array(cols).fill(1);
    let lastTime = 0;
    const interval = 80; // reduced from 50ms to 80ms (~12fps instead of 20fps)
    let rafId;

    const draw = (timestamp) => {
      if (document.hidden) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      if (timestamp - lastTime >= interval) {
        lastTime = timestamp;
        ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#00d9ff' : '#f59e0b';
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }
      rafId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    rafId = requestAnimationFrame(draw);
  },

  // Click explosion burst
  setupClickExplosions() {
    const colors = ['#00d9ff', '#7c3aed', '#f59e0b', '#ff00c1', '#00fff9', '#ffffff'];
    let lastClickTime = 0;

    document.addEventListener('click', e => {
      const now = Date.now();
      if (now - lastClickTime < 100) return; // throttle to prevent spam
      lastClickTime = now;

      for (let i = 0; i < 6; i++) { // reduced from 12 to 6
        const p = document.createElement('div');
        p.className = 'explosion-particle';
        const angle = (i / 6) * 360;
        const dist  = 40 + Math.random() * 60;
        const tx = Math.cos(angle * Math.PI / 180) * dist;
        const ty = Math.sin(angle * Math.PI / 180) * dist;
        p.style.cssText = `
          left: ${e.clientX}px; top: ${e.clientY}px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          box-shadow: 0 0 6px ${colors[0]};
          --tx: ${tx}px; --ty: ${ty}px;
          will-change: transform, opacity;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600); // reduced from 800 to 600
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


// ── EXTRA PASSION ANIMATIONS (desktop only) ───────────────────────────────────
const _isMobileAnim = window.innerWidth < 900 || window.matchMedia('(hover: none)').matches;

// 1. Mouse spotlight
(function setupSpotlight() {
  if (_isMobileAnim) return;
  const spotlight = document.createElement('div');
  spotlight.id = 'spotlight';
  spotlight.style.cssText = `
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background: radial-gradient(600px circle at 50% 50%, rgba(0,217,255,0.04), transparent 70%);
    transition: background 0.1s ease;
  `;
  document.body.appendChild(spotlight);
  let ticking = false;
  document.addEventListener('mousemove', e => {
    if (!ticking) {
      requestAnimationFrame(() => {
        spotlight.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(0,217,255,0.05), transparent 70%)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

// 2. Section title typewriter on scroll into view
document.addEventListener('DOMContentLoaded', function () {
  if (_isMobileAnim) return; // skip on mobile — causes layout shifts and lag
  const titles = document.querySelectorAll('.section-title');
  const seen = new Set();

  titles.forEach(el => {
    const text = el.textContent.trim();
    el.setAttribute('data-text', text);
    el.style.visibility = 'hidden';
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      const el = entry.target;
      const original = el.getAttribute('data-text') || '';
      el.textContent = '';
      el.style.visibility = 'visible';
      let i = 0;
      const iv = setInterval(() => {
        el.textContent += original[i++];
        if (i >= original.length) clearInterval(iv);
      }, 45);
    });
  }, { threshold: 0.5 });

  titles.forEach(t => observer.observe(t));
});

// 3. Skill bar tooltip
(function setupSkillTooltips() {
  if (_isMobileAnim) return;
  document.querySelectorAll('.skill').forEach(skill => {
    const fill = skill.querySelector('.skill-fill');
    if (!fill) return;
    const pct = fill.getAttribute('data-width') || '0%';
    const tip = document.createElement('span');
    tip.textContent = pct;
    tip.style.cssText = `
      position:absolute; top:-28px; right:0;
      background: var(--accent); color:#000;
      font-size:11px; font-weight:700;
      padding:2px 7px; border-radius:4px;
      opacity:0; transition:opacity 0.2s ease;
      pointer-events:none; white-space:nowrap;
    `;
    skill.style.position = 'relative';
    skill.appendChild(tip);
    skill.addEventListener('mouseenter', () => tip.style.opacity = '1');
    skill.addEventListener('mouseleave', () => tip.style.opacity = '0');
  });
})();

// 4. Timeline items slide in from alternating sides
(function setupTimelineReveal() {
  if (_isMobileAnim) return;
  const items = document.querySelectorAll('.timeline-item');
  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = i % 2 === 0 ? 'translateX(-40px)' : 'translateX(40px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateX(0)';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  items.forEach(item => observer.observe(item));

  // Trigger timeline line grow
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const tlObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        timeline.classList.add('visible');
        tlObserver.disconnect();
      }
    }, { threshold: 0.2 });
    tlObserver.observe(timeline);
  }
})();

// 5. Cert cards 3D flip on hover
(function setupCertFlip() {
  if (_isMobileAnim) return;
  document.querySelectorAll('.cert-card').forEach(card => {
    card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease';
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px) rotateY(6deg) rotateX(-3deg) scale(1.03)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// 6. Exp cards slide in from left on scroll
(function setupExpReveal() {
  if (_isMobileAnim) return;
  const cards = document.querySelectorAll('.exp-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateX(-50px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateX(0)';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  cards.forEach(card => observer.observe(card));
})();

// 7. Footer social icons stagger bounce on scroll into view
(function setupFooterSocials() {
  if (_isMobileAnim) return;
  const footer = document.querySelector('footer');
  if (!footer) return;
  // Only target actual social icon links, not all footer links
  const links = footer.querySelectorAll('.social-icons a');
  let triggered = false;

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || triggered) return;
    triggered = true;
    links.forEach((a, i) => {
      setTimeout(() => {
        a.style.animation = 'socialBounce 0.4s cubic-bezier(0.34,1.56,0.64,1) both';
      }, i * 100);
    });
  }, { threshold: 0.5 });

  observer.observe(footer);
})();

// 8. Stat cards pop in with scale on scroll
(function setupStatReveal() {
  if (_isMobileAnim) return;
  const cards = document.querySelectorAll('.stat-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.8) translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'scale(1) translateY(0)';
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  cards.forEach(card => observer.observe(card));
})();

// 9. Skills table rows stagger in on scroll
(function setupSkillsTableReveal() {
  if (_isMobileAnim) return;
  const rows = document.querySelectorAll('.skills-tabular tbody tr');
  if (!rows.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('row-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  rows.forEach(row => observer.observe(row));
})();
