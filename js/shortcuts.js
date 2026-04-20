/**
 * Keyboard Shortcuts
 * Press ? to show help overlay
 */

(function () {
  const SHORTCUTS = [
    { key: '?',      desc: 'Show / hide this help' },
    { key: 'T',      desc: 'Toggle dark / light mode' },
    { key: 'G',      desc: 'Open games' },
    { key: 'M',      desc: 'Toggle music' },
    { key: '1',      desc: 'Go to Home' },
    { key: '2',      desc: 'Go to About' },
    { key: '3',      desc: 'Go to Projects' },
    { key: '4',      desc: 'Go to Skills' },
    { key: '5',      desc: 'Go to Contact' },
    { key: 'Esc',    desc: 'Close any overlay' },
  ];

  // Build overlay
  const overlay = document.createElement('div');
  overlay.id = 'shortcuts-overlay';
  overlay.style.cssText = `
    display: none; position: fixed; inset: 0; z-index: 999997;
    background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
    align-items: center; justify-content: center;
  `;

  overlay.innerHTML = `
    <div style="
      background: var(--card-bg, rgba(13,21,53,0.98));
      border: 1px solid rgba(0,217,255,0.25);
      border-radius: 16px; padding: 24px 28px;
      min-width: 300px; max-width: 440px; width: 90%;
      box-shadow: 0 0 40px rgba(0,217,255,0.15);
      font-family: 'Poppins', sans-serif;
      max-height: 85vh; overflow-y: auto;
    ">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
        <span style="color:#00d9ff; font-size:0.95rem; font-weight:700; letter-spacing:1px;"><i class="fas fa-keyboard" style="margin-right:8px;"></i>SHORTCUTS</span>
        <button id="shortcuts-close" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:20px;cursor:pointer;line-height:1;padding:4px 8px;">&times;</button>
      </div>
      <div id="shortcuts-list"></div>
      <p style="margin-top:16px; font-size:11px; color:rgba(255,255,255,0.3); text-align:center;">Press <kbd style="background:rgba(0,217,255,0.15);border:1px solid rgba(0,217,255,0.3);border-radius:4px;padding:1px 6px;color:#00d9ff;">?</kbd> or tap <i class="fas fa-keyboard" style="color:#00d9ff;"></i> to toggle</p>
    </div>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(overlay);

    // Populate list
    const list = document.getElementById('shortcuts-list');
    SHORTCUTS.forEach(s => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06);';
      row.innerHTML = `
        <span style="color:rgba(255,255,255,0.7); font-size:13px;">${s.desc}</span>
        <kbd style="background:rgba(0,217,255,0.12); border:1px solid rgba(0,217,255,0.3); border-radius:6px; padding:3px 10px; color:#00d9ff; font-size:12px; font-weight:700; white-space:nowrap;">${s.key}</kbd>
      `;
      list.appendChild(row);
    });

    document.getElementById('shortcuts-close').addEventListener('click', hide);
    overlay.addEventListener('click', e => { if (e.target === overlay) hide(); });
  });

  function show() {
    overlay.style.display = 'flex';
    setTimeout(() => overlay.querySelector('div').style.animation = 'fadeInUp 0.3s ease both', 10);
  }

  function hide() {
    overlay.style.display = 'none';
  }

  function toggle() {
    overlay.style.display === 'flex' ? hide() : show();
  }

  // Keyboard listener
  document.addEventListener('keydown', e => {
    // Skip if typing in an input/textarea
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    switch (e.key) {
      case '?':
        toggle();
        break;
      case 'Escape':
        hide();
        break;
      case 't': case 'T':
        document.getElementById('theme-btn')?.click();
        break;
      case 'g': case 'G':
        if (typeof openRunnerGame === 'function') openRunnerGame();
        break;
      case 'm': case 'M':
        document.getElementById('music-toggle')?.click();
        break;
      case '1':
        document.querySelector('a[href="#home"]')?.click();
        break;
      case '2':
        document.querySelector('a[href="#about"]')?.click();
        break;
      case '3':
        document.querySelector('a[href="#projects"]')?.click();
        break;
      case '4':
        document.querySelector('a[href="#skills"]')?.click();
        break;
      case '5':
        document.querySelector('a[href="#contact"]')?.click();
        break;
    }
  });

  // Expose globally
  window.showShortcuts = show;
})();
