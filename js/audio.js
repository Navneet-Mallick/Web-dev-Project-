/**
 * Boot Intro + Audio Module
 * Shows a boot screen on load, plays synth sound on click (Web Audio API - no file needed)
 */

(function () {
  const overlay   = document.getElementById('boot-overlay');
  const bootText  = document.getElementById('boot-text');
  const bootBar   = document.getElementById('boot-bar');
  if (!overlay) return;

  // Boot messages — each tied to a % progress step
  const messages = [
    { text: '> Booting portfolio v2.0...',   pct: 20  },
    { text: '> Loading assets... OK',         pct: 45  },
    { text: '> Mounting modules... OK',       pct: 70  },
    { text: '> Starting music player... OK',  pct: 90  },
    { text: '> Welcome, Navneet Mallick ✔',   pct: 100 },
  ];

  let ctx = null;

  // --- Web Audio synth sounds ---
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window['webkitAudioContext'])();
    return ctx;
  }

  function playBootSound() {
    const ac = getCtx();

    // Sweep synth: rising tone
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.6);
    gain.gain.setValueAtTime(0.15, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.8);

    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.8);

    // Second layer: short blip
    setTimeout(() => {
      const o2 = ac.createOscillator();
      const g2 = ac.createGain();
      o2.connect(g2); g2.connect(ac.destination);
      o2.type = 'square';
      o2.frequency.setValueAtTime(440, ac.currentTime);
      o2.frequency.setValueAtTime(880, ac.currentTime + 0.05);
      g2.gain.setValueAtTime(0.08, ac.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
      o2.start(ac.currentTime);
      o2.stop(ac.currentTime + 0.2);
    }, 500);
  }

  function playClickSound() {
    const ac = getCtx();
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.15);
  }

  function playHoverSound() {
    const ac = getCtx();
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ac.currentTime);
    gain.gain.setValueAtTime(0.04, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.08);
  }

  // --- Boot sequence ---
  const pctEl = document.getElementById('boot-percent');

  function animateBarTo(target) {
    const current = parseFloat(bootBar?.style.width) || 0;
    if (!bootBar || current >= target) return;
    let w = current;
    const step = (target - current) / 20;
    const iv = setInterval(() => {
      w = Math.min(w + step, target);
      bootBar.style.width = w + '%';
      if (pctEl) pctEl.textContent = Math.floor(w) + '%';
      if (w >= target) clearInterval(iv);
    }, 18);
  }

  function animateBar(done) { done(); } // kept for compat

  function typeMessages(index, done) {
    if (index >= messages.length) { done(); return; }
    const { text, pct } = messages[index];
    let i = 0;
    const line = document.createElement('div');
    bootText.appendChild(line);
    animateBarTo(pct);
    const interval = setInterval(() => {
      line.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(interval);
        const delay = index === messages.length - 1 ? 600 : 220;
        setTimeout(() => typeMessages(index + 1, done), delay);
      }
    }, 26);
  }

  function dismissOverlay() {
    if (overlay.classList.contains('boot-exit')) return;
    playBootSound();
    // Remove inline display so CSS animation can take over
    overlay.style.display = '';
    overlay.style.opacity = '';
    overlay.classList.add('boot-exit');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.classList.remove('boot-active');
      // Signal music player to start Eagles
      window._bootDismissed = true;
      document.dispatchEvent(new CustomEvent('bootDismissed'));
    }, 850);
  }

  // --- Init ---
  document.body.classList.add('boot-active');
  // Show overlay via inline style so it's guaranteed visible before CSS loads
  overlay.style.display = 'flex';

  // Start typing after short delay
  setTimeout(() => {
    typeMessages(0, () => {
      // All messages done — auto dismiss after brief pause
      setTimeout(dismissOverlay, 800);
    });
  }, 400);

  // Auto-dismiss after 5s even if user doesn't interact
  const autoDismissTimer = setTimeout(dismissOverlay, 5000);

  // Dismiss on click anywhere OR any keypress — immediately
  const handleDismiss = () => {
    clearTimeout(autoDismissTimer);
    dismissOverlay();
  };

  document.addEventListener('click', handleDismiss, { once: true });

  // Add touch event for mobile devices (more reliable than click on touch)
  document.addEventListener('touchstart', handleDismiss, { once: true, passive: true });

  document.addEventListener('keydown', handleDismiss, { once: true });

  // Fallback: Force dismiss after 6 seconds if nothing worked
  setTimeout(() => {
    if (!overlay.classList.contains('boot-exit')) {
      dismissOverlay();
    }
  }, 6000);

  // --- Global click sound ---
  document.addEventListener('click', (e) => {
    if (e.target.closest('#boot-overlay')) return;
    playClickSound();
  });

  // --- Hover sound on interactive elements ---
  document.addEventListener('mouseover', (e) => {
    if (e.target.matches('a, button, .btn, .project-card, #theme-btn, #hamburger-wrap')) {
      playHoverSound();
    }
  });

})();
