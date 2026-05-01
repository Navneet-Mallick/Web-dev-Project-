/**
 * analytics.js - Client-side Session Tracking
 * Tracks: Session duration, section views, interactions, and device info.
 * Stores data in localStorage for the .admin/analytics.html dashboard.
 */

const Analytics = {
  session: {
    sessionId: '',
    startTime: 0,
    duration: 0,
    pageViews: 0,
    interactions: 0,
    sectionsVisited: new Set(),
    deviceInfo: {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    }
  },

  init() {
    this.session.sessionId = this.generateUUID();
    this.session.startTime = Date.now();
    this.session.pageViews = 1;
    
    this.setupListeners();
    this.startHeartbeat();
    console.log("Analytics initialized [Session: " + this.session.sessionId.substring(0, 8) + "]");
  },

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  setupListeners() {
    // Track interactions (clicks)
    document.addEventListener('click', (e) => {
      if (e.target.closest('a, button, .btn, .project-card, .skill')) {
        this.session.interactions++;
      }
    }, { passive: true });

    // Track section views using Intersection Observer
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (!this.session.sectionsVisited.has(id)) {
            this.session.sectionsVisited.add(id);
            this.session.pageViews++;
          }
        }
      });
    }, { threshold: 0.5 });

    sections.forEach(s => observer.observe(s));

    // Save on exit
    window.addEventListener('beforeunload', () => this.saveSession());
  },

  startHeartbeat() {
    // Update duration every 5 seconds
    setInterval(() => {
      this.session.duration = Math.floor((Date.now() - this.session.startTime) / 1000);
      this.saveSession();
    }, 5000);
  },

  saveSession() {
    try {
      const allSessions = JSON.parse(localStorage.getItem('analytics-sessions') || '[]');
      
      // Update current session if it exists, otherwise add it
      const index = allSessions.findIndex(s => s.sessionId === this.session.sessionId);
      
      const sessionData = {
        ...this.session,
        sectionsVisited: Array.from(this.session.sectionsVisited),
        endTime: Date.now()
      };

      if (index !== -1) {
        allSessions[index] = sessionData;
      } else {
        // Keep only last 100 sessions to prevent localStorage bloat
        if (allSessions.length >= 100) allSessions.shift();
        allSessions.push(sessionData);
      }

      localStorage.setItem('analytics-sessions', JSON.stringify(allSessions));
    } catch (e) {
      console.error("Failed to save analytics session:", e);
    }
  }
};

// Start tracking when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Analytics.init());
} else {
  Analytics.init();
}
