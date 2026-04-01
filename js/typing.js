/**
 * Typing Effect — smooth edition
 */

(function () {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const phrases = [
    'a Web Developer',
    'an ML/DS Enthusiast',
    'a Computer Engineering Student',
    'a Graphics Designer',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let deleting    = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        // Pause at end before deleting
        setTimeout(() => { deleting = true; tick(); }, 2000);
        return;
      }
      // Typing: smooth base speed with tiny natural variance
      setTimeout(tick, 70 + Math.random() * 30);

    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        // Brief pause before typing next phrase
        setTimeout(tick, 500);
        return;
      }
      // Deleting: faster than typing, feels snappy
      setTimeout(tick, 35 + Math.random() * 15);
    }
  }

  setTimeout(tick, 1000);
})();
