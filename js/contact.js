/**
 * Contact Form Module
 * Handles form submission via EmailJS
 */

const ContactForm = {
  init() {
    this.form = document.querySelector('.contact-form');
    if (!this.form) return;

    // Initialize EmailJS
    if (typeof emailjs !== 'undefined' && typeof CONFIG !== 'undefined') {
      emailjs.init(CONFIG.PUBLIC_KEY);
      this.setupFormSubmit();
    } else {
      console.warn('EmailJS or CONFIG not loaded');
    }

    // Setup CV download status
    this.setupCVDownload();
  },

  setupFormSubmit() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Honeypot check — bots fill hidden fields, humans don't
      const honey = this.form.querySelector('input[name="_honey"]');
      if (honey && honey.value.trim() !== '') {
        // Silently reject — don't tell the bot it failed
        this.form.reset();
        return;
      }

      // Validate inputs
      const name = this.form.name.value.trim();
      const email = this.form.email.value.trim();
      const message = this.form.message.value.trim();

      // Clear previous errors
      this.clearErrors();

      // Validation checks
      let isValid = true;

      if (!name || name.length < 2) {
        this.showError('name', 'Name must be at least 2 characters');
        isValid = false;
      }

      if (!email || !this.validateEmail(email)) {
        this.showError('email', 'Please enter a valid email address');
        isValid = false;
      }

      if (!message || message.length < 10) {
        this.showError('message', 'Message must be at least 10 characters');
        isValid = false;
      }

      if (!isValid) return;

      // Sanitize inputs
      const templateParams = {
        name: this.sanitize(name),
        email: this.sanitize(email),
        message: this.sanitize(message),
        time: new Date().toLocaleString()
      };

      // Show loading state
      const submitBtn = this.form.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      emailjs.send(CONFIG.SERVICE_ID, CONFIG.TEMPLATE_ID, templateParams)
        .then(() => {
          showToast('Message sent! I\'ll get back to you soon. 🚀', 'success');
          this.form.reset();
          this.clearErrors();
        })
        .catch((error) => {
          console.error('EmailJS error:', error);
          showToast('Failed to send. Please try again or email me directly.', 'error');
        })
        .finally(() => {
          submitBtn.innerHTML = originalHTML;
          submitBtn.disabled = false;
        });
    });
  },

  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  showError(fieldName, message) {
    const input = this.form.querySelector(`input[name="${fieldName}"], textarea[name="${fieldName}"]`);
    const errorSpan = this.form.querySelector(`#${fieldName}-error`);
    if (input) input.classList.add('error');
    if (errorSpan) errorSpan.textContent = message;
  },

  clearErrors() {
    this.form.querySelectorAll('input, textarea').forEach(el => el.classList.remove('error'));
    this.form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  },

  setupCVDownload() {
    document.querySelectorAll('.download-cv-btn').forEach(button => {
      button.addEventListener('click', function(e) {
        const statusSpan = this.nextElementSibling;
        
        if (statusSpan && statusSpan.classList.contains('resume-status-inline')) {
          statusSpan.style.opacity = 1;
          statusSpan.innerText = 'Preparing PDF...';

          setTimeout(() => {
            statusSpan.innerText = 'Downloaded!';
            setTimeout(() => { 
              statusSpan.style.opacity = 0; 
            }, 2000);
          }, 1000);
        }
      });
    });
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => ContactForm.init());
