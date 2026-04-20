/**
 * game.js — Navbar runner game
 * Space / tap to jump, double jump supported
 */

function openRunnerGame() {
  const modal = document.getElementById('game-modal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  startRunnerGame();
}

function closeRunnerGame() {
  const modal = document.getElementById('game-modal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  stopRunnerGame();
}

// ── GAME ENGINE ───────────────────────────────────────────────────────────────
let gameRaf, gameRunning = false;

function stopRunnerGame() {
  gameRunning = false;
  cancelAnimationFrame(gameRaf);
}

function startRunnerGame() {
  const canvas = document.getElementById('game-canvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

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
      ctx.shadowBlur  = 10;

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
    ctx.shadowBlur  = 8;
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
      ctx.shadowBlur  = 12;
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

function stopSnakeGame() {
  flappyRunning = false;
  cancelAnimationFrame(flappyRaf);
}

function startSnakeGame() { startFlappyGame(); }

function startFlappyGame() {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const CLR = {
    bg1: '#0a0e27', bg2: '#0d1535',
    bird: '#f59e0b', birdGlow: 'rgba(245,158,11,0.6)',
    pipe: '#7c3aed', pipeGlow: 'rgba(124,58,237,0.5)',
    ground: '#00d9ff', text: '#00d9ff', dead: '#ff4500',
    star: 'rgba(255,255,255,0.6)',
  };

  const GRAVITY   = 0.45;
  const JUMP_V    = -8;
  const PIPE_W    = 52;
  const PIPE_GAP  = 130;
  const PIPE_SPD  = 2.8;
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
    ctx.shadowBlur = 8;
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
      ctx.shadowBlur = 12;
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
      if (pipeTimer > 90) { spawnPipe(); pipeTimer = 0; }

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

function openSnakeGame() {
  const modal = document.getElementById('game-modal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  switchGame('snake');
}

// ═══════════════════════════════════════════════════════════════════
//  TETRIS GAME
// ═══════════════════════════════════════════════════════════════════

let tetrisRaf, tetrisRunning = false;

function stopAsteroidGame() {
  tetrisRunning = false;
  cancelAnimationFrame(tetrisRaf);
}

function startAsteroidGame() { startTetrisGame(); }

function startTetrisGame() {
  const canvas = document.getElementById('asteroid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLS = 10, ROWS = 20, BLOCK = 28;
  const W = COLS * BLOCK, H = ROWS * BLOCK;
  canvas.width  = W;
  canvas.height = H;

  const COLORS = {
    I: '#00d9ff', O: '#f59e0b', T: '#7c3aed',
    S: '#00ff88', Z: '#ff4500', J: '#0066ff', L: '#ff00c1',
    ghost: 'rgba(255,255,255,0.12)', empty: '#05081a',
    grid: 'rgba(255,255,255,0.04)',
  };

  const PIECES = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]],
  };

  const KEYS = Object.keys(PIECES);

  let board, piece, next, score, hiScore, lines, level, dead, started, dropTimer, dropInterval;
  hiScore = parseInt(localStorage.getItem('nm_tetris_hi') || '0');

  const hiDisplay    = document.getElementById('asteroid-hi-display');
  const scoreDisplay = document.getElementById('asteroid-score-display');
  const msgDisplay   = document.getElementById('asteroid-personality-msg');

  function newBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function randomPiece() {
    const key = KEYS[Math.floor(Math.random() * KEYS.length)];
    return { key, shape: PIECES[key].map(r => [...r]), x: Math.floor(COLS / 2) - 1, y: 0 };
  }

  function rotate(shape) {
    const N = shape.length;
    return shape[0].map((_, i) => shape.map(r => r[i]).reverse());
  }

  function valid(shape, ox, oy) {
    for (let r = 0; r < shape.length; r++)
      for (let c = 0; c < shape[r].length; c++)
        if (shape[r][c]) {
          const nx = ox + c, ny = oy + r;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
          if (ny >= 0 && board[ny][nx]) return false;
        }
    return true;
  }

  function place() {
    piece.shape.forEach((r, ri) =>
      r.forEach((v, ci) => {
        if (v && piece.y + ri >= 0) board[piece.y + ri][piece.x + ci] = piece.key;
      })
    );
    // Clear lines
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(c => c)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++; r++;
      }
    }
    if (cleared) {
      const pts = [0, 100, 300, 500, 800];
      score += (pts[cleared] || 800) * level;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(100, 800 - (level - 1) * 70);
      if (scoreDisplay) scoreDisplay.textContent = `SCORE: ${score}`;
      if (score > hiScore) {
        hiScore = score;
        localStorage.setItem('nm_tetris_hi', hiScore);
        if (hiDisplay) hiDisplay.textContent = `HI: ${hiScore}`;
      }
      const msgs = { 1:'NICE!', 2:'DOUBLE!', 3:'TRIPLE!', 4:'TETRIS!!' };
      if (msgs[cleared] && msgDisplay) {
        msgDisplay.textContent = msgs[cleared];
        setTimeout(() => { if (msgDisplay) msgDisplay.textContent = `LVL ${level}`; }, 1000);
      }
    }
    piece = next;
    next  = randomPiece();
    if (!valid(piece.shape, piece.x, piece.y)) {
      dead = true;
      if (msgDisplay) msgDisplay.textContent = 'GAME OVER';
    }
  }

  function ghostY() {
    let gy = piece.y;
    while (valid(piece.shape, piece.x, gy + 1)) gy++;
    return gy;
  }

  function initState() {
    board = newBoard();
    piece = randomPiece();
    next  = randomPiece();
    score = 0; lines = 0; level = 1;
    dead = false; started = false;
    dropTimer = 0; dropInterval = 800;
    if (scoreDisplay) scoreDisplay.textContent = 'SCORE: 0';
    if (hiDisplay)    hiDisplay.textContent    = `HI: ${hiScore}`;
    if (msgDisplay)   msgDisplay.textContent   = '';
  }

  // ── Draw ──
  function drawBlock(x, y, color, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK + 1, y * BLOCK + 1, BLOCK - 2, BLOCK - 2);
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x * BLOCK + 2, y * BLOCK + 2, BLOCK - 4, 4);
    ctx.globalAlpha = 1;
  }

  function drawBoard() {
    // Background
    ctx.fillStyle = COLORS.empty;
    ctx.fillRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
    }
    // Placed blocks
    board.forEach((row, r) => row.forEach((v, c) => {
      if (v) drawBlock(c, r, COLORS[v]);
    }));
  }

  function drawPiece(p, alpha = 1) {
    p.shape.forEach((row, r) => row.forEach((v, c) => {
      if (v) drawBlock(p.x + c, p.y + r, COLORS[p.key], alpha);
    }));
  }

  function drawGhost() {
    const gy = ghostY();
    piece.shape.forEach((row, r) => row.forEach((v, c) => {
      if (v) {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = COLORS[piece.key];
        ctx.fillRect((piece.x + c) * BLOCK + 1, (gy + r) * BLOCK + 1, BLOCK - 2, BLOCK - 2);
        ctx.globalAlpha = 1;
      }
    }));
  }

  // ── Input ──
  let lastMove = 0;
  const keyHandler = e => {
    if (!started || dead) {
      if (e.code === 'Space' || e.key === 'Enter') {
        if (dead) initState();
        started = true;
        if (msgDisplay) msgDisplay.textContent = `LVL ${level}`;
      }
      return;
    }
    switch (e.key) {
      case 'ArrowLeft':  e.preventDefault(); if (valid(piece.shape, piece.x - 1, piece.y)) piece.x--; break;
      case 'ArrowRight': e.preventDefault(); if (valid(piece.shape, piece.x + 1, piece.y)) piece.x++; break;
      case 'ArrowDown':  e.preventDefault(); if (valid(piece.shape, piece.x, piece.y + 1)) piece.y++; else place(); break;
      case 'ArrowUp': case 'x': case 'X': {
        e.preventDefault();
        const rot = rotate(piece.shape);
        if (valid(rot, piece.x, piece.y)) piece.shape = rot;
        else if (valid(rot, piece.x - 1, piece.y)) { piece.shape = rot; piece.x--; }
        else if (valid(rot, piece.x + 1, piece.y)) { piece.shape = rot; piece.x++; }
        break;
      }
      case ' ': {
        e.preventDefault();
        piece.y = ghostY();
        place();
        break;
      }
    }
  };
  document.addEventListener('keydown', keyHandler);

  // Touch swipe for mobile
  let tx0 = 0, ty0 = 0, tTime = 0;
  const touchStart = e => { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; tTime = Date.now(); };
  const touchEnd   = e => {
    if (!started || dead) { started = true; if (dead) initState(); return; }
    const dx = e.changedTouches[0].clientX - tx0;
    const dy = e.changedTouches[0].clientY - ty0;
    const dt = Date.now() - tTime;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 200) {
      // Tap = rotate
      const rot = rotate(piece.shape);
      if (valid(rot, piece.x, piece.y)) piece.shape = rot;
    } else if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20 && valid(piece.shape, piece.x + 1, piece.y)) piece.x++;
      if (dx < -20 && valid(piece.shape, piece.x - 1, piece.y)) piece.x--;
    } else {
      if (dy > 20) { piece.y = ghostY(); place(); } // swipe down = hard drop
    }
  };
  canvas.addEventListener('touchstart', touchStart, { passive: true });
  canvas.addEventListener('touchend',   touchEnd);

  // ── Loop ──
  let last = 0;
  function loop(ts) {
    if (!tetrisRunning) {
      document.removeEventListener('keydown', keyHandler);
      canvas.removeEventListener('touchstart', touchStart);
      canvas.removeEventListener('touchend',   touchEnd);
      return;
    }

    const dt = ts - last; last = ts;
    drawBoard();

    if (!started) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#00d9ff';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🧩 TETRIS', W / 2, H / 2 - 30);
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('← → move  ↑ rotate', W / 2, H / 2);
      ctx.fillText('↓ soft drop  Space hard drop', W / 2, H / 2 + 20);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillText(`HI: ${hiScore}`, W / 2, H / 2 + 45);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('SPACE / TAP to start', W / 2, H / 2 + 70);
      ctx.textAlign = 'left';
      tetrisRaf = requestAnimationFrame(loop);
      return;
    }

    if (!dead) {
      dropTimer += dt;
      if (dropTimer >= dropInterval) {
        dropTimer = 0;
        if (valid(piece.shape, piece.x, piece.y + 1)) piece.y++;
        else place();
      }
      drawGhost();
      drawPiece(piece);
    }

    if (dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ff4500';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
      ctx.fillStyle = '#fff';
      ctx.font = '13px monospace';
      ctx.fillText(`SCORE: ${score}`, W / 2, H / 2 + 8);
      ctx.fillText(`HI: ${hiScore}`, W / 2, H / 2 + 28);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px monospace';
      ctx.fillText('SPACE / TAP to restart', W / 2, H / 2 + 52);
      ctx.textAlign = 'left';
    }

    tetrisRaf = requestAnimationFrame(loop);
  }

  initState();
  tetrisRunning = true;
  tetrisRaf = requestAnimationFrame(loop);
}

