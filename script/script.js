document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-btn');
    const dropdown = document.getElementById('nav-dropdown');

    // 1. Toggle Dropdown on Click
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });

    // 2. Close dropdown when clicking any link inside it
    const navLinks = dropdown.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
    });

    // 3. Close dropdown when clicking anywhere outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // 4. Typing Effect for Hero Section
    const typedText = document.querySelector(".typed-text");
    const phrases = ["Web Developer", "ML Enthusiast", "Problem Solver"];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function type() {
        const currentPhrase = phrases[phraseIdx];
        
        if (isDeleting) {
            typedText.textContent = currentPhrase.substring(0, charIdx--);
        } else {
            typedText.textContent = currentPhrase.substring(0, charIdx++);
        }

        if (!isDeleting && charIdx === currentPhrase.length + 1) {
            isDeleting = true;
            setTimeout(type, 1500); // Pause at end
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            setTimeout(type, 500); // Pause before next word
        } else {
            setTimeout(type, isDeleting ? 100 : 200);
        }
    }

    if(typedText) type();
});
