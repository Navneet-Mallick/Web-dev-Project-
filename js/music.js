(function () {
  const player     = document.getElementById('music-player');
  const toggleBtn  = document.getElementById('music-toggle');
  const icon       = document.getElementById('music-icon');
  const trackName  = document.getElementById('music-track-name');
  const progressBar= document.getElementById('music-progress-bar');
  const volumeSlider = document.getElementById('music-volume');
  const modeBtn    = document.getElementById('music-mode-btn');
  const modeIcon   = document.getElementById('music-mode-icon');

  if (!toggleBtn) return;

  // ── MODES ──────────────────────────────────────────────
  const MODES = [
    { id: 'lofi',    label: 'Interstellar — Hans Zimmer',  type: 'file',  src: 'Assets/interstellar.mp3', icon: 'fas fa-headphones' },
    { id: 'ambient', label: 'Ambient Chill',             type: 'synth', style: 'ambient', icon: 'fas fa-moon' },
    { id: 'phonk',   label: 'Demons — Phonk',            type: 'file',  src: 'Assets/demons_phonk.mp3', icon: 'fas fa-fire' },
    { id: 'eagles',  label: 'Hotel California — Eagles', type: 'file',  src: 'Assets/eagles.mp3',       icon: 'fas fa-music' },
     { id: 'interstellar',  label: 'Hotel California — Eagles', type: 'file',  src: 'interstellar_chase_2.mp3',       icon: 'fas fa-music' },
 
  ];

  let modeIndex = 4; // Start on Lo-Fi
  let isPlaying = false;

  // ── FILE AUDIO ─────────────────────────────────────────
  let fileAudio = null;

  function getFileAudio(src) {
    if (fileAudio) { fileAudio.pause(); fileAudio.src = ''; }
    fileAudio = new Audio(src);
    fileAudio.loop = true;
    fileAudio.volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.6;
    fileAudio.preload = 'auto';
    fileAudio.addEventListener('timeupdate', () => {
      if (progressBar && fileAudio.duration)
        progressBar.style.width = (fileAudio.currentTime / fileAudio.duration * 100) + '%';
    });
    return fileAudio;
  }

  // ── SYNTH AUDIO ────────────────────────────────────────
  let synthCtx = null, masterGain = null, synthNodes = [], chordTimer = null, synthStarted = false;

  const AMBIENT_CHORDS = [
    [130.81, 164.81, 196.00, 261.63],
    [146.83, 174.61, 220.00, 293.66],
    [116.54, 155.56, 185.00, 233.08],
  ];

  const LOFI_CHORDS = [
    [220.00, 261.63, 329.63, 392.00],
    [196.00, 246.94, 293.66, 369.99],
    [174.61, 220.00, 261.63, 329.63],
  ];

  let chordIndex = 0;

  function getSynthCtx() {
    if (!synthCtx) {
      synthCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = synthCtx.createGain();
      masterGain.gain.setValueAtTime(0, synthCtx.currentTime);
      masterGain.connect(synthCtx.destination);
    }
    return synthCtx;
  }

  function createPad(freq, style) {
    const ac = getSynthCtx();
    const osc1 = ac.createOscillator();
    const osc2 = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    osc1.type = style === 'lofi' ? 'triangle' : 'sine';
    osc2.type = 'triangle';
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.008;
    filter.type = 'lowpass';
    filter.frequency.value = style === 'lofi' ? 600 : 900;
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ac.currentTime + 1.5);
    osc1.connect(filter); osc2.connect(filter);
    filter.connect(gain); gain.connect(masterGain);
    osc1.start(); osc2.start();
    return { osc1, osc2, gain };
  }

  function playSynthChord(style) {
    const ac = getSynthCtx();
    const chords = style === 'lofi' ? LOFI_CHORDS : AMBIENT_CHORDS;
    const freqs = chords[chordIndex % chords.length];
    chordIndex++;
    synthNodes.forEach(n => {
      if (n.gain) {
        n.gain.gain.linearRampToValueAtTime(0, ac.currentTime + 2);
        setTimeout(() => { try { n.osc1?.stop(); n.osc2?.stop(); } catch(e){} }, 2500);
      }
    });
    synthNodes = [];
    freqs.forEach(f => synthNodes.push(createPad(f, style)));
    chordTimer = setTimeout(() => playSynthChord(style), 5000);
  }

  function startSynth(style) {
    if (synthStarted) return;
    synthStarted = true;
    const ac = getSynthCtx();
    if (ac.state === 'suspended') ac.resume();
    masterGain.gain.cancelScheduledValues(ac.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.7, ac.currentTime + 1.5);
    playSynthChord(style);
  }

  function stopSynth() {
    if (!synthCtx) return;
    masterGain.gain.cancelScheduledValues(synthCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, synthCtx.currentTime + 1);
    clearTimeout(chordTimer);
    setTimeout(() => {
      synthNodes.forEach(n => { try { n.osc1?.stop(); n.osc2?.stop(); } catch(e){} });
      synthNodes = []; synthStarted = false;
    }, 1200);
  }

  // ── UI ─────────────────────────────────────────────────
  function setUI(playing) {
    isPlaying = playing;
    icon.className = playing ? 'fas fa-pause' : 'fas fa-play';
    player.setAttribute('data-playing', playing ? 'true' : 'false');
    const mode = MODES[modeIndex];
    if (trackName) trackName.textContent = playing ? mode.label + ' ▶' : mode.label;
  }

  function updateModeUI() {
    const mode = MODES[modeIndex];
    if (modeIcon) modeIcon.className = mode.icon;
    if (trackName) trackName.textContent = mode.label;
    if (progressBar) progressBar.style.width = '0%';
  }

  // ── PLAY / STOP ────────────────────────────────────────
  function playCurrentMode() {
    const mode = MODES[modeIndex];
    if (mode.type === 'file') {
      const audio = getFileAudio(mode.src);
      audio.volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.6;
      audio.play().then(() => setUI(true)).catch(e => console.warn(e));
    } else {
      startSynth(mode.style);
      setUI(true);
    }
  }

  function stopCurrentMode() {
    const mode = MODES[modeIndex];
    if (mode.type === 'file') {
      if (fileAudio) { fileAudio.pause(); fileAudio.currentTime = 0; }
    } else {
      stopSynth();
    }
    setUI(false);
  }

  // ── EVENTS ─────────────────────────────────────────────
  toggleBtn.addEventListener('click', () => {
    isPlaying ? stopCurrentMode() : playCurrentMode();
  });

  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      stopCurrentMode();
      modeIndex = (modeIndex + 1) % MODES.length;
      updateModeUI();
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      const vol = parseFloat(volumeSlider.value);
      if (fileAudio) fileAudio.volume = vol;
      if (masterGain) masterGain.gain.setValueAtTime(vol, synthCtx.currentTime);
    });
  }

  // Auto-play Eagles after boot screen is dismissed
  document.addEventListener('bootDismissed', function onBoot() {
    if (!isPlaying) playCurrentMode();
  }, { once: true });

  // Fallback: auto-play on first user interaction if boot event missed
  document.addEventListener('click', function autoPlay(e) {
    if (isPlaying || e.target.closest('#music-player')) return;
    if (!window._bootDismissed) return; // wait for boot
    playCurrentMode();
    document.removeEventListener('click', autoPlay);
  });

  updateModeUI();
})();
