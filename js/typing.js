/**
 * Typing Effect Module
 * Creates animated typing effect for hero section
 */

const TypingEffect = {
  init() {
    this.typingText = document.getElementById('typing-text');
    if (!this.typingText) return;

    this.phrases = [
      "Computer Engineering Student",
      "Web Developer",
      "ML Enthusiast",
      "Graphics Designer"
    ];
    
    this.wordIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.typeSpeed = 100;

    this.type();
  },

  type() {
    const currentWord = this.phrases[this.wordIndex];
    
    if (this.isDeleting) {
      // Remove characters
      this.typingText.textContent = currentWord.substring(0, this.charIndex - 1);
      this.charIndex--;
      this.typeSpeed = 50; // Faster when deleting
    } else {
      // Add characters
      this.typingText.textContent = currentWord.substring(0, this.charIndex + 1);
      this.charIndex++;
      this.typeSpeed = 150; // Slower when typing
    }

    // Logic for switching words
    if (!this.isDeleting && this.charIndex === currentWord.length) {
      // Pause at the end of a word
      this.isDeleting = true;
      this.typeSpeed = 2000;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.phrases.length;
      this.typeSpeed = 500;
    }

    setTimeout(() => this.type(), this.typeSpeed);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => TypingEffect.init());
