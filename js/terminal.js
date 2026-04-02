(function () {

  const PROMPT = '<span class="t-prompt">navneet@portfolio</span><span style="color:#fff">:</span><span style="color:#79c0ff">~</span><span style="color:#fff">$</span>';
  const NOISE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';

  const INTRO = [
    { type: 'cmd', text: 'whoami' },
    { type: 'out', parts: [{ cls: 't-accent', text: 'Navneet Mallick' }, { cls: '', text: ' -- CE Student | Web Dev | ML/DS Learnerth ' }] },

    { type: 'cmd', text: 'cat about.txt' },
    { type: 'out', parts: [{ cls: 't-green', text: 'Location: ' }, { cls: '', text: 'Dharan, Nepal' }] },
    { type: 'out', parts: [{ cls: 't-green', text: 'Education: ' }, { cls: '', text: 'IOE Purwanchal Campus' }] },
    { type: 'out', parts: [{ cls: 't-green', text: 'Role: ' }, { cls: '', text: 'Intern Supervisor @ CODE IT | Designer @ ACES ERC' }] },

    { type: 'cmd', text: 'cat skills.json' },
    { type: 'out', parts: [{ cls: 't-key', text: '"expert":       ' }, { cls: 't-val', text: '["HTML","CSS","JS","SQL","C++"]' }] },
    { type: 'out', parts: [{ cls: 't-key', text: '"intermediate": ' }, { cls: 't-val', text: '["Python","ML","Node.js","PHP"]' }] },
    { type: 'out', parts: [{ cls: 't-key', text: '"beginner":     ' }, { cls: 't-val', text: '["Django","React"]' }] },

    { type: 'cmd', text: 'git log --oneline -3' },
    { type: 'out', parts: [{ cls: 't-accent', text: 'a1b2c3d ' }, { cls: '', text: 'Deployed portfolio v2' }] },
    { type: 'out', parts: [{ cls: 't-accent', text: 'e4f5g6h ' }, { cls: '', text: 'Built ML movie recommender' }] },
    { type: 'out', parts: [{ cls: 't-accent', text: 'i7j8k9l ' }, { cls: '', text: 'ACES TechFest 7.0 & X-Hack 3.0' }] },

    { type: 'cmd', text: 'echo $STATUS' },
    { type: 'out', parts: [{ cls: 't-green', text: 'Available for opportunities & collaboration' }] },
  ];

  const JOKES = [ 
  "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
  "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
  "Why did the developer go broke? Because he used up all his cache. 💸",
  "I told my computer I needed a break. Now it won't stop sending me Kit-Kat ads.",
  "There are 10 types of people: those who understand binary and those who don't.",
  "Why do Java developers wear glasses? Because they don't see sharp. 👓",
  "Debugging: Being the detective in a crime movie where you are also the murderer.",
  "Why did the function return early? Because it had a timeout issue.",
  "I would tell you a UDP joke, but you might not get it.",
  "Why was the JavaScript developer sad? Because he didn't 'null' his feelings. 😄"
];

  const CMDS = {
    help: [
      { cls: 't-accent', text: '┌─ Available Commands ──────────────────────┐' },
      { cls: 't-green',  text: '  about      — who am I?' },
      { cls: 't-green',  text: '  skills     — tech stack' },
      { cls: 't-green',  text: '  projects   — what I built' },
      { cls: 't-green',  text: '  contact    — reach me' },
      { cls: 't-green',  text: '  ls         — list everything' },
      { cls: 't-green',  text: '  neofetch   — system info' },
      { cls: 't-green',  text: '  date       — current date & time' },
      { cls: 't-green',  text: '  joke       — random dev joke 😄' },
      { cls: 't-green',  text: '  music      — now playing' },
      { cls: 't-green',  text: '  open <name>— open a project (try: movie)' },
      { cls: 't-green',  text: '  cv         — download my CV 📄' },
      { cls: 't-green',  text: '  ping navneet — chat with me ..hey how are you?🟢' },
      { cls: 't-green',  text: '  cat readme.md — about this portfolio' },
      { cls: 't-green',  text: '  uptime     — how long I\'ve been running' },
      { cls: 't-green',  text: '  uname      — system info' },
      { cls: 't-green',  text: '  sudo rm -rf /  — hehe try it 😈' },
      { cls: 't-green',  text: '  clear      — clear terminal' },
      { cls: 't-accent', text: '└───────────────────────────────────────────┘' },
    ],
    about: [
      { cls: 't-accent', text: '  ╔══════════════════════════════════════╗' },
      { cls: 't-accent', text: '  ║        NAVNEET MALLICK               ║' },
      { cls: 't-accent', text: '  ╚══════════════════════════════════════╝' },
      { cls: 't-green',  text: '  📍 Dharan, Nepal' },
      { cls: 't-green',  text: '  🎓 IOE Purwanchal Campus — CE Student' },
      { cls: 't-green',  text: '  💼 Intern Supervisor @ CODE IT' },
      { cls: 't-green',  text: '  🎨 Graphics Designer @ ACES ERC' },
      { cls: '',         text: '  🎸 Probably listening to Eagles rn' },
    ],
    skills: [
      { cls: 't-accent', text: '  ⚡ Expert:       HTML · CSS · JS · SQL · C++' },
      { cls: 't-val',    text: '  🔥 Intermediate: Python · ML · Node.js · PHP' },
      { cls: 't-key',    text: '  🌱 Learning:     Django · React · Docker' },
    ],
    projects: [
      { cls: 't-accent', text: '  🎬 Movie Recommender  → movie-recommender-navneet.streamlit.app' },
      { cls: 't-val',    text: '  🎵 GrooveBox          → navneet-mallick.github.io/GrooveBox-Music' },
      { cls: 't-green',  text: '  🚗 Car Price Predictor→ carpredictor-navneet.streamlit.app' },
      { cls: '',         text: '  🗳️  VoteSecure Online  → github.com/Navneet-Mallick' },
      { cls: '',         text: '  🌦️  Weather App        → navneet-mallick.github.io/Weather-App-' },
    ],
    contact: [
      { cls: 't-green',  text: '  📧 navneetmallick092@gmail.com' },
      { cls: 't-accent', text: '  💼 linkedin.com/in/navneet-mallick-313829279' },
      { cls: 't-val',    text: '  🐙 github.com/Navneet-Mallick' },
      { cls: '',         text: '  📸 instagram.com/navneet_nm07' },
    ],
    ls: [
      { cls: 't-accent', text: '  📁 about.txt    skills.json   projects/   contact.txt' },
      { cls: 't-val',    text: '  📁 resume.pdf   github/       music/      easter-egg.sh' },
    ],
    neofetch: [
      { cls: 't-accent', text: '        .\'-.        navneet@portfolio' },
      { cls: 't-accent', text: '       /|6 6|\\       ─────────────────' },
      { cls: 't-green',  text: '      ( | ⌣ | )      OS: Portfolio v2.0' },
      { cls: 't-green',  text: '       \\ \`-\' /       Shell: zsh + vibes' },
      { cls: 't-val',    text: '     .-\`   \`-.       CPU: Brain @ 3AM' },
      { cls: 't-val',    text: '    /  NM  \\       RAM: Coffee-powered' },
      { cls: '',         text: '   \'──────────\'      Music: Eagles 🎸' },
      { cls: '',         text: '                     Status: Available ✅' },
    ],
  };

  function typeCmd(body, text, done) {
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerHTML = PROMPT + ' ';
    const cmd = document.createElement('span'); cmd.className = 't-cmd';
    const cur = document.createElement('span'); cur.className = 't-cursor';
    line.appendChild(cmd); line.appendChild(cur);
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
    let i = 0, f = 0;
    const iv = setInterval(() => {
      if (i < text.length) {
        cmd.textContent = text.slice(0, i) + (f % 2 === 0 ? NOISE[Math.floor(Math.random() * NOISE.length)] : text[i]);
        if (f++ % 2 === 0) i++;
        body.scrollTop = body.scrollHeight;
      } else {
        cmd.textContent = text; clearInterval(iv); cur.remove();
        glitch(cmd); setTimeout(done, 160);
      }
    }, 80);
  }

  function glitch(el) {
    const c = ['#ff00c1','#00fff9','#fff','#00d9ff']; let t = 0;
    const iv = setInterval(() => {
      el.style.color = c[t % c.length];
      el.style.textShadow = '0 0 8px ' + c[t % c.length];
      if (++t > 5) { clearInterval(iv); el.style.color = ''; el.style.textShadow = ''; }
    }, 38);
  }

  function outLine(parts) {
    const d = document.createElement('div');
    d.className = 't-line t-output';
    d.style.cssText = 'opacity:0;transform:translateX(-10px)';
    parts.forEach(p => {
      const s = document.createElement('span');
      s.className = p.cls || ''; s.textContent = p.text; d.appendChild(s);
    });
    return d;
  }

  function show(el) {
    el.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
    requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateX(0)'; });
  }

  function runIntro(body, idx, done) {
    if (idx >= INTRO.length) { done(); return; }
    const line = INTRO[idx];
    if (line.type === 'cmd') {
      typeCmd(body, line.text, () => runIntro(body, idx + 1, done));
    } else {
      setTimeout(() => {
        const el = outLine(line.parts); body.appendChild(el); show(el);
        body.scrollTop = body.scrollHeight;
        runIntro(body, idx + 1, done);
      }, 350);
    }
  }

  let history = [], histIdx = -1;

  function printLines(body, lines, done) {
    let d = 80;
    lines.forEach(r => {
      setTimeout(() => { const el = outLine([r]); body.appendChild(el); show(el); body.scrollTop = body.scrollHeight; }, d);
      d += 65;
    });
    setTimeout(done, d + 60);
  }

  function spawnHint(body) {
    const hint = document.createElement('div');
    hint.id = 't-hint-pulse';
    hint.style.cssText = 'text-align:center;padding:10px 0 4px;font-size:12px;letter-spacing:2px;animation:hintPulse 1.8s ease-in-out infinite;';
    hint.innerHTML = '<span style="color:#00d9ff;opacity:1">⌨  type something... try \'help\'</span>';
    body.appendChild(hint);
    body.scrollTop = body.scrollHeight;
    document.addEventListener('keydown', (e) => { if (e.key !== 'Enter') hint.remove(); }, { once: true });
  }

  function spawnInput(body) {
    const wrap = document.createElement('div');
    wrap.className = 't-line';
    wrap.innerHTML = PROMPT + ' ';
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 't-input';
    inp.setAttribute('autocomplete', 'off');
    inp.setAttribute('spellcheck', 'false');
    inp.setAttribute('aria-label', 'Terminal input');
    wrap.appendChild(inp); body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
    setTimeout(() => inp.focus(), 150);

    inp.addEventListener('keydown', e => {
      // Arrow key history
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx < history.length - 1) { histIdx++; inp.value = history[histIdx]; }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx > 0) { histIdx--; inp.value = history[histIdx]; }
        else { histIdx = -1; inp.value = ''; }
        return;
      }
      if (e.key !== 'Enter') return;

      const val = inp.value.trim();
      const cmd = val.toLowerCase();
      if (val) { history.unshift(val); histIdx = -1; }
      inp.disabled = true;
      const s = document.createElement('span');
      s.className = 't-cmd'; s.textContent = val;
      wrap.replaceChild(s, inp);

      // Dynamic commands
      if (cmd === 'clear') { setTimeout(() => { body.innerHTML = ''; spawnInput(body); }, 150); return; }

      if (cmd === 'date') {
        const now = new Date();
        const res = [{ cls: 't-green', text: '  📅 ' + now.toDateString() + '  ⏰ ' + now.toLocaleTimeString() }];
        printLines(body, res, () => spawnInput(body)); return;
      }

      if (cmd === 'joke') {
        const j = JOKES[Math.floor(Math.random() * JOKES.length)];
        printLines(body, [{ cls: 't-val', text: '  😂 ' + j }], () => spawnInput(body)); return;
      }

      if (cmd === 'music') {
        const track = document.getElementById('music-track-name');
        const t = track ? track.textContent : 'Interstellar — Hans Zimmer';
        printLines(body, [{ cls: 't-accent', text: '  🎵 Now playing: ' + t }], () => spawnInput(body)); return;
      }
if (cmd === 'sudo rm -rf /' || cmd === 'sudo rm -rf') {
  // Dramatic slow deletion with suspense
  const rmLines = [
    { cls: '', text: '  [sudo] password for navneet: ••••••••' },
    { cls: 't-val', text: '  WARNING: This will delete everything!' },
    { cls: '', text: '  Are you sure? (y/N): y' },
    { cls: 't-val', text: '  Initializing deletion sequence...' },
    { cls: '', text: '  ██░░░░░░░░░░░░░░░░░░  10%  /home/navneet' },
    { cls: '', text: '  ████░░░░░░░░░░░░░░░░  20%  /var/www' },
    { cls: '', text: '  ██████░░░░░░░░░░░░░░  30%  /etc/nginx' },
    { cls: '', text: '  ████████░░░░░░░░░░░░  40%  /usr/local' },
    { cls: '', text: '  ██████████░░░░░░░░░░  50%  /opt/projects' },
    { cls: '', text: '  ████████████░░░░░░░░  60%  /lib/system' },
    { cls: '', text: '  ██████████████░░░░░░  70%  /boot' },
    { cls: '', text: '  ████████████████░░░░  80%  /sys/kernel' },
    { cls: '', text: '  ██████████████████░░  90%  /dev/null' },
    { cls: 't-key', text: '  ████████████████████ 100% COMPLETE' },
    { cls: 't-green', text: '  Just kidding 😈 Your files are safe. Nice try tho.' },
  ];

  // Print with longer delays for suspense
  let d = 100;
  rmLines.forEach((r, i) => {
    const delay = i < 4 ? d : d + (i - 3) * 300; // slow down after warning
    setTimeout(() => {
      const el = outLine([r]);
      body.appendChild(el);
      show(el);
      body.scrollTop = body.scrollHeight;
    }, delay);
    d = delay;
  });

  setTimeout(() => spawnInput(body), d + 200);
  return;
}

// Separate sudo command handler


      if (cmd === 'sudo') {
        printLines(body, [{ cls: '', text: '  Nice try. You are not in the sudoers file. This incident will be reported. 👀' }], () => spawnInput(body)); return;
      }

      // open <project> command
      if (cmd.startsWith('open ')) {
        const project = cmd.slice(5).trim();
        const projects = {
          'movie': 'https://movie-recommender-navneet.streamlit.app/',
          'car': 'https://carpredictor-navneet.streamlit.app/',
          'groovebox': 'https://navneet-mallick.github.io/GrooveBox-Music/',
          'pokedex': 'https://navneet-mallick.github.io/Pokedex_for_Pokemon/',
          'weather': 'https://navneet-mallick.github.io/Weather-App-/',
        };
        const url = projects[project];
        if (url) {
          printLines(body, [{ cls: 't-accent', text: `  🚀 Opening ${project}...` }], () => {
            window.open(url, '_blank');
            spawnInput(body);
          });
        } else {
          printLines(body, [
            { cls: 't-key', text: '  Available: movie | car | groovebox | pokedex | weather' }
          ], () => spawnInput(body));
        }
        return;
      }

      // cv / resume command
      if (cmd === 'cv' || cmd === 'resume') {
        printLines(body, [{ cls: 't-accent', text: '  📄 Downloading CV...' }], () => {
          const a = document.createElement('a');
          a.href = './Assets/Navneet _CV.pdf';
          a.download = 'Navneet_Mallick_CV.pdf';
          a.click();
          spawnInput(body);
        });
        return;
      }

      // whoami extended
      if (cmd === 'pwd') {
        printLines(body, [{ cls: 't-val', text: '  /home/navneet/portfolio' }], () => spawnInput(body)); return;
      }

      if (cmd === 'uname') {
        printLines(body, [{ cls: 't-val', text: '  Portfolio-OS v2.0 (Navneet-Mallick) #1 SMP' }], () => spawnInput(body)); return;
      }

      if (cmd === 'uptime') {
        const hrs = Math.floor(Math.random() * 12) + 1;
        printLines(body, [{ cls: 't-green', text: `  up ${hrs} hours, 1 user, load average: 0.42, 0.69, 1.00` }], () => spawnInput(body)); return;
      }

      if (cmd === 'ping navneet') {
        const lines = [
          { cls: 't-accent', text: '  PING navneet.dev (127.0.0.1)' },
          { cls: 't-green', text: '  64 bytes: icmp_seq=1 ttl=64 time=0.1ms' },
          { cls: 't-green', text: '  64 bytes: icmp_seq=2 ttl=64 time=0.1ms' },
          { cls: 't-green', text: '  64 bytes: icmp_seq=3 ttl=64 time=0.1ms' },
          { cls: 't-val',   text: '  3 packets transmitted, 3 received, 0% loss 🟢' },
        ];
        printLines(body, lines, () => spawnInput(body)); return;
      }

      if (cmd === 'cat readme.md') {
        const lines = [
          { cls: 't-accent', text: '  # Navneet Mallick — Portfolio v2.0' },
          { cls: '', text: '  Built with: HTML · CSS · Vanilla JS · Passion' },
          { cls: 't-green', text: '  Features: Terminal · Music · Matrix Rain · Animations' },
          { cls: 't-val',   text: '  Status: Always improving 🚀' },
        ];
        printLines(body, lines, () => spawnInput(body)); return;
      }

      if (cmd === 'hacker' || cmd === './easter-egg.sh' || cmd === 'sh easter-egg.sh') {
        if (window.triggerEasterEgg) {
          printLines(body, [{ cls: 't-accent', text: '  🔓 Executing secret script...' }], () => {
             window.triggerEasterEgg();
          });
          return;
        }
      }

      const res = CMDS[cmd];
      if (res) {
        printLines(body, res, () => spawnInput(body));
      } else if (cmd === '') {
        spawnInput(body);
      } else {
        setTimeout(() => {
          const el = outLine([{ cls: '', text: '  zsh: command not found: ' + val + "  (try 'help')" }]);
          el.querySelector('span').style.color = '#ff5f57';
          body.appendChild(el); show(el); body.scrollTop = body.scrollHeight;
          spawnInput(body);
        }, 100);
      }
    });
  }

  function boot(body, termEl) {
    body.innerHTML = '';

    const init = document.createElement('div');
    init.className = 't-line';
    init.innerHTML = '<span style="color:#58a6ff">Initializing</span><span id="t-dots"></span>';
    body.appendChild(init);
    let d = 0;
    const dIv = setInterval(() => { const el = document.getElementById('t-dots'); if (el) el.textContent = '.'.repeat((d++ % 3) + 1); }, 280);

    setTimeout(() => {
      clearInterval(dIv); init.remove();
      runIntro(body, 0, () => {
        const hint = outLine([{ cls: '', text: "// interactive mode -- type 'help'" }]);
        hint.querySelector('span').style.cssText = 'color:#58a6ff;font-style:italic;opacity:0.7';
        body.appendChild(hint); show(hint); body.scrollTop = body.scrollHeight;
        setTimeout(() => { spawnInput(body); spawnHint(body); }, 400);
      });
    }, 900);
  }

  const st = document.createElement('style');
  st.textContent = `
    .t-line { opacity: 1 !important; animation: none !important; }
    @keyframes hintPulse {
      0%,100% { opacity:0.8; transform:translateY(0); }
      50%     { opacity:1;   transform:translateY(-3px); }
    }
    .t-cursor { animation: blink 0.7s infinite, tCP 3s ease-in-out infinite !important; }
    @keyframes tCP {
      0%,100%{ background:#00d9ff; box-shadow:0 0 8px rgba(0,217,255,0.8); }
      50%    { background:#7c3aed; box-shadow:0 0 8px rgba(124,58,237,0.8); }
    }
    .t-input {
      background:transparent; border:none; outline:none;
      color:#79c0ff; font-family:'Courier New',monospace;
      font-size:14px; caret-color:#00d9ff; width:65%;
    }
  `;
  document.head.appendChild(st);

  document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementById('terminal-body');
    const termEl = document.querySelector('.terminal');
    if (!body || !termEl) return;
    boot(body, termEl);
    // Click anywhere in terminal to refocus input
    termEl.addEventListener('click', () => {
      const inp = termEl.querySelector('.t-input:not(:disabled)');
      if (inp) inp.focus();
    });
    termEl.addEventListener('mouseenter', () => {
      termEl.style.transform = 'translateY(-5px)';
      termEl.style.boxShadow = '0 0 50px rgba(0,217,255,0.25),0 25px 70px rgba(0,0,0,0.6)';
    });
    termEl.addEventListener('mouseleave', () => { termEl.style.transform = ''; termEl.style.boxShadow = ''; });
  });

})();
  // document.addEventListener('DOMContentLoaded', () => {
  //   const body = document.getElementById('terminal-body');
  //   const termEl = document.querySelector('.terminal');
  //   const termCard = document.querySelector('.terminal-card');
  //   if (!body || !termEl) return;
  //   boot(body, termEl);

  //   // ── THREE DOT BUTTONS ──────────────────────────────
  //   const btnRed    = termEl.querySelector('.t-btn.t-red');
  //   const btnYellow = termEl.querySelector('.t-btn.t-yellow');
  //   const btnGreen  = termEl.querySelector('.t-btn.t-green');

  //   // Red — clear terminal
  //   if (btnRed) {
  //     btnRed.style.cursor = 'pointer';
  //     btnRed.title = 'Clear';
  //     btnRed.addEventListener('click', (e) => {
  //       e.stopPropagation();
  //       body.innerHTML = '';
  //       spawnInput(body);
  //       showToast && showToast('Terminal cleared 🗑️', 'info', 1500);
  //     });
  //   }

  //   // Yellow — minimize/collapse terminal body
  //   if (btnYellow) {
  //     btnYellow.style.cursor = 'pointer';
  //     btnYellow.title = 'Minimize';
  //     let minimized = false;
  //     btnYellow.addEventListener('click', (e) => {
  //       e.stopPropagation();
  //       minimized = !minimized;
  //       body.style.transition = 'max-height 0.4s ease, opacity 0.3s ease';
  //       body.style.maxHeight = minimized ? '0' : '420px';
  //       body.style.opacity = minimized ? '0' : '1';
  //       body.style.overflow = minimized ? 'hidden' : 'auto';
  //       btnYellow.title = minimized ? 'Restore' : 'Minimize';
  //     });
  //   }

  //   // Green — maximize (expand terminal height)
  //   if (btnGreen) {
  //     btnGreen.style.cursor = 'pointer';
  //     btnGreen.title = 'Maximize';
  //     let maximized = false;
  //     btnGreen.addEventListener('click', (e) => {
  //       e.stopPropagation();
  //       maximized = !maximized;
  //       body.style.transition = 'max-height 0.4s ease';
  //       body.style.maxHeight = maximized ? '80vh' : '420px';
  //       if (termCard) {
  //         termCard.style.transition = 'transform 0.4s ease';
  //         termCard.style.transform = maximized ? 'rotateY(0) rotateX(0) scale(1.03)' : '';
  //       }
  //       btnGreen.title = maximized ? 'Restore' : 'Maximize';
  //     });
  //   }

  //   // Click anywhere in terminal to refocus input
  //   termEl.addEventListener('click', () => {
  //     const inp = termEl.querySelector('.t-input:not(:disabled)');
  //     if (inp) inp.focus();
  //   });
  //   termEl.addEventListener('mouseenter', () => {
  //     termEl.style.transform = 'translateY(-5px)';
  //     termEl.style.boxShadow = '0 0 50px rgba(0,217,255,0.25),0 25px 70px rgba(0,0,0,0.6)';
  //   });
  //   termEl.addEventListener('mouseleave', () => { termEl.style.transform = ''; termEl.style.boxShadow = ''; });
  // });