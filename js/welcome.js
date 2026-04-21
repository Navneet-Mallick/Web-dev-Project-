/**
 * Welcome Sequence
 * Fires after the boot overlay exits.
 * 1. Particle burst from screen centre
 * 2. Welcome card slides in, holds, then fades out
 */

(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────── */
  const PARTICLE_COUNT  = 60;
  const CARD_HOLD_MS    = 2800;   // how long the card stays visible
  const CARD_FADE_MS    = 600;    // fade-out duration (matches CSS)

  /* ── Particle burst ─────────────────────────────── */
  function spawnParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'welcome-particles';
    canvas.style.cssText = [
      'position:fixed', 'inset:0', 'width:100%', 'height:100%',
      'pointer-events:none', 'z-index:999990',
    ].join(';');
    document.body.appendChild(canvas);

    const ctx  = canvas.getContext('2d');
    const W    = canvas.width  = window.innerWidth;
    const H    = canvas.height = window.innerHeight;
    const cx   = W / 2;
    const cy   = H / 2;

    /* Colour palette matching the site theme */
    const COLOURS = [
      '#00e5ff', '#8b5cf6', '#fbbf24',
      '#00f5ff', '#a78bfa', '#f59e0b',
      '#ffffff',
    ];

    /* Build particles */
    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle  = Math.random() * Math.PI * 2;
      const speed  = 3 + Math.random() * 9;
      const size   = 3 + Math.random() * 5;
      const life   = 0.6 + Math.random() * 0.4;   // 0–1 normalised lifetime
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 3), // slight upward bias
        size,
        colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
        alpha: 1,
        decay: life / 55,   // ~55 frames to die
        gravity: 0.18 + Math.random() * 0.12,
        trail: [],
      };
    });

    let frame;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      let alive = 0;
      for (const p of particles) {
        if (p.alpha <= 0) continue;
        alive++;

        /* Physics */
        p.vy += p.gravity;
        p.x  += p.vx;
        p.y  += p.vy;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        /* Trail */
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 6) p.trail.shift();

        /* Draw trail */
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = p.colour;
          ctx.globalAlpha = p.alpha * 0.3;
          ctx.lineWidth   = p.size * 0.5;
          ctx.lineCap     = 'round';
          ctx.stroke();
        }

        /* Draw dot */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle   = p.colour;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowColor = p.colour;
        ctx.shadowBlur  = 10;
        ctx.fill();
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;
      }

      if (alive > 0) {
        frame = requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    }

    frame = requestAnimationFrame(draw);

    /* Safety cleanup after 4 s */
    setTimeout(() => {
      cancelAnimationFrame(frame);
      canvas.remove();
    }, 4000);
  }

  /* ── Welcome card ───────────────────────────────── */
  function showWelcomeCard() {
    const card = document.createElement('div');
    card.id = 'welcome-card';
    card.innerHTML = `
      <div class="wc-inner">
        <div class="wc-glow"></div>
        <div class="wc-avatar">NM</div>
        <div class="wc-body">
          <p class="wc-greeting">Welcome back 👋</p>
          <h2 class="wc-name">Navneet Mallick</h2>
          <p class="wc-sub">Web Developer</p>
          // <p class="wc-sub">Web Developer &amp;</p>
          <div class="wc-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(card);

    /* Force reflow so the enter animation fires */
    void card.offsetWidth;
    card.classList.add('wc-enter');

    /* Hold → fade out → remove */
    setTimeout(() => {
      card.classList.add('wc-exit');
      setTimeout(() => card.remove(), CARD_FADE_MS + 50);
    }, CARD_HOLD_MS);
  }

  /* ── Entry point ────────────────────────────────── */
  function run() {
    spawnParticles();
    /* Slight delay so particles are already flying when card appears */
    setTimeout(showWelcomeCard, 120);
  }

  document.addEventListener('bootDismissed', run, { once: true });

})();
