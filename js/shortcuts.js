/**
 * Keyboard Shortcuts Modal
 * Press ? or tap the keyboard icon to show/hide.
 * Fully mobile-friendly — no inline styles on the card.
 */

(function () {
  'use strict';

  const SHORTCUTS = [
    { key: '?',   desc: 'Show / hide this help',   icon: 'fa-keyboard'       },
    { key: 'T',   desc: 'Toggle dark / light mode', icon: 'fa-circle-half-stroke' },
    { key: 'G',   desc: 'Open games',               icon: 'fa-gamepad'        },
    { key: 'M',   desc: 'Toggle music',             icon: 'fa-music'          },
    { key: '1',   desc: 'Go to Home',               icon: 'fa-house'          },
    { key: '2',   desc: 'Go to About',              icon: 'fa-user'           },
    { key: '3',   desc: 'Go to Projects',           icon: 'fa-code'           },
    { key: '4',   desc: 'Go to Skills',             icon: 'fa-brain'          },
    { key: '5',   desc: 'Go to Contact',            icon: 'fa-envelope'       },
    { key: 'Esc', desc: 'Close any overlay',        icon: 'fa-xmark'          },
  ];

  /* ── Build DOM ──────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'shortcuts-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Keyboard shortcuts');

  overlay.innerHTML = `
    <div class="sc-card" id="shortcuts-card">
      <div class="sc-header">
        <span class="sc-title">
          <i class="fas fa-keyboard"></i> Shortcuts
        </span>
        <button class="sc-close" id="shortcuts-close" aria-label="Close shortcuts">
          <i class="fas fa-xmark"></i>
        </button>
      </div>

      <div class="sc-list" id="shortcuts-list"></div>

      <p class="sc-hint">
        Press <kbd>?</kbd> or tap <i class="fas fa-keyboard"></i> to toggle
      </p>
    </div>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(overlay);

    /* Populate rows */
    const list = document.getElementById('shortcuts-list');
    SHORTCUTS.forEach(s => {
      const row = document.createElement('div');
      row.className = 'sc-row';
      row.innerHTML = `
        <span class="sc-desc">
          <i class="fas ${s.icon} sc-icon"></i>${s.desc}
        </span>
        <kbd class="sc-kbd">${s.key}</kbd>
      `;
      list.appendChild(row);
    });

    document.getElementById('shortcuts-close')
      .addEventListener('click', hide);

    overlay.addEventListener('click', e => {
      if (e.target === overlay) hide();
    });

    /* Swipe-down to close on mobile */
    let touchStartY = 0;
    const card = document.getElementById('shortcuts-card');
    card.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    card.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (dy > 60) hide();   // swipe down 60 px → close
    }, { passive: true });
  });

  /* ── Show / hide ────────────────────────────────── */
  function show() {
    overlay.style.display = 'flex';
    /* Next tick so CSS transition fires */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('sc-visible'));
    });
    document.body.style.overflow = 'hidden';
  }

  function hide() {
    overlay.classList.remove('sc-visible');
    document.body.style.overflow = '';
    /* Wait for transition before display:none */
    overlay.addEventListener('transitionend', () => {
      if (!overlay.classList.contains('sc-visible')) {
        overlay.style.display = 'none';
      }
    }, { once: true });
  }

  function toggle() {
    overlay.classList.contains('sc-visible') ? hide() : show();
  }

  /* ── Keyboard listener ──────────────────────────── */
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    switch (e.key) {
      case '?':        toggle(); break;
      case 'Escape':   hide();   break;
      case 't': case 'T':
        document.getElementById('theme-btn')?.click(); break;
      case 'g': case 'G':
        if (typeof openRunnerGame === 'function') openRunnerGame(); break;
      case 'm': case 'M':
        document.getElementById('music-toggle')?.click(); break;
      case '1': document.querySelector('a[href="#home"]')?.click();     break;
      case '2': document.querySelector('a[href="#about"]')?.click();    break;
      case '3': document.querySelector('a[href="#projects"]')?.click(); break;
      case '4': document.querySelector('a[href="#skills"]')?.click();   break;
      case '5': document.querySelector('a[href="#contact"]')?.click();  break;
    }
  });

  /* ── Global API ─────────────────────────────────── */
  window.showShortcuts = show;
  window.hideShortcuts = hide;
  window.toggleShortcuts = toggle;

})();