function openAsteroidGame() {
  const modal = document.getElementById('game-modal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  switchGame('asteroid');
}


  const canvas = document.getElementById('asteroid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const CLR = {
    bg: '#0a0e27',
    player: '#00d9ff',
    bullet: '#f59e0b',
    asteroid: '#7c3aed',
    explosion: ['#ff00c1', '#00fff9', '#f59e0b'],
    text: '#00d9ff',
    dead: '#ff4500',
  };

  let player, bullets, asteroids, particles, score, hiScore, dead, started, frame;
  hiScore = parseInt(localStorage.getItem('nm_asteroid_hi') || '0');

  const hiDisplay = document.getElementById('asteroid-hi-display');
  const scoreDisplay = document.getElementById('asteroid-score-display');
  const msgDisplay = document.getElementById('asteroid-personality-msg');

  function initState() {
    player = { x: W / 2, y: H - 40, w: 20, h: 20, angle: 0, vel: 0 };
    bullets = [];
    asteroids = [];
    particles = [];
    score = 0;
    dead = false;
    started = false;
    frame = 0;
    
    // Spawn initial asteroids
    for (let i = 0; i < 3; i++) {
      spawnAsteroid(Math.random() * W, Math.random() * (H / 3), 3);
    }
    
    if (scoreDisplay) scoreDisplay.textContent = 'SCORE: 0';
    if (hiDisplay) hiDisplay.textContent = `HI: ${hiScore}`;
    if (msgDisplay) msgDisplay.textContent = '';
  }

  function spawnAsteroid(x, y, size) {
    asteroids.push({
      x, y, size,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 2 + 1,
      angle: Math.random() * Math.PI * 2,
      angVel: (Math.random() - 0.5) * 0.1,
    });
  }

  function spawnExplosion(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * (2 + Math.random() * 4),
        vy: Math.sin(angle) * (2 + Math.random() * 4),
        life: 1,
        decay: 0.04,
        color: CLR.explosion[Math.floor(Math.random() * CLR.explosion.length)],
        size: 3 + Math.random() * 3,
      });
    }
  }

  // Input
  const keys = {};
  const keyDown = e => { keys[e.key] = true; if (!started && e.key === ' ') { started = true; if (msgDisplay) msgDisplay.textContent = 'FIRING...'; } };
  const keyUp = e => { keys[e.key] = false; };
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);

  // Touch controls for mobile
  let touchLeft = false, touchRight = false, touchShoot = false;

  // Create mobile touch buttons
  const touchControls = document.createElement('div');
  touchControls.style.cssText = `
    display: none; position: absolute; bottom: 10px; left: 0; right: 0;
    justify-content: space-between; align-items: center; padding: 0 10px; z-index: 10;
  `;
  touchControls.innerHTML = `
    <button id="ast-left"  style="width:60px;height:60px;border-radius:50%;background:rgba(0,217,255,0.2);border:2px solid rgba(0,217,255,0.5);color:#00d9ff;font-size:22px;cursor:pointer;touch-action:none;">◀</button>
    <button id="ast-shoot" style="width:70px;height:70px;border-radius:50%;background:rgba(245,158,11,0.2);border:2px solid rgba(245,158,11,0.5);color:#f59e0b;font-size:18px;cursor:pointer;touch-action:none;">🔥</button>
    <button id="ast-right" style="width:60px;height:60px;border-radius:50%;background:rgba(0,217,255,0.2);border:2px solid rgba(0,217,255,0.5);color:#00d9ff;font-size:22px;cursor:pointer;touch-action:none;">▶</button>
  `;

  if (canvas.parentElement) {
    canvas.parentElement.style.position = 'relative';
    canvas.parentElement.appendChild(touchControls);
  }

  // Show touch controls on mobile
  if (window.matchMedia('(hover: none)').matches || window.innerWidth < 768) {
    touchControls.style.display = 'flex';
  }

  const astLeft  = touchControls.querySelector('#ast-left');
  const astRight = touchControls.querySelector('#ast-right');
  const astShoot = touchControls.querySelector('#ast-shoot');

  astLeft.addEventListener('touchstart',  e => { e.preventDefault(); touchLeft = true; if (!started) { started = true; } }, { passive: false });
  astLeft.addEventListener('touchend',    e => { e.preventDefault(); touchLeft = false; }, { passive: false });
function openAsteroidGame() {
  const modal = document.getElementById('game-modal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  switchGame('asteroid');
}
