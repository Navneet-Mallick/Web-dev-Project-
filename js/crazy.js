/**
 * crazy.js — Extra wild effects
 * 1. Glitch effect on hero name
 * 2. 3D tilt on profile picture
 * 3. Hire Me button neon ripple
 * 4. Logo secret easter egg (click 5x)
 * 5. Skill badge spark burst on hover
 * 6. Cursor trail particles
 * 7. Section skew warp reveal
 */

// ── EASTER EGG MODAL HELPER ───────────────────────────────────────────────────
function showEggModal(emoji, title, msg) {
  const modal = document.getElementById('egg-modal');
  if (!modal) return;
  document.getElementById('egg-emoji').textContent = emoji;
  document.getElementById('egg-title').textContent = title;
  document.getElementById('egg-msg').textContent   = msg;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('egg-close').onclick = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  };
  modal.onclick = e => { if (e.target === modal) { modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true'); } };
}

// ── 1. GLITCH EFFECT ON HERO NAME ────────────────────────────────────────────
(function setupHeroGlitch() {
  const span = document.querySelector('h1 span[data-text]');
  if (!span) return;

  // Build: before/after pseudo via a wrapper with CSS class
  span.classList.add('hero-glitch');

  // Trigger a brief glitch burst every 4-7 seconds
  function glitchBurst() {
    span.classList.add('glitching');
    setTimeout(() => span.classList.remove('glitching'), 400);
    setTimeout(glitchBurst, 4000 + Math.random() * 3000);
  }

  setTimeout(glitchBurst, 2000);
})();


// ── 2. 3D TILT ON PROFILE PICTURE ────────────────────────────────────────────
(function setupProfileTilt() {
  const img = document.querySelector('.pp-img');
  if (!img || window.matchMedia('(hover: none)').matches) return;

  img.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
  img.style.willChange = 'transform';

  img.addEventListener('mousemove', e => {
    const r = img.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    img.style.transform = `perspective(1000px) rotateY(${x * 45}deg) rotateX(${-y * 45}deg) scale(1.2)`;
    img.style.boxShadow = `${-x * 50}px ${-y * 50}px 70px rgba(0,217,255,0.8), 0 0 100px rgba(124,58,237,0.6)`;
  });

  img.addEventListener('mouseleave', () => {
    img.style.transform = '';
    img.style.boxShadow = '';
  });
})();


// ── 3. HIRE ME BUTTON NEON RIPPLE ────────────────────────────────────────────
(function setupRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', function(e) {
      const r = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(r.width, r.height) * 2;
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - r.left - size/2}px;
        top:  ${e.clientY - r.top  - size/2}px;
        background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: rippleBurst 0.6s ease-out forwards;
        pointer-events: none;
        z-index: 10;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
})();


// ── 4. LOGO SECRET EASTER EGG (click 5x) ─────────────────────────────────────
(function setupLogoEgg() {
  // Support both the old img logo and the new text logo
  const logo = document.getElementById('nav-logo-img') ||
               document.querySelector('.nav-logo-text') ||
               document.querySelector('.logo-container a');
  if (!logo) return;

  let clicks = 0;
  let timer;

  logo.addEventListener('click', () => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 2000);

    if (clicks >= 5) {
      clicks = 0;
      triggerLogoEgg();
    }
  });

  function triggerLogoEgg() {
    // Burst confetti from the logo's actual position
    const rect = logo.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const colors = ['#00d9ff','#7c3aed','#f59e0b','#ff00c1','#00fff9','#fff','#ff4500','#28c840'];
    const shapes = ['50%', '2px', '0'];

    for (let i = 0; i < 140; i++) {
      const c = document.createElement('div');
      const size = 5 + Math.random() * 9;
      const angle = Math.random() * 360;
      const dist  = 80 + Math.random() * 340;
      const tx = Math.cos(angle * Math.PI / 180) * dist;
      const ty = Math.sin(angle * Math.PI / 180) * dist - 120;
      const duration = 1.1 + Math.random() * 0.6;
      const delay = Math.random() * 0.25;
      c.style.cssText = `
        position: fixed;
        left: ${originX}px;
        top: ${originY}px;
        width: ${size}px;
        height: ${size * (Math.random() > 0.5 ? 1 : 2.5)}px;
        background: ${colors[i % colors.length]};
        border-radius: ${shapes[i % shapes.length]};
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        animation: confettiFly ${duration}s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s forwards;
        --tx: ${tx}px;
        --ty: ${ty}px;
        --rot: ${Math.random() * 900 - 450}deg;
        opacity: 1;
      `;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), (duration + delay) * 1000 + 100);
    }

    // Secret message
    showEggModal(
      '🥚',
      'You found the Logo Egg!',
      'Clicking the logo 5 times? That\'s the kind of curiosity that makes a great developer. Navneet approves. 👀'
    );

    // Logo spin
    logo.style.transition = 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)';
    logo.style.transform = 'rotate(720deg) scale(1.5)';
    setTimeout(() => { logo.style.transform = ''; }, 900);
  }
})();


// ── 5. SKILL BADGE SPARK ON HOVER ────────────────────────────────────────────
(function setupSkillSparks() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.skill-badge, .chip').forEach(badge => {
    badge.addEventListener('mouseenter', function() {
      const r = this.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;

      for (let i = 0; i < 8; i++) {
        const spark = document.createElement('div');
        const angle = (i / 8) * 360;
        const dist  = 20 + Math.random() * 25;
        const tx = Math.cos(angle * Math.PI/180) * dist;
        const ty = Math.sin(angle * Math.PI/180) * dist;
        spark.style.cssText = `
          position: fixed;
          left: ${cx}px; top: ${cy}px;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 6px var(--accent);
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          animation: sparkFly 0.5s ease-out forwards;
          --tx: ${tx}px; --ty: ${ty}px;
        `;
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 550);
      }
    });
  });
})();


// ── 6. CURSOR TRAIL PARTICLES ─────────────────────────────────────────────────
(function setupCursorTrail() {
  // Disabled on mobile/touch devices - causes lag
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.innerWidth < 768) return;

  let lastX = 0, lastY = 0, ticking = false;
  let trailCount = 0;
  const MAX_TRAILS = 8; // limit concurrent trail elements

  document.addEventListener('mousemove', e => {
    if (ticking || trailCount >= MAX_TRAILS) return;
    ticking = true;
    requestAnimationFrame(() => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.sqrt(dx*dx + dy*dy);

      if (speed > 12) {
        const trail = document.createElement('div');
        const size = Math.min(speed * 0.3, 8);
        trail.style.cssText = `
          position: fixed;
          left: ${e.clientX}px; top: ${e.clientY}px;
          width: ${size}px; height: ${size}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,217,255,0.7), rgba(124,58,237,0.3));
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          animation: trailFade 0.5s ease-out forwards;
        `;
        document.body.appendChild(trail);
        trailCount++;
        setTimeout(() => { trail.remove(); trailCount--; }, 550);
      }

      lastX = e.clientX;
      lastY = e.clientY;
      ticking = false;
    });
  });
})();


// ── 7. SECTION SKEW WARP REVEAL ──────────────────────────────────────────────
(function setupWarpReveal() {
  // Subtle: sections start slightly scaled down, animate to full size
  // Avoids the clip-path that was cutting off content before scroll
  const sections = document.querySelectorAll('section.reveal');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(s => observer.observe(s));
})();
