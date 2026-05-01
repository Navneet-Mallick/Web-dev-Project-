/**
 * game.js — Runner, Flappy Bird, Tetris
 */

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ── OPEN / CLOSE ──────────────────────────────────────────────────
function openRunnerGame() {
  const modal = document.getElementById('game-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  // Prevent scrolling on iOS
  if (isMobile) {
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }
  switchGame('runner');
}

function closeRunnerGame() {
  stopRunnerGame();
  stopFlappyGame();
  stopTetrisGame();
  stopMineGame();
  const modal = document.getElementById('game-modal');
  if (modal) { modal.style.display = 'none'; modal.setAttribute('aria-hidden', 'true'); }
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  if (isMobile) {
    document.body.style.position = '';
    document.body.style.width = '';
  }
}

// Aliases used by switchGame in index.html
function stopSnakeGame()    { stopFlappyGame(); }
function stopAsteroidGame() { stopTetrisGame(); }
function startSnakeGame()    { startFlappyGame(); }
function startAsteroidGame() { startTetrisGame(); }

// ── GAME ENGINE ───────────────────────────────────────────────────────────────
let gameRaf, gameRunning = false;

function stopRunnerGame() {
  gameRunning = false;
  cancelAnimationFrame(gameRaf);
}

function startRunnerGame() {
  stopRunnerGame();
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  
  // ── MOBILE CANVAS OPTIMIZATION ──
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR for performance
  const rect = canvas.getBoundingClientRect();
  let displayWidth = Math.floor(rect.width);
  let displayHeight = Math.floor(rect.height);
  
  // Fallback if rect is 0 (e.g. modal not fully open)
  if (displayWidth <= 0) displayWidth = 620;
  if (displayHeight <= 0) displayHeight = 160;
  
  // Set canvas internal resolution for sharp rendering
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  
  // Scale context to match device pixel ratio
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  
  const W = displayWidth;
  const H = displayHeight;
  
  canvas.style.touchAction = 'none'; // Prevent scrolling while playing

  // ── Theme colors ──
  const CLR = {
    bg:       '#0a0e27',
    ground:   '#00d9ff',
    player:   '#00d9ff',
    obstacle: '#7c3aed',
    particle: ['#00d9ff','#7c3aed','#f59e0b','#ff00c1'],
    score:    '#00d9ff',
    dead:     '#ff4500',
  };

  const GROUND_Y = H - 30;
  const GRAVITY  = 0.55;
  const JUMP_V   = -12;

  // ── State ──
  let score = 0, hiScore = parseInt(localStorage.getItem('nm_runner_hi') || '0');
  let speed = 5.5, frame = 0, dead = false, started = false;
  let particles = [], obstacles = [], stars = [];
  const hiDisplay = document.getElementById('game-hi-display');
  const personalityMsg = document.getElementById('game-personality-msg');
  if (hiDisplay) hiDisplay.textContent = `HI: ${hiScore}`;

  const flavorMsgs = [
    { score: 0, msg: "INITIATING..." },
    { score: 50, msg: "NOT BAD" },
    { score: 100, msg: "STAY SHARP" },
    { score: 200, msg: "OPTIMIZING..." },
    { score: 350, msg: "OVERCLOCKING" },
    { score: 500, msg: "GOD MODE?" }
  ];

  function updatePersonality(s) {
    const active = flavorMsgs.slice().reverse().find(m => s >= m.score);
    if (active && personalityMsg && personalityMsg.textContent !== active.msg) {
      personalityMsg.textContent = active.msg;
      personalityMsg.style.animation = 'none';
      personalityMsg.offsetHeight; // trigger reflow
      personalityMsg.style.animation = 'learningPulse 0.5s ease-in-out';
    }
  }

  // ── Player ──
  const player = {
    x: 60, y: GROUND_Y, w: 28, h: 36,
    vy: 0, jumps: 0, maxJumps: 2,
    trail: [],
    jump() {
      if (this.jumps < this.maxJumps) {
        this.vy = JUMP_V * (this.jumps === 1 ? 0.85 : 1);
        this.jumps++;
        spawnJumpParticles(this.x + this.w / 2, this.y + this.h);
      }
    },
    update() {
      this.vy += GRAVITY;
      this.y  += this.vy;
      if (this.y >= GROUND_Y) { this.y = GROUND_Y; this.vy = 0; this.jumps = 0; }
      this.trail.unshift({ x: this.x + this.w / 2, y: this.y + this.h / 2 });
      if (this.trail.length > 8) this.trail.pop();
    },
    draw() {
      // Trail
      this.trail.forEach((p, i) => {
        ctx.globalAlpha = (1 - i / this.trail.length) * 0.25;
        ctx.fillStyle = CLR.player;
        const s = this.w * (1 - i / this.trail.length) * 0.6;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      });
      ctx.globalAlpha = 1;

      // Body — pixel-art style character
      ctx.fillStyle = dead ? CLR.dead : CLR.player;
      ctx.shadowColor = dead ? CLR.dead : CLR.player;
      ctx.shadowBlur  = isMobile ? 0 : 10;

      // legs (animated)
      const legOff = dead ? 0 : Math.sin(frame * 0.3) * 5;
      ctx.fillRect(this.x + 4,  this.y + this.h - 10 + legOff,  8, 10);
      ctx.fillRect(this.x + 16, this.y + this.h - 10 - legOff, 8, 10);
      // torso
      ctx.fillRect(this.x + 2, this.y + 10, this.w - 4, this.h - 20);
      // head
      ctx.fillRect(this.x + 6, this.y, this.w - 12, 14);
      // eye
      ctx.fillStyle = dead ? '#fff' : '#0a0e27';
      ctx.fillRect(this.x + 16, this.y + 4, 4, 4);

      ctx.shadowBlur = 0;
    },
    get rect() { return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 4 }; }
  };

  // ── Stars (background) ──
  for (let i = 0; i < 40; i++) {
    stars.push({ x: Math.random() * W, y: Math.random() * (GROUND_Y - 20), s: Math.random() * 1.5 + 0.5, sp: Math.random() * 0.5 + 0.2 });
  }

  // ── Obstacle factory ──
  function spawnObstacle() {
    const types = [
      { w: 18, h: 36 },  // tall thin
      { w: 32, h: 22 },  // wide short
      { w: 14, h: 50 },  // very tall
    ];
    const t = types[Math.floor(Math.random() * types.length)];
    obstacles.push({ x: W + 10, y: GROUND_Y + player.h - t.h, w: t.w, h: t.h, passed: false });
  }

  // ── Particles ──
  function spawnJumpParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * -3 - 1,
        life: 1, decay: 0.06 + Math.random() * 0.04,
        color: CLR.particle[Math.floor(Math.random() * CLR.particle.length)],
        size: 3 + Math.random() * 3,
      });
    }
  }

  function spawnDeathParticles() {
    if (personalityMsg) personalityMsg.textContent = "CRASH_DUMPED";
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      particles.push({
        x: player.x + player.w / 2, y: player.y + player.h / 2,
        vx: Math.cos(angle) * (2 + Math.random() * 4),
        vy: Math.sin(angle) * (2 + Math.random() * 4),
        life: 1, decay: 0.03,
        color: CLR.particle[i % CLR.particle.length],
        size: 4 + Math.random() * 4,
      });
    }
  }

  // ── Collision ──
  function collides(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ── Input ──
  function onJump() {
    if (!started) { started = true; if(personalityMsg) personalityMsg.textContent = "RUNNING..."; return; }
    if (dead) { resetGame(); return; }
    player.jump();
  }

  const keyHandler = e => { if (e.code === 'Space') { e.preventDefault(); onJump(); } };
  const tapHandler = () => onJump();
  document.addEventListener('keydown', keyHandler);
  canvas.addEventListener('pointerdown', tapHandler);

  function resetGame() {
    score = 0; speed = 5.5; frame = 0; dead = false; started = true;
    obstacles = []; particles = [];
    player.x = 60; player.y = GROUND_Y; player.vy = 0; player.jumps = 0; player.trail = [];
    document.getElementById('game-score-display').textContent = 'SCORE: 0';
    if(personalityMsg) personalityMsg.textContent = "REBOOTING...";
  }

  // ── Main loop ──
  let obstacleTimer = 0;

  function loop() {
    if (!gameRunning) {
      document.removeEventListener('keydown', keyHandler);
      canvas.removeEventListener('pointerdown', tapHandler);
      return;
    }

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = CLR.bg;
    ctx.fillRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
      s.x -= s.sp * (dead ? 0 : 1);
      if (s.x < 0) s.x = W;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#fff';
      ctx.fillRect(s.x, s.y, s.s, s.s);
    });
    ctx.globalAlpha = 1;

    // Ground line
    ctx.strokeStyle = CLR.ground;
    ctx.lineWidth   = 2;
    ctx.shadowColor = CLR.ground;
    ctx.shadowBlur  = isMobile ? 0 : 8;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + player.h + 2);
    ctx.lineTo(W, GROUND_Y + player.h + 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (!started) {
      // Start screen
      ctx.fillStyle = CLR.score;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS SPACE OR TAP TO START', W / 2, H / 2 - 10);
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(`HI: ${hiScore}`, W / 2, H / 2 + 14);
      ctx.textAlign = 'left';
      player.draw();
      gameRaf = requestAnimationFrame(loop);
      return;
    }

    if (!dead) {
      frame++;
      score++;
      speed = 5.5 + Math.floor(score / 300) * 0.5;

      // Spawn obstacles
      obstacleTimer++;
      const gap = Math.max(55, 105 - Math.floor(score / 200) * 5);
      if (obstacleTimer > gap) {
        spawnObstacle();
        obstacleTimer = 0;
      }

      player.update();

      // Update obstacles
      obstacles.forEach(o => {
        o.x -= speed;
        if (!o.passed && o.x + o.w < player.x) { o.passed = true; }
        if (collides(player.rect, o)) { dead = true; spawnDeathParticles(); }
      });
      obstacles = obstacles.filter(o => o.x + o.w > -10);

      // Score display
      const displayScore = Math.floor(score / 6);
      document.getElementById('game-score-display').textContent = `SCORE: ${displayScore}`;
      updatePersonality(displayScore);
      if (displayScore > hiScore) {
        hiScore = displayScore;
        localStorage.setItem('nm_runner_hi', hiScore);
        if (hiDisplay) hiDisplay.textContent = `HI: ${hiScore}`;
      }
    }

    // Draw obstacles
    obstacles.forEach(o => {
      ctx.fillStyle = CLR.obstacle;
      ctx.shadowColor = CLR.obstacle;
      ctx.shadowBlur  = isMobile ? 0 : 12;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      // top glow cap
      ctx.fillStyle = '#ff00c1';
      ctx.fillRect(o.x, o.y, o.w, 4);
      ctx.shadowBlur = 0;
    });

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= p.decay;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
    particles = particles.filter(p => p.life > 0);

    player.draw();

    // Death screen
    if (dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = CLR.dead;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SYSTEM CRASH', W / 2, H / 2 - 14);
      ctx.fillStyle = '#fff';
      ctx.font = '13px monospace';
      ctx.fillText(`SCORE: ${Math.floor(score / 6)}   HI: ${hiScore}`, W / 2, H / 2 + 10);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px monospace';
      ctx.fillText('SPACE / TAP to restart', W / 2, H / 2 + 30);
      ctx.textAlign = 'left';
    }

    gameRaf = requestAnimationFrame(loop);
  }

  gameRunning = true;
  gameRaf = requestAnimationFrame(loop);
}

