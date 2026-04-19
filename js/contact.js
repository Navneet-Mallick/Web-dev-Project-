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

      const templateParams = {
        name: this.form.name.value.trim(),
        email: this.form.email.value.trim(),
        message: this.form.message.value.trim(),
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
