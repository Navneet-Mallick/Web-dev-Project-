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

      const templateParams = {
        name: this.form.name.value,
        email: this.form.email.value,
        message: this.form.message.value,
        time: new Date().toLocaleString()
      };

      // Show loading state
      const submitBtn = this.form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      emailjs.send(CONFIG.SERVICE_ID, CONFIG.TEMPLATE_ID, templateParams)
        .then(() => {
          alert('Message sent successfully! I\'ll get back to you soon.');
          this.form.reset();
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Failed to send message. Please try again or contact me directly via email.');
        })
        .finally(() => {
          submitBtn.textContent = originalText;
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