// ═══════════════════════════════════════════════════════════════════
//  SNAKE GAME
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
//  FLAPPY BIRD GAME (replaces Snake)
// ═══════════════════════════════════════════════════════════════════

let flappyRaf, flappyRunning = false;

function stopFlappyGame() {
  flappyRunning = false;
  cancelAnimationFrame(flappyRaf);
}

function startFlappyGame() {
  stopFlappyGame();
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  
  // ── MOBILE CANVAS OPTIMIZATION ──
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  let displayWidth = Math.floor(rect.width);
  let displayHeight = Math.floor(rect.height);
  
  if (displayWidth <= 0) displayWidth = 620;
  if (displayHeight <= 0) displayHeight = 320;
  
  // Set canvas internal resolution for sharp rendering
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  
  // Scale context to match device pixel ratio
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  
  const W = displayWidth;
  const H = displayHeight;
  
  canvas.style.touchAction = 'none'; // Prevent scrolling while playing

  const CLR = {
    bg1: '#0a0e27', bg2: '#0d1535',
    bird: '#f59e0b', birdGlow: 'rgba(245,158,11,0.6)',
    pipe: '#7c3aed', pipeGlow: 'rgba(124,58,237,0.5)',
    ground: '#00d9ff', text: '#00d9ff', dead: '#ff4500',
    star: 'rgba(255,255,255,0.6)',
  };

  const GRAVITY   = 0.35;   // less gravity = floatier, easier
  const JUMP_V    = -7;     // softer jump
  const PIPE_W    = 48;
  const PIPE_GAP  = 165;    // wider gap = easier
  const PIPE_SPD  = 2.2;    // slower pipes
  const GROUND_H  = 30;

  let bird, pipes, particles, score, hiScore, dead, started, frame, stars;
  hiScore = parseInt(localStorage.getItem('nm_flappy_hi') || '0');

  const hiDisplay    = document.getElementById('snake-hi-display');
  const scoreDisplay = document.getElementById('snake-score-display');
  const msgDisplay   = document.getElementById('snake-personality-msg');

  const MSGS = { 1:'FIRST PIPE!', 5:'GETTING GOOD', 10:'IMPRESSIVE', 20:'FLAPPY GOD?', 50:'LEGENDARY' };

  function initState() {
    bird = { x: 80, y: H / 2, vy: 0, r: 14, angle: 0, flap: 0 };
    pipes = [];
    particles = [];
    score = 0;
    dead = false;
    started = false;
    frame = 0;
    stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * (H - GROUND_H),
      s: Math.random() * 1.5 + 0.5, sp: Math.random() * 0.3 + 0.1,
    }));
    if (scoreDisplay) scoreDisplay.textContent = 'SCORE: 0';
    if (hiDisplay)    hiDisplay.textContent    = `HI: ${hiScore}`;
    if (msgDisplay)   msgDisplay.textContent   = '';
  }

  function spawnPipe() {
    const minY = 50, maxY = H - GROUND_H - PIPE_GAP - 50;
    const topH = Math.floor(Math.random() * (maxY - minY) + minY);
    pipes.push({ x: W + 10, topH, passed: false });
  }

  function flap() {
    if (dead) { initState(); started = true; if (msgDisplay) msgDisplay.textContent = 'RETRY...'; return; }
    if (!started) { started = true; if (msgDisplay) msgDisplay.textContent = 'FLAPPING...'; }
    bird.vy = JUMP_V;
    bird.flap = 8;
    spawnFeathers();
  }

  function spawnFeathers() {
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: bird.x, y: bird.y,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1,
        life: 1, decay: 0.07,
        color: CLR.birdGlow, size: 3 + Math.random() * 3,
      });
    }
  }

  function spawnDeathParticles() {
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      particles.push({
        x: bird.x, y: bird.y,
        vx: Math.cos(a) * (2 + Math.random() * 4),
        vy: Math.sin(a) * (2 + Math.random() * 4),
        life: 1, decay: 0.03,
        color: [CLR.bird, '#ff00c1', '#00fff9'][i % 3], size: 4 + Math.random() * 4,
      });
    }
  }

  // Input
  const keyHandler = e => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); } };
  const tapHandler = () => flap();
  document.addEventListener('keydown', keyHandler);
  canvas.addEventListener('pointerdown', tapHandler);

  // Draw helpers
  function drawBg() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, CLR.bg1);
    grad.addColorStop(1, CLR.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
      if (!dead) s.x -= s.sp;
      if (s.x < 0) s.x = W;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = CLR.star;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    });
    ctx.globalAlpha = 1;
  }

  function drawGround() {
    ctx.fillStyle = CLR.ground;
    ctx.shadowColor = CLR.ground;
    ctx.shadowBlur = isMobile ? 0 : 8;
    ctx.fillRect(0, H - GROUND_H, W, GROUND_H);
    ctx.shadowBlur = 0;
    // Ground detail lines
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let x = (frame * PIPE_SPD) % 40; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, H - GROUND_H); ctx.lineTo(x, H); ctx.stroke();
    }
  }

  function drawPipes() {
    pipes.forEach(p => {
      const botY = p.topH + PIPE_GAP;

      // Top pipe
      ctx.fillStyle = CLR.pipe;
      ctx.shadowColor = CLR.pipeGlow;
      ctx.shadowBlur = isMobile ? 0 : 12;
      ctx.fillRect(p.x, 0, PIPE_W, p.topH);
      // Cap
      ctx.fillRect(p.x - 4, p.topH - 20, PIPE_W + 8, 20);

      // Bottom pipe
      ctx.fillRect(p.x, botY, PIPE_W, H - GROUND_H - botY);
      // Cap
      ctx.fillRect(p.x - 4, botY, PIPE_W + 8, 20);

      // Highlight stripe
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(p.x + 6, 0, 8, p.topH);
      ctx.fillRect(p.x + 6, botY + 20, 8, H - GROUND_H - botY - 20);

      ctx.shadowBlur = 0;
    });
  }

  function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    // Tilt based on velocity
    bird.angle = Math.min(Math.max(bird.vy * 3, -30), 70) * Math.PI / 180;
    ctx.rotate(bird.angle);

    // Glow
    ctx.shadowColor = CLR.birdGlow;
    ctx.shadowBlur = 16;

    // Body
    ctx.fillStyle = dead ? CLR.dead : CLR.bird;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.r, bird.r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing flap
    const wingY = Math.sin(bird.flap * 0.8) * 4;
    ctx.fillStyle = dead ? '#cc3300' : '#e08800';
    ctx.beginPath();
    ctx.ellipse(-4, wingY, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(6, -3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(7, -3, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(8, -4, 1, 0, Math.PI * 2); ctx.fill();

    // Beak
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.moveTo(bird.r - 2, -2); ctx.lineTo(bird.r + 7, 0); ctx.lineTo(bird.r - 2, 3);
    ctx.closePath(); ctx.fill();

    ctx.restore();
    if (bird.flap > 0) bird.flap--;
  }

  function drawParticles() {
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= p.decay;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    particles = particles.filter(p => p.life > 0);
  }

  // Main loop
  let pipeTimer = 0;

  function loop() {
    if (!flappyRunning) {
      document.removeEventListener('keydown', keyHandler);
      canvas.removeEventListener('pointerdown', tapHandler);
      return;
    }

    frame++;
    drawBg();
    drawPipes();
    drawGround();
    drawParticles();

    if (!started) {
      drawBird();
      ctx.fillStyle = CLR.text;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🐦 FLAPPY BIRD', W / 2, H / 2 - 20);
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('SPACE / TAP to flap', W / 2, H / 2 + 5);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillText(`HI: ${hiScore}`, W / 2, H / 2 + 25);
      ctx.textAlign = 'left';
      flappyRaf = requestAnimationFrame(loop);
      return;
    }

    if (!dead) {
      // Physics
      bird.vy += GRAVITY;
      bird.y  += bird.vy;

      // Pipe spawning
      pipeTimer++;
      if (pipeTimer > 110) { spawnPipe(); pipeTimer = 0; }

      // Move pipes
      pipes.forEach(p => {
        p.x -= PIPE_SPD;
        // Score
        if (!p.passed && p.x + PIPE_W < bird.x) {
          p.passed = true;
          score++;
          if (scoreDisplay) scoreDisplay.textContent = `SCORE: ${score}`;
          if (score > hiScore) {
            hiScore = score;
            localStorage.setItem('nm_flappy_hi', hiScore);
            if (hiDisplay) hiDisplay.textContent = `HI: ${hiScore}`;
          }
          if (MSGS[score] && msgDisplay) msgDisplay.textContent = MSGS[score];
        }
        // Collision
        const bx = bird.x, by = bird.y, br = bird.r - 3;
        if (bx + br > p.x && bx - br < p.x + PIPE_W) {
          if (by - br < p.topH || by + br > p.topH + PIPE_GAP) {
            dead = true; spawnDeathParticles();
            if (msgDisplay) msgDisplay.textContent = 'CRASHED!';
          }
        }
      });
      pipes = pipes.filter(p => p.x + PIPE_W > -10);

      // Ground / ceiling collision
      if (bird.y + bird.r >= H - GROUND_H || bird.y - bird.r <= 0) {
        dead = true; spawnDeathParticles();
        if (msgDisplay) msgDisplay.textContent = 'CRASHED!';
      }
    }

    drawBird();

    // HUD score
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(W / 2 - 35, 10, 70, 26);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(score, W / 2, 30);
    ctx.textAlign = 'left';

    if (dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = CLR.dead;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
      ctx.fillStyle = '#fff';
      ctx.font = '13px monospace';
      ctx.fillText(`SCORE: ${score}   HI: ${hiScore}`, W / 2, H / 2 + 5);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px monospace';
      ctx.fillText('SPACE / TAP to retry', W / 2, H / 2 + 25);
      ctx.textAlign = 'left';
    }

    flappyRaf = requestAnimationFrame(loop);
  }

  initState();
  flappyRunning = true;
  flappyRaf = requestAnimationFrame(loop);
}

function openFlappyGame() {
  const modal = document.getElementById('game-modal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  switchGame('snake');
}

// ═══════════════════════════════════════════════════════════════════
//  TETRIS GAME
// ═══════════════════════════════════════════════════════════════════

let tetrisRaf, tetrisRunning = false;

function stopTetrisGame() {
  tetrisRunning = false;
  cancelAnimationFrame(tetrisRaf);
}

function startTetrisGame() {
  stopTetrisGame();
  const canvas = document.getElementById('asteroid-canvas');
  if (!canvas) return;

  // ── MOBILE CANVAS OPTIMIZATION ──
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  let displayWidth = Math.floor(rect.width);
  let displayHeight = Math.floor(rect.height);
  
  if (displayWidth <= 0) displayWidth = 320;
  if (displayHeight <= 0) displayHeight = 450;
  
  // Adjust dimensions for mobile
  const COLS = 10, ROWS = 20;
  const B = Math.max(16, Math.min(26, displayWidth / (COLS + 4.2)));
  const BOARD_W = COLS * B;
  const PANEL_W = B * 4.2;
  const W = BOARD_W + PANEL_W;
  const H = ROWS * B;
  
  // Update display size to match calculated grid
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  
  // Set canvas internal resolution for sharp rendering
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  
  // Scale context to match device pixel ratio
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const COLORS = {
    I:'#00d9ff', O:'#f59e0b', T:'#a855f7',
    S:'#22c55e', Z:'#ef4444', J:'#3b82f6', L:'#f97316',
    empty:'#05081a', grid:'rgba(255,255,255,0.03)',
    panel:'#080c1e', border:'rgba(0,217,255,0.2)',
  };

  // SRS wall kick data
  const KICKS = {
    normal: [[[0,0],[-1,0],[1,0],[0,-1],[-1,-1],[1,-1]],
             [[0,0],[1,0],[-1,0],[0,1],[1,1],[-1,1]]],
    I:      [[[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
             [[0,0],[-1,0],[2,0],[-1,-2],[2,1]]]
  };

  const PIECES = {
    I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O:[[1,1],[1,1]],
    T:[[0,1,0],[1,1,1],[0,0,0]],
    S:[[0,1,1],[1,1,0],[0,0,0]],
    Z:[[1,1,0],[0,1,1],[0,0,0]],
    J:[[1,0,0],[1,1,1],[0,0,0]],
    L:[[0,0,1],[1,1,1],[0,0,0]],
  };
  const KEYS = Object.keys(PIECES);

  // 7-bag randomizer
  let bag = [];
  function nextBag() {
    if (!bag.length) bag = [...KEYS].sort(() => Math.random() - 0.5);
    return bag.pop();
  }

  function makePiece(key) {
    return { key, shape: PIECES[key].map(r=>[...r]), x: Math.floor(COLS/2)-Math.floor(PIECES[key][0].length/2), y: 0, rot: 0 };
  }

  let board, piece, nextPiece, held, canHold, score, hiScore, lines, level, dead, started, dropTimer, dropInterval, lockTimer, lockDelay;
  let dasTimer = 0, dasDir = 0, dasActive = false;
  const DAS = 170, ARR = 50, LOCK_DELAY = 500;
  hiScore = parseInt(localStorage.getItem('nm_tetris_hi') || '0');

  const hiDisplay    = document.getElementById('asteroid-hi-display');
  const scoreDisplay = document.getElementById('asteroid-score-display');
  const msgDisplay   = document.getElementById('asteroid-personality-msg');

  function newBoard() { return Array.from({length:ROWS}, ()=>Array(COLS).fill(null)); }

  function valid(shape, ox, oy) {
    for (let r=0; r<shape.length; r++)
      for (let c=0; c<shape[r].length; c++)
        if (shape[r][c]) {
          const nx=ox+c, ny=oy+r;
          if (nx<0||nx>=COLS||ny>=ROWS) return false;
          if (ny>=0 && board[ny][nx]) return false;
        }
    return true;
  }

  function rotate(shape) {
    return shape[0].map((_,i)=>shape.map(r=>r[i]).reverse());
  }

  function tryRotate() {
    const rot = rotate(piece.shape);
    const kicks = piece.key==='I' ? KICKS.I : KICKS.normal;
    const set = kicks[piece.rot % 2];
    for (const [dx,dy] of set) {
      if (valid(rot, piece.x+dx, piece.y+dy)) {
        piece.shape = rot;
        piece.x += dx; piece.y += dy;
        piece.rot = (piece.rot+1)%4;
        lockTimer = 0;
        return;
      }
    }
  }

  function ghostY() {
    let gy = piece.y;
    while (valid(piece.shape, piece.x, gy+1)) gy++;
    return gy;
  }

  function flashLines(rows) {
    // Flash effect on cleared rows
    rows.forEach(r => {
      for (let c=0; c<COLS; c++) {
        const x = c*B+1, y = r*B+1;
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, B-2, B-2);
      }
    });
  }

  function place() {
    piece.shape.forEach((r,ri)=>r.forEach((v,ci)=>{
      if (v && piece.y+ri>=0) board[piece.y+ri][piece.x+ci]=piece.key;
    }));

    // Find cleared lines
    const cleared = [];
    for (let r=ROWS-1; r>=0; r--) {
      if (board[r].every(c=>c)) { cleared.push(r); }
    }

    if (cleared.length) {
      // Remove cleared lines
      cleared.forEach(r => { board.splice(r,1); board.unshift(Array(COLS).fill(null)); });
      const pts = [0,100,300,500,800];
      score += (pts[cleared.length]||800)*level;
      lines += cleared.length;
      level = Math.floor(lines/10)+1;
      dropInterval = Math.max(80, 1000 - (level-1)*90);
      if (scoreDisplay) scoreDisplay.textContent = `SCORE: ${score}`;
      if (score>hiScore) {
        hiScore=score;
        localStorage.setItem('nm_tetris_hi', hiScore);
        if (hiDisplay) hiDisplay.textContent=`HI: ${hiScore}`;
      }
      const msgs={1:'SINGLE',2:'DOUBLE!',3:'TRIPLE!',4:'TETRIS!!'};
      if (msgDisplay) {
        msgDisplay.textContent = msgs[cleared.length]||'';
        setTimeout(()=>{ if(msgDisplay) msgDisplay.textContent=`LVL ${level}`; },900);
      }
    }

    canHold = true;
    piece = nextPiece;
    nextPiece = makePiece(nextBag());
    lockTimer = 0;

    if (!valid(piece.shape, piece.x, piece.y)) {
      dead = true;
      if (msgDisplay) msgDisplay.textContent='GAME OVER';
    }
  }

  function holdPiece() {
    if (!canHold) return;
    canHold = false;
    if (held) {
      const tmp = held;
      held = makePiece(piece.key);
      piece = makePiece(tmp.key);
    } else {
      held = makePiece(piece.key);
      piece = nextPiece;
      nextPiece = makePiece(nextBag());
    }
    lockTimer = 0;
  }

  function initState() {
    board = newBoard();
    bag = [];
    piece = makePiece(nextBag());
    nextPiece = makePiece(nextBag());
    held = null; canHold = true;
    score=0; lines=0; level=1;
    dead=false; started=false;
    dropTimer=0; dropInterval=1000;
    lockTimer=0; lockDelay=LOCK_DELAY;
    dasTimer=0; dasDir=0; dasActive=false;
    if (scoreDisplay) scoreDisplay.textContent='SCORE: 0';
    if (hiDisplay)    hiDisplay.textContent=`HI: ${hiScore}`;
    if (msgDisplay)   msgDisplay.textContent='';
  }

  // ── Draw helpers ──
  function drawBlock(x, y, color, alpha=1, size=B) {
    if (alpha<=0) return;
    ctx.globalAlpha = alpha;
    // Main fill
    ctx.fillStyle = color;
    ctx.fillRect(x+1, y+1, size-2, size-2);
    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x+2, y+2, size-4, 3);
    // Left highlight
    ctx.fillRect(x+2, y+2, 3, size-4);
    // Bottom shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x+2, y+size-4, size-4, 3);
    ctx.globalAlpha = 1;
  }

  function drawBoard() {
    // Board background
    ctx.fillStyle = COLORS.empty;
    ctx.fillRect(0, 0, BOARD_W, H);
    // Grid lines
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let r=0; r<ROWS; r++) for (let c=0; c<COLS; c++) {
      ctx.strokeRect(c*B, r*B, B, B);
    }
    // Board border
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, BOARD_W, H);
    // Placed blocks
    board.forEach((row,r)=>row.forEach((v,c)=>{
      if (v) drawBlock(c*B, r*B, COLORS[v]);
    }));
  }

  function drawGhost() {
    const gy = ghostY();
    piece.shape.forEach((row,r)=>row.forEach((v,c)=>{
      if (v) {
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = COLORS[piece.key];
        ctx.fillRect((piece.x+c)*B+1, (gy+r)*B+1, B-2, B-2);
        ctx.strokeStyle = COLORS[piece.key];
        ctx.lineWidth = 1;
        ctx.strokeRect((piece.x+c)*B+1, (gy+r)*B+1, B-2, B-2);
        ctx.globalAlpha = 1;
      }
    }));
  }

  function drawActivePiece() {
    piece.shape.forEach((row,r)=>row.forEach((v,c)=>{
      if (v) drawBlock((piece.x+c)*B, (piece.y+r)*B, COLORS[piece.key]);
    }));
  }

  function drawMiniPiece(p, cx, cy, blockSize=14) {
    if (!p) return;
    const sh = p.shape || PIECES[p.key];
    const rows = sh.length, cols = sh[0].length;
    const ox = cx - (cols*blockSize)/2;
    const oy = cy - (rows*blockSize)/2;
    sh.forEach((row,r)=>row.forEach((v,c)=>{
      if (v) drawBlock(ox+c*blockSize, oy+r*blockSize, COLORS[p.key], 1, blockSize);
    }));
  }

  function drawPanel() {
    const px = BOARD_W;
    // Panel background
    ctx.fillStyle = COLORS.panel;
    ctx.fillRect(px, 0, PANEL_W, H);
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(px, 0, PANEL_W, H);

    ctx.textAlign = 'center';
    const cx = px + PANEL_W/2;

    // NEXT
    ctx.fillStyle = 'rgba(0,217,255,0.5)';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('NEXT', cx, 18);
    ctx.strokeStyle = 'rgba(0,217,255,0.15)';
    ctx.strokeRect(px+8, 22, PANEL_W-16, 60);
    drawMiniPiece(nextPiece, cx, 52);

    // HOLD
    ctx.fillStyle = canHold ? 'rgba(0,217,255,0.5)' : 'rgba(255,255,255,0.2)';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('HOLD', cx, 100);
    ctx.strokeStyle = 'rgba(0,217,255,0.15)';
    ctx.strokeRect(px+8, 104, PANEL_W-16, 60);
    if (held) drawMiniPiece(held, cx, 134, canHold ? 14 : 12);

    // SCORE
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px monospace';
    ctx.fillText('SCORE', cx, 185);
    ctx.fillStyle = '#00d9ff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(score, cx, 200);

    // LINES
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px monospace';
    ctx.fillText('LINES', cx, 222);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(lines, cx, 237);

    // LEVEL
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px monospace';
    ctx.fillText('LEVEL', cx, 259);
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(level, cx, 274);

    // Controls hint
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '8px monospace';
    ctx.fillText('← → move', cx, H-80);
    ctx.fillText('↑ rotate', cx, H-68);
    ctx.fillText('↓ soft drop', cx, H-56);
    ctx.fillText('SPC hard drop', cx, H-44);
    ctx.fillText('C = hold', cx, H-32);

    ctx.textAlign = 'left';
  }

  // ── Input ──
  const keysDown = new Set();

  const keyHandler = e => {
    if (!started || dead) {
      if (e.code==='Space'||e.key==='Enter') {
        if (dead) initState();
        started=true;
        if (msgDisplay) msgDisplay.textContent=`LVL ${level}`;
      }
      return;
    }
    if (keysDown.has(e.code)) return;
    keysDown.add(e.code);

    switch(e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        if (valid(piece.shape, piece.x-1, piece.y)) { piece.x--; lockTimer=0; }
        dasDir=-1; dasTimer=0; dasActive=false;
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (valid(piece.shape, piece.x+1, piece.y)) { piece.x++; lockTimer=0; }
        dasDir=1; dasTimer=0; dasActive=false;
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (valid(piece.shape, piece.x, piece.y+1)) { piece.y++; dropTimer=0; lockTimer=0; }
        break;
      case 'ArrowUp': case 'KeyX':
        e.preventDefault(); tryRotate(); break;
      case 'KeyZ':
        e.preventDefault();
        // Counter-clockwise: rotate 3 times
        tryRotate(); tryRotate(); tryRotate(); break;
      case 'Space':
        e.preventDefault();
        piece.y = ghostY(); place(); break;
      case 'KeyC': case 'ShiftLeft': case 'ShiftRight':
        e.preventDefault(); holdPiece(); break;
    }
  };

  const keyUpHandler = e => {
    keysDown.delete(e.code);
    if (e.code==='ArrowLeft'||e.code==='ArrowRight') { dasDir=0; dasActive=false; dasTimer=0; }
  };

  document.addEventListener('keydown', keyHandler);
  document.addEventListener('keyup',   keyUpHandler);

  // Touch swipe
  let tx0=0, ty0=0, tTime=0;
  const touchStart = e => { tx0=e.touches[0].clientX; ty0=e.touches[0].clientY; tTime=Date.now(); };
  const touchEnd   = e => {
    if (!started||dead) { started=true; if(dead) initState(); return; }
    const dx=e.changedTouches[0].clientX-tx0;
    const dy=e.changedTouches[0].clientY-ty0;
    const dt=Date.now()-tTime;
    if (Math.abs(dx)<15&&Math.abs(dy)<15&&dt<200) { tryRotate(); }
    else if (Math.abs(dx)>Math.abs(dy)) {
      const steps = Math.floor(Math.abs(dx)/30);
      for (let i=0;i<steps;i++) {
        if (dx>0&&valid(piece.shape,piece.x+1,piece.y)) piece.x++;
        if (dx<0&&valid(piece.shape,piece.x-1,piece.y)) piece.x--;
      }
    } else if (dy>40) { piece.y=ghostY(); place(); }
    else if (dy<-40) { holdPiece(); }
  };
  canvas.addEventListener('touchstart', touchStart, {passive:true});
  canvas.addEventListener('touchend',   touchEnd);

  // ── Main loop ──
  let last=0;
  function loop(ts) {
    if (!tetrisRunning) {
      document.removeEventListener('keydown', keyHandler);
      document.removeEventListener('keyup',   keyUpHandler);
      canvas.removeEventListener('touchstart', touchStart);
      canvas.removeEventListener('touchend',   touchEnd);
      return;
    }

    const dt = Math.min(ts - last, 50); last = ts;

    drawBoard();
    drawPanel();

    if (!started) {
      ctx.fillStyle='rgba(0,0,0,0.75)';
      ctx.fillRect(0,0,BOARD_W,H);
      ctx.fillStyle='#00d9ff';
      ctx.font='bold 22px monospace';
      ctx.textAlign='center';
      ctx.fillText('🧩 TETRIS', BOARD_W/2, H/2-40);
      ctx.font='12px monospace';
      ctx.fillStyle='rgba(255,255,255,0.6)';
      ctx.fillText('← → move  ↑ rotate', BOARD_W/2, H/2-10);
      ctx.fillText('↓ soft  Space hard drop', BOARD_W/2, H/2+10);
      ctx.fillText('C = hold piece', BOARD_W/2, H/2+30);
      ctx.fillStyle='rgba(255,255,255,0.35)';
      ctx.fillText(`BEST: ${hiScore}`, BOARD_W/2, H/2+55);
      ctx.fillStyle='#f59e0b';
      ctx.font='bold 13px monospace';
      ctx.fillText('SPACE / TAP to start', BOARD_W/2, H/2+80);
      ctx.textAlign='left';
      tetrisRaf=requestAnimationFrame(loop);
      return;
    }

    if (!dead) {
      // DAS (delayed auto-shift)
      if (dasDir!==0) {
        dasTimer+=dt;
        if (!dasActive && dasTimer>=DAS) { dasActive=true; dasTimer=0; }
        if (dasActive) {
          dasTimer+=dt;
          if (dasTimer>=ARR) {
            dasTimer=0;
            if (dasDir===-1&&valid(piece.shape,piece.x-1,piece.y)) { piece.x--; lockTimer=0; }
            if (dasDir===1 &&valid(piece.shape,piece.x+1,piece.y)) { piece.x++; lockTimer=0; }
          }
        }
      }

      // Soft drop (hold down)
      if (keysDown.has('ArrowDown')) {
        dropTimer+=dt*4;
      } else {
        dropTimer+=dt;
      }

      if (dropTimer>=dropInterval) {
        dropTimer=0;
        if (valid(piece.shape,piece.x,piece.y+1)) {
          piece.y++;
          lockTimer=0;
        } else {
          // Lock delay
          lockTimer+=dt;
          if (lockTimer>=lockDelay) { lockTimer=0; place(); }
        }
      } else if (!valid(piece.shape,piece.x,piece.y+1)) {
        lockTimer+=dt;
        if (lockTimer>=lockDelay) { lockTimer=0; place(); }
      }

      drawGhost();
      drawActivePiece();
    }

    if (dead) {
      ctx.fillStyle='rgba(0,0,0,0.8)';
      ctx.fillRect(0,0,BOARD_W,H);
      ctx.fillStyle='#ef4444';
      ctx.font='bold 24px monospace';
      ctx.textAlign='center';
      ctx.fillText('GAME OVER', BOARD_W/2, H/2-24);
      ctx.fillStyle='#fff';
      ctx.font='14px monospace';
      ctx.fillText(`SCORE: ${score}`, BOARD_W/2, H/2+4);
      ctx.fillText(`BEST:  ${hiScore}`, BOARD_W/2, H/2+24);
      ctx.fillStyle='rgba(255,255,255,0.45)';
      ctx.font='11px monospace';
      ctx.fillText('SPACE / TAP to restart', BOARD_W/2, H/2+52);
      ctx.textAlign='left';
    }

    tetrisRaf=requestAnimationFrame(loop);
  }

  initState();
  tetrisRunning=true;
  tetrisRaf=requestAnimationFrame(loop);
}
function openTetrisGame() {
  const modal = document.getElementById('game-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  switchGame('asteroid');
}

// ═══════════════════════════════════════════════════════════════════
//  MINESWEEPER GAME
// ═══════════════════════════════════════════════════════════════════

let mineRunning = false, mineTimer = null;

function stopMineGame() {
  mineRunning = false;
  if (mineTimer) { clearInterval(mineTimer); mineTimer = null; }
}

function startMineGame(difficulty = 'easy') {
  stopMineGame();
  const canvas = document.getElementById('mine-canvas');
  if (!canvas) return;
  
  const CONFIGS = {
    easy:   { cols: 9,  rows: 9,  mines: 10 },
    medium: { cols: 16, rows: 16, mines: 40 },
    hard:   { cols: 30, rows: 16, mines: 99 },
  };

  const cfg = CONFIGS[difficulty] || CONFIGS.easy;
  const { cols, rows, mines } = cfg;

  // ── MOBILE CANVAS OPTIMIZATION ──
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  let displayWidth = Math.floor(rect.width);
  if (displayWidth <= 0) displayWidth = 320;
  
  // Calculate cell size based on available width
  const B = Math.max(18, Math.min(32, Math.floor((displayWidth - 10) / cols)));
  const W = cols * B;
  const H = rows * B;

  // Set display size and internal resolution
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  
  canvas.style.touchAction = 'none'; // Prevent scrolling while playing

  // Highlight active difficulty button
  ['easy','medium','hard'].forEach(d => {
    const btn = document.getElementById(`mine-btn-${d}`);
    if (!btn) return;
    if (d === difficulty) {
      btn.style.background = 'rgba(34,197,94,0.25)';
      btn.style.borderColor = 'rgba(34,197,94,0.7)';
      btn.style.color = '#22c55e';
    } else {
      btn.style.background = 'transparent';
      btn.style.borderColor = 'var(--border-color)';
      btn.style.color = 'var(--text-color)';
    }
  });

  const CLR = {
    hidden:  '#0d1535',
    hiddenB: '#1a2550',
    revealed:'#05081a',
    revealedB:'#0a0e27',
    mine:    '#ef4444',
    flag:    '#f59e0b',
    text:    ['','#3b82f6','#22c55e','#ef4444','#7c3aed','#dc2626','#06b6d4','#000','#6b7280'],
    win:     '#22c55e',
    lose:    '#ef4444',
  };

  let board, revealed, flagged, gameOver, gameWon, started, elapsed, firstClick;
  const flagDisplay = document.getElementById('mine-flag-display');
  const timeDisplay = document.getElementById('mine-time-display');
  const hiDisplay   = document.getElementById('mine-hi-display');
  const msgDisplay  = document.getElementById('mine-msg');
  const hiKey = `nm_mine_hi_${difficulty}`;
  let hiScore = parseInt(localStorage.getItem(hiKey) || '0') || null;
  if (hiDisplay) hiDisplay.textContent = hiScore ? `BEST: ${hiScore}s` : 'BEST: --';

  function initBoard() {
    board    = Array.from({length:rows}, ()=>Array(cols).fill(0));
    revealed = Array.from({length:rows}, ()=>Array(cols).fill(false));
    flagged  = Array.from({length:rows}, ()=>Array(cols).fill(false));
    gameOver = false; gameWon = false; started = false; elapsed = 0; firstClick = true;
    if (flagDisplay) flagDisplay.textContent = `💣 ${mines}`;
    if (timeDisplay) timeDisplay.textContent = `⏱ 0`;
    if (msgDisplay)  msgDisplay.textContent  = '';
    if (mineTimer) { clearInterval(mineTimer); mineTimer = null; }
  }

  function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (board[r][c] === -1) continue;
      if (Math.abs(r-safeR)<=1 && Math.abs(c-safeC)<=1) continue;
      board[r][c] = -1; placed++;
    }
    // Count neighbors
    for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
      if (board[r][c]===-1) continue;
      let count=0;
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
        const nr=r+dr, nc=c+dc;
        if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&board[nr][nc]===-1) count++;
      }
      board[r][c]=count;
    }
  }

  function flood(r, c) {
    if (r<0||r>=rows||c<0||c>=cols) return;
    if (revealed[r][c]||flagged[r][c]) return;
    revealed[r][c]=true;
    if (board[r][c]===0) {
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) flood(r+dr,c+dc);
    }
  }

  function checkWin() {
    let unrevealed=0;
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) if (!revealed[r][c]) unrevealed++;
    return unrevealed===mines;
  }

  function reveal(r, c) {
    if (r<0||r>=rows||c<0||c>=cols||revealed[r][c]||flagged[r][c]) return;
    if (firstClick) {
      firstClick=false;
      placeMines(r,c);
      started=true;
      mineTimer=setInterval(()=>{
        elapsed++;
        if (timeDisplay) timeDisplay.textContent=`⏱ ${elapsed}`;
      },1000);
    }
    if (board[r][c]===-1) {
      // Hit mine
      revealed[r][c]=true;
      gameOver=true;
      clearInterval(mineTimer);
      // Reveal all mines
      for (let rr=0;rr<rows;rr++) for (let cc=0;cc<cols;cc++) {
        if (board[rr][cc]===-1) revealed[rr][cc]=true;
      }
      if (msgDisplay) msgDisplay.textContent='💥 BOOM!';
      draw(); return;
    }
    flood(r,c);
    if (checkWin()) {
      gameWon=true;
      clearInterval(mineTimer);
      if (!hiScore||elapsed<hiScore) {
        hiScore=elapsed;
        localStorage.setItem(hiKey,hiScore);
        if (hiDisplay) hiDisplay.textContent=`BEST: ${hiScore}s`;
      }
      if (msgDisplay) msgDisplay.textContent=`✅ WIN! ${elapsed}s`;
    }
    draw();
  }

  function toggleFlag(r, c) {
    if (revealed[r][c]||gameOver||gameWon) return;
    flagged[r][c]=!flagged[r][c];
    const flagCount=flagged.flat().filter(Boolean).length;
    if (flagDisplay) flagDisplay.textContent=`💣 ${mines-flagCount}`;
    draw();
  }

  function chordReveal(r, c) {
    if (!revealed[r][c]||board[r][c]<=0) return;
    let adjFlags=0;
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      const nr=r+dr,nc=c+dc;
      if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&flagged[nr][nc]) adjFlags++;
    }
    if (adjFlags===board[r][c]) {
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
        reveal(r+dr,c+dc);
      }
    }
  }

  // ── Draw ──
  function drawCell(r, c) {
    const x=c*B, y=r*B;
    if (revealed[r][c]) {
      // Revealed cell
      ctx.fillStyle = CLR.revealed;
      ctx.fillRect(x,y,B,B);
      ctx.strokeStyle = CLR.revealedB;
      ctx.lineWidth=0.5;
      ctx.strokeRect(x+0.5,y+0.5,B-1,B-1);
      if (board[r][c]===-1) {
        // Mine
        ctx.fillStyle = gameOver ? CLR.mine : '#22c55e';
        ctx.font = `${Math.floor(B*0.6)}px serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('💣',x+B/2,y+B/2+1);
      } else if (board[r][c]>0) {
        ctx.fillStyle = CLR.text[board[r][c]];
        ctx.font = `bold ${Math.floor(B*0.55)}px monospace`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(board[r][c],x+B/2,y+B/2);
      }
    } else {
      // Hidden cell - 3D look
      ctx.fillStyle = CLR.hidden;
      ctx.fillRect(x,y,B,B);
      // Highlight top/left
      ctx.fillStyle='rgba(255,255,255,0.08)';
      ctx.fillRect(x,y,B,2);
      ctx.fillRect(x,y,2,B);
      // Shadow bottom/right
      ctx.fillStyle='rgba(0,0,0,0.3)';
      ctx.fillRect(x,y+B-2,B,2);
      ctx.fillRect(x+B-2,y,2,B);
      // Border
      ctx.strokeStyle=CLR.hiddenB;
      ctx.lineWidth=0.5;
      ctx.strokeRect(x+0.5,y+0.5,B-1,B-1);
      if (flagged[r][c]) {
        ctx.font=`${Math.floor(B*0.6)}px serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle=CLR.flag;
        ctx.fillText('🚩',x+B/2,y+B/2+1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) drawCell(r,c);
    // Win/lose overlay
    if (gameOver||gameWon) {
      ctx.fillStyle=gameWon?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)';
      ctx.fillRect(0,0,W,H);
    }
  }

  // ── Input ──
  function getCellFromEvent(e) {
    const rect=canvas.getBoundingClientRect();
    const scaleX=W/rect.width, scaleY=H/rect.height;
    const x=(e.clientX-rect.left)*scaleX;
    const y=(e.clientY-rect.top)*scaleY;
    return { r:Math.floor(y/B), c:Math.floor(x/B) };
  }

  // Touch interaction (tap to reveal, long-press to flag)
  let longPressTimer = null;
  let isLongPress = false;
  canvas.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    isLongPress = false;
    longPressTimer = setTimeout(() => {
      isLongPress = true;
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width, scaleY = H / rect.height;
      const r = Math.floor((touch.clientY - rect.top) * scaleY / B);
      const c = Math.floor((touch.clientX - rect.left) * scaleX / B);
      if (r >= 0 && r < rows && c >= 0 && c < cols) toggleFlag(r, c);
    }, 400);
  }, { passive: true });

  canvas.addEventListener('touchend', e => {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    if (isLongPress) { e.preventDefault(); return; }
    if (gameOver||gameWon) { initBoard(); draw(); return; }
    const touch = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width, scaleY = H / rect.height;
    const r = Math.floor((touch.clientY - rect.top) * scaleY / B);
    const c = Math.floor((touch.clientX - rect.left) * scaleX / B);
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      if (revealed[r][c]) chordReveal(r, c);
      else reveal(r, c);
    }
    e.preventDefault();
  });

  canvas.addEventListener('click', e => {
    if (isMobile) return; // avoid duplicate tap+click handling on phones
    if (gameOver||gameWon) { initBoard(); draw(); return; }
    const {r,c}=getCellFromEvent(e);
    if (r<0||r>=rows||c<0||c>=cols) return;
    if (revealed[r][c]) chordReveal(r,c);
    else reveal(r,c);
  });

  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (gameOver||gameWon) return;
    const {r,c}=getCellFromEvent(e);
    if (r>=0&&r<rows&&c>=0&&c<cols) toggleFlag(r,c);
  });

  mineRunning=true;
  initBoard();
  draw();
}
