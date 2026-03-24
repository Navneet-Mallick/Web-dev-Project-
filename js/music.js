/**
 * Ambient Music Module
 * Generates a looping ambient synth track using Web Audio API (no audio file needed).
 * Auto-starts after first user interaction (browser policy).
 */

(function () {
  let ctx, masterGain, playing = false, started = false;
  let nodes = [];

  const player  = document.getElementById('music-player');
  const toggleBtn = document.getElementById('music-toggle');
  const icon   = document.getElementById('music-icon');
  const label  = document.getElementById('music-label');

  if (!toggleBtn) return;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.connect(ctx.destination);
    }
    return ctx;
  }

  // Chord notes (Hz) for a dreamy ambient loop
  const chords = [
    [130.81, 164.81, 196.00, 261.63], // C minor
    [146.83, 174.61, 220.00, 293.66], // D minor
    [116.54, 155.56, 185.00, 233.08], // Bb major
    [130.81, 164.81, 220.00, 261.63], // C minor 2nd
  ];

  let chordIndex = 0;
  let chordTimer = null;

  function createPad(freq) {
    const ac = getCtx();

    const osc1 = ac.createOscillator();
    const osc2 = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.005; // slight detune for warmth

    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ac.currentTime + 1.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc1.start();
    osc2.start();

    return { osc1, osc2, gain };
  }

  function addSubBass(freq) {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = freq / 2;

    filter.type = 'lowpass';
    filter.frequency.value = 200;

    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ac.currentTime + 2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start();

    return { osc, gain };
  }

  function addReverb(node) {
    const ac = getCtx();
    const convolver = ac.createConvolver();
    const length = ac.sampleRate * 3;
    const impulse = ac.createBuffer(2, length, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = impulse.getChannelData(c);
      for (let i = 0; i < length; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    convolver.buffer = impulse;
    const wet = ac.createGain();
    wet.gain.value = 0.3;
    node.connect(convolver);
    convolver.connect(wet);
    wet.connect(masterGain);
  }

  function playChord() {
    const ac = getCtx();
    const freqs = chords[chordIndex % chords.length];
    chordIndex++;

    // Fade out old nodes
    nodes.forEach(n => {
      if (n.gain) {
        n.gain.gain.linearRampToValueAtTime(0, ac.currentTime + 2);
        setTimeout(() => { try { n.osc1?.stop(); n.osc2?.stop(); n.osc?.stop(); } catch(e){} }, 2500);
      }
    });
    nodes = [];

    freqs.forEach(f => {
      const pad = createPad(f);
      nodes.push(pad);
      addReverb(pad.gain);
    });

    // Sub bass on root
    const bass = addSubBass(freqs[0]);
    nodes.push(bass);

    // Schedule next chord
    chordTimer = setTimeout(playChord, 6000);
  }

  function startMusic() {
    if (started) return;
    started = true;
    const ac = getCtx();
    if (ac.state === 'suspended') ac.resume();
    masterGain.gain.cancelScheduledValues(ac.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.7, ac.currentTime + 1.5);
    playChord();
  }

  function stopMusic() {
    const ac = getCtx();
    masterGain.gain.cancelScheduledValues(ac.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, ac.currentTime + 1);
    clearTimeout(chordTimer);
    setTimeout(() => {
      nodes.forEach(n => { try { n.osc1?.stop(); n.osc2?.stop(); n.osc?.stop(); } catch(e){} });
      nodes = [];
      started = false;
    }, 1200);
  }

  function setUI(isPlaying) {
    playing = isPlaying;
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-music';
    label.textContent = isPlaying ? 'Ambient On' : 'Ambient Off';
    player.classList.toggle('playing', isPlaying);
  }

  toggleBtn.addEventListener('click', () => {
    if (!playing) {
      startMusic();
      setUI(true);
    } else {
      stopMusic();
      setUI(false);
    }
  });

  // Auto-start on first user interaction (respects browser autoplay policy)
  function autoStart(e) {
    if (playing) return;
    // Don't auto-start if user clicked the music toggle itself
    if (e.target.closest('#music-player')) return;
    startMusic();
    setUI(true);
    document.removeEventListener('click', autoStart);
    document.removeEventListener('keydown', autoStart);
    document.removeEventListener('scroll', autoStart);
  }

  document.addEventListener('click', autoStart);
  document.addEventListener('keydown', autoStart);
  document.addEventListener('scroll', autoStart, { once: true });

})();
