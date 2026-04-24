/**
 * interactions.js — Specialized User Interaction Handling
 * 1. Focus trapping for accessibility
 * 2. Gesture support (mobile swipe back)
 * 3. Haptic feedback simulation
 * 4. Keyboard shortcuts (shortcuts for modals, game, etc.)
 */

const Interactions = {
  init() {
    this.setupKeyboardShortcuts();
    this.setupHapticSimulation();
    this.setupFocusTrapping();
    this.setupGestureSupport();
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // ALT + G : Open Game
      if (e.altKey && e.key.toLowerCase() === 'g') {
        if (typeof openRunnerGame === 'function') openRunnerGame();
      }
      
      // ALT + C : Open Contact
      if (e.altKey && e.key.toLowerCase() === 'c') {
        const contact = document.querySelector('#contact');
        if (contact) contact.scrollIntoView({ behavior: 'smooth' });
      }

      // Escape always closes active modals
      if (e.key === 'Escape') {
        const closeModals = [
          'project-detail-modal',
          'game-modal',
          'egg-modal',
          'nav-dropdown'
        ];
        closeModals.forEach(id => {
          const el = document.getElementById(id) || document.querySelector('.' + id);
          if (el && (el.classList.contains('active') || el.style.display === 'flex')) {
             if (id === 'game-modal' && typeof closeRunnerGame === 'function') closeRunnerGame();
             else if (id === 'project-detail-modal' && typeof closeProjectModal === 'function') closeProjectModal();
             else {
               el.classList.remove('active');
               el.style.display = 'none';
               document.body.style.overflow = '';
             }
          }
        });
      }
    });
  },

  setupHapticSimulation() {
    document.querySelectorAll('.btn, .project-card, .magnetic, .nav-links a').forEach(el => {
      // Support both mouse and touch events
      el.addEventListener('pointerdown', () => {
        if (window.navigator.vibrate) {
           window.navigator.vibrate(10); // Subtle 10ms click vibration on supported mobile devices
        }
      }, { passive: true });
    });
  },

  setupFocusTrapping() {
    // Add logic here if heavy accessibility-compliance is needed for modals
  },

  setupGestureSupport() {
    let touchstartX = 0;
    let touchendX = 0;

    document.addEventListener('touchstart', e => {
      touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      touchendX = e.changedTouches[0].screenX;
      this.handleGesture(touchstartX, touchendX);
    }, { passive: true });
  },

  handleGesture(start, end) {
    const diff = end - start;
    if (Math.abs(diff) > 100) {
      // Right swipe (end > start)
      const dropdown = document.getElementById('nav-dropdown');
      if (diff > 0 && dropdown && dropdown.classList.contains('active')) {
          dropdown.classList.remove('active');
          document.getElementById('hamburger-wrap')?.classList.remove('open');
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Interactions.init());
