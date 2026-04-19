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

let snakeRaf, snakeRunning = false;

function stopSnakeGame() {
  snakeRunning = false;
  cancelAnimationFrame(snakeRaf);
}

function startSnakeGame() {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const CELL = 20;
  const COLS = W / CELL, ROWS = H / CELL;

  const CLR = {
    bg:       '#0a0e27',
    grid:     'rgba(0,217,255,0.04)',
    snake:    '#00d9ff',
    snakeHead:'#ffffff',
    food:     '#f59e0b',
    foodGlow: 'rgba(245,158,11,0.6)',
    wall:     '#7c3aed',
    text:     '#00d9ff',
    dead:     '#ff4500',
  };

  // ── State ──
  let snake, dir, nextDir, food, score, hiScore, dead, started, frame, foodPulse;
  hiScore = parseInt(localStorage.getItem('nm_snake_hi') || '0');

  const hiDisplay  = document.getElementById('snake-hi-display');
  const scoreDisplay = document.getElementById('snake-score-display');
  const msgDisplay = document.getElementById('snake-personality-msg');

  function initState() {
    const midX = Math.floor(COLS / 2), midY = Math.floor(ROWS / 2);
    snake    = [
      { x: midX,     y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY },
    ];
    dir      = { x: 1, y: 0 };
    nextDir  = { x: 1, y: 0 };
    food     = spawnFood();
    score    = 0;
    dead     = false;
    started  = false;
    frame    = 0;
    foodPulse = 0;
    if (scoreDisplay) scoreDisplay.textContent = 'SCORE: 0';
    if (hiDisplay)    hiDisplay.textContent    = `HI: ${hiScore}`;
    if (msgDisplay)   msgDisplay.textContent   = '';
  }

  function spawnFood() {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }

  // ── Input ──
  const DIRS = {
    ArrowUp:    { x: 0, y: -1 }, w: { x: 0, y: -1 },
    ArrowDown:  { x: 0, y:  1 }, s: { x: 0, y:  1 },
    ArrowLeft:  { x: -1, y: 0 }, a: { x: -1, y: 0 },
    ArrowRight: { x:  1, y: 0 }, d: { x:  1, y: 0 },
  };

  const keyHandler = e => {
    const d = DIRS[e.key] || DIRS[e.key.toLowerCase()];
    if (!d) return;
    // Prevent reversing
    if (d.x === -dir.x && d.y === -dir.y) return;
    // Prevent default scroll on arrow keys
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    if (!started) { started = true; if (msgDisplay) msgDisplay.textContent = 'SLITHERING...'; }
    nextDir = d;
  };

  // Touch swipe support
  let touchStartX = 0, touchStartY = 0;
  const touchStart = e => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; };
  const touchEnd   = e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (!started) { started = true; if (msgDisplay) msgDisplay.textContent = 'SLITHERING...'; }
    if (Math.abs(dx) > Math.abs(dy)) {
      const d = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      if (d.x !== -dir.x) nextDir = d;
    } else {
      const d = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      if (d.y !== -dir.y) nextDir = d;
    }
  };

  document.addEventListener('keydown', keyHandler);
  canvas.addEventListener('touchstart', touchStart, { passive: true });
  canvas.addEventListener('touchend',   touchEnd);

  // ── Game speed (ms per tick) ──
  function getSpeed() {
    if (score < 5)  return 160;
    if (score < 15) return 130;
    if (score < 30) return 105;
    if (score < 50) return 85;
    return 70;
  }

  let lastTick = 0;

  // ── Draw helpers ──
  function drawGrid() {
    ctx.strokeStyle = CLR.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += CELL) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += CELL) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawSnake() {
    snake.forEach((seg, i) => {
      const isHead = i === 0;
      const t = 1 - i / snake.length;
      ctx.shadowColor = CLR.snake;
      ctx.shadowBlur  = isHead ? 18 : 8 * t;

      // Gradient body: head is white, tail fades to accent
      const r = isHead ? 255 : Math.round(0   + t * 0);
      const g = isHead ? 255 : Math.round(217 * t);
      const b = isHead ? 255 : Math.round(255 * t);
      ctx.fillStyle = isHead ? CLR.snakeHead : `rgb(${r},${g},${b})`;

      const pad = isHead ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, isHead ? 5 : 3);
      ctx.fill();

      // Eyes on head
      if (isHead) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0a0e27';
        const ex = dir.x === 1 ? 13 : dir.x === -1 ? 4 : 6;
        const ey = dir.y === 1 ? 13 : dir.y === -1 ? 4 : 6;
        const ex2 = dir.x === 0 ? ex + 8 : ex;
        const ey2 = dir.y === 0 ? ey + 8 : ey;
        ctx.fillRect(seg.x * CELL + ex,  seg.y * CELL + ey,  3, 3);
        ctx.fillRect(seg.x * CELL + ex2, seg.y * CELL + ey2, 3, 3);
      }
    });
    ctx.shadowBlur = 0;
  }

  function drawFood() {
    foodPulse += 0.08;
    const pulse = Math.sin(foodPulse) * 0.15 + 0.85;
    const cx = food.x * CELL + CELL / 2;
    const cy = food.y * CELL + CELL / 2;
    const r  = (CELL / 2 - 3) * pulse;

    // Glow
    ctx.shadowColor = CLR.foodGlow;
    ctx.shadowBlur  = 16;

    // Outer ring
    ctx.strokeStyle = CLR.food;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Fill
    ctx.fillStyle = CLR.food;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  function drawHUD() {
    // Score in canvas top-left
    ctx.fillStyle = 'rgba(0,217,255,0.15)';
    ctx.fillRect(4, 4, 90, 22);
    ctx.fillStyle = CLR.text;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 10, 19);
  }

  // ── Main loop ──
  function loop(timestamp) {
    if (!snakeRunning) {
      document.removeEventListener('keydown', keyHandler);
      canvas.removeEventListener('touchstart', touchStart);
      canvas.removeEventListener('touchend',   touchEnd);
      return;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = CLR.bg;
    ctx.fillRect(0, 0, W, H);
    drawGrid();

    if (!started) {
      drawSnake();
      drawFood();
      ctx.fillStyle = CLR.text;
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('USE ARROW KEYS / WASD / SWIPE', W / 2, H / 2 - 12);
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(`HI: ${hiScore}`, W / 2, H / 2 + 10);
      ctx.textAlign = 'left';
      snakeRaf = requestAnimationFrame(loop);
      return;
    }

    if (!dead && timestamp - lastTick >= getSpeed()) {
      lastTick = timestamp;
      dir = nextDir;

      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      // Wall collision (wrap-around mode)
      head.x = (head.x + COLS) % COLS;
      head.y = (head.y + ROWS) % ROWS;

      // Self collision
      if (snake.some(s => s.x === head.x && s.y === head.y)) {
        dead = true;
        if (msgDisplay) msgDisplay.textContent = 'SEGFAULT';
        if (score > hiScore) {
          hiScore = score;
          localStorage.setItem('nm_snake_hi', hiScore);
          if (hiDisplay) hiDisplay.textContent = `HI: ${hiScore}`;
        }
      } else {
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score++;
          food = spawnFood();
          if (scoreDisplay) scoreDisplay.textContent = `SCORE: ${score}`;
          if (score > hiScore) {
            hiScore = score;
            localStorage.setItem('nm_snake_hi', hiScore);
            if (hiDisplay) hiDisplay.textContent = `HI: ${hiScore}`;
          }
          // Flavor messages
          const msgs = { 5:'WARMING UP', 10:'GETTING GOOD', 20:'IMPRESSIVE', 35:'SNAKE GOD?', 50:'LEGENDARY' };
          if (msgs[score] && msgDisplay) msgDisplay.textContent = msgs[score];
        } else {
          snake.pop();
        }
      }
    }

    drawFood();
    drawSnake();
    drawHUD();

    if (dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = CLR.dead;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SEGMENTATION FAULT', W / 2, H / 2 - 18);
      ctx.fillStyle = '#fff';
      ctx.font = '13px monospace';
      ctx.fillText(`SCORE: ${score}   HI: ${hiScore}`, W / 2, H / 2 + 6);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px monospace';
      ctx.fillText('ARROW KEYS / WASD to restart', W / 2, H / 2 + 26);
      ctx.textAlign = 'left';

      // Restart on any direction key
      const restartHandler = e => {
        if (DIRS[e.key] || DIRS[e.key?.toLowerCase()]) {
          document.removeEventListener('keydown', restartHandler);
          initState();
          started = true;
          if (msgDisplay) msgDisplay.textContent = 'REBOOTING...';
        }
      };
      document.addEventListener('keydown', restartHandler);
    }

    snakeRaf = requestAnimationFrame(loop);
  }

  initState();
  snakeRunning = true;
  snakeRaf = requestAnimationFrame(loop);
}

function openSnakeGame() {
  const modal = document.getElementById('game-modal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  switchGame('snake');
}
