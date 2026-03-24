/**
 * Boot Intro + Audio Module
 * Shows a boot screen on load, plays synth sound on click (Web Audio API - no file needed)
 */

(function () {
  const overlay   = document.getElementById('boot-overlay');
  const bootText  = document.getElementById('boot-text');
  const bootBar   = document.getElementById('boot-bar');
  if (!overlay) return;

  // Boot messages to type out
  const messages = [
    '> Initializing portfolio...',
    '> Loading modules... OK',
    '> Connecting to the matrix...',
    '> Welcome, Navneet Mallick',
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
  function typeMessages(index, done) {
    if (index >= messages.length) { done(); return; }
    const msg = messages[index];
    let i = 0;
    bootText.innerHTML = '';
    const interval = setInterval(() => {
      bootText.innerHTML += msg[i++];
      if (i >= msg.length) {
        clearInterval(interval);
        setTimeout(() => typeMessages(index + 1, done), 300);
      }
    }, 30);
  }

  function animateBar(done) {
    let w = 0;
    const interval = setInterval(() => {
      w += 2;
      bootBar.style.width = w + '%';
      if (w >= 100) { clearInterval(interval); setTimeout(done, 200); }
    }, 20);
  }

  function dismissOverlay() {
    if (overlay.classList.contains('boot-exit')) return;
    playBootSound();
    overlay.classList.add('boot-exit');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.classList.remove('boot-active');
    }, 800);
  }

  // --- Init ---
  document.body.classList.add('boot-active');

  // Start typing after short delay
  setTimeout(() => {
    typeMessages(0, () => {
      animateBar(() => {});
    });
  }, 400);

  // Auto-dismiss after 5s even if user doesn't interact
  const autoDismissTimer = setTimeout(dismissOverlay, 5000);

  // Dismiss on click anywhere OR any keypress — immediately
  document.addEventListener('click', () => {
    clearTimeout(autoDismissTimer);
    dismissOverlay();
  }, { once: true });

  document.addEventListener('keydown', () => {
    clearTimeout(autoDismissTimer);
    dismissOverlay();
  }, { once: true });

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
