/**
 * Terminal Animation Module
 * Simulates a terminal session with info about Navneet
 */

(function () {
  const LINES = [
    { type: 'cmd',    text: 'whoami' },
    { type: 'output', parts: [{ cls: 't-accent', text: 'Navneet Mallick' }, { cls: '', text: ' — Computer Engineering Student' }] },

    { type: 'cmd',    text: 'cat skills.json' },
    { type: 'output', parts: [{ cls: '', text: '{' }] },
    { type: 'output', parts: [{ cls: 't-key', text: '  "webDev"' }, { cls: '', text: ': ' }, { cls: 't-val', text: '["HTML", "CSS", "JS", "Node.js"],' }] },
    { type: 'output', parts: [{ cls: 't-key', text: '  "ml"' },     { cls: '', text: ': ' }, { cls: 't-val', text: '["Python", "ML", "Data Science"],' }] },
    { type: 'output', parts: [{ cls: 't-key', text: '  "backend"' },{ cls: '', text: ': ' }, { cls: 't-val', text: '["SQL", "Django"]' }] },
    { type: 'output', parts: [{ cls: '', text: '}' }] },

    { type: 'cmd',    text: 'git log --oneline -3' },
    { type: 'output', parts: [{ cls: 't-accent', text: 'a1b2c3d' }, { cls: '', text: ' Built portfolio website' }] },
    { type: 'output', parts: [{ cls: 't-accent', text: 'e4f5g6h' }, { cls: '', text: ' Deployed ML projects on Streamlit' }] },
    { type: 'output', parts: [{ cls: 't-accent', text: 'i7j8k9l' }, { cls: '', text: ' Completed internship @ CODE IT' }] },

    { type: 'cmd',    text: 'echo $STATUS' },
    { type: 'output', parts: [{ cls: 't-green', text: '✔ Open to opportunities' }] },
  ];

  const PROMPT = '<span class="t-prompt">navneet@portfolio</span><span style="color:#fff">:</span><span style="color:#79c0ff">~</span><span style="color:#fff">$</span>';
  const CMD_SPEED = 55;   // ms per character when typing a command
  const LINE_DELAY = 400; // ms between lines

  function makeOutputLine(parts) {
    const div = document.createElement('div');
    div.className = 't-line t-output';
    parts.forEach(p => {
      const span = document.createElement('span');
      span.className = p.cls || '';
      span.textContent = p.text;
      div.appendChild(span);
    });
    return div;
  }

  function typeCommand(body, text, done) {
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerHTML = PROMPT + ' ';
    const cmdSpan = document.createElement('span');
    cmdSpan.className = 't-cmd';
    line.appendChild(cmdSpan);

    const cursor = document.createElement('span');
    cursor.className = 't-cursor';
    line.appendChild(cursor);
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        cmdSpan.textContent += text[i++];
        body.scrollTop = body.scrollHeight;
      } else {
        clearInterval(interval);
        cursor.remove();
        setTimeout(done, 200);
      }
    }, CMD_SPEED);
  }

  function runLines(body, lines, index) {
    if (index >= lines.length) {
      // Final blinking cursor
      const last = document.createElement('div');
      last.className = 't-line';
      last.innerHTML = PROMPT + ' <span class="t-cursor"></span>';
      body.appendChild(last);
      body.scrollTop = body.scrollHeight;
      return;
    }

    const line = lines[index];

    if (line.type === 'cmd') {
      typeCommand(body, line.text, () => {
        runLines(body, lines, index + 1);
      });
    } else {
      setTimeout(() => {
        const el = makeOutputLine(line.parts);
        body.appendChild(el);
        body.scrollTop = body.scrollHeight;
        runLines(body, lines, index + 1);
      }, LINE_DELAY);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementById('terminal-body');
    if (!body) return;

    // Start after a short delay so page loads first
    setTimeout(() => runLines(body, LINES, 0), 1200);
  });
})();
