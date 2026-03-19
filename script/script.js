// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {

  // ================= DROPDOWN MENU =================
  const hamburger = document.getElementById("hamburger-btn");
  const dropdown = document.getElementById("nav-dropdown");

  if (hamburger && dropdown) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });

    // Close when clicking link
    dropdown.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        dropdown.classList.remove("active");
      });
    });
  }


  // ================= TYPING EFFECT =================
  const typedText = document.querySelector(".typed-text");

  if (typedText) {
    const phrases = ["Web Developer", "Machine Learning Enthusiast", "Problem Solver"];
    let i = 0, j = 0, isDeleting = false;

    function typeEffect() {
      const current = phrases[i];

      if (!isDeleting) {
        typedText.textContent = current.substring(0, j++);
        if (j > current.length) {
          isDeleting = true;
          setTimeout(typeEffect, 1000);
          return;
        }
      } else {
        typedText.textContent = current.substring(0, j--);
        if (j < 0) {
          isDeleting = false;
          i = (i + 1) % phrases.length;
        }
      }

      setTimeout(typeEffect, isDeleting ? 80 : 120);
    }

    typeEffect();
  }


  // ================= THEME TOGGLE =================
  const toggle = document.querySelector(".theme-toggle");
  const icon = toggle ? toggle.querySelector("i") : null;

  if (toggle && icon) {
    // Load saved theme
    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light-mode");
      icon.classList.replace("fa-moon", "fa-sun");
    }

    toggle.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");

      if (document.body.classList.contains("light-mode")) {
        icon.classList.replace("fa-moon", "fa-sun");
        localStorage.setItem("theme", "light");
      } else {
        icon.classList.replace("fa-sun", "fa-moon");
        localStorage.setItem("theme", "dark");
      }
    });
  }


  // ================= EMAILJS =================
  const form = document.querySelector(".contact-form");

  if (form && typeof emailjs !== "undefined") {
    emailjs.init(CONFIG.PUBLIC_KEY);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const templateParams = {
        name: this.name.value,
        email: this.email.value,
        message: this.message.value,
        time: new Date().toLocaleString()
      };

      emailjs.send(CONFIG.SERVICE_ID, CONFIG.TEMPLATE_ID, templateParams)
        .then(() => {
          alert("Message sent successfully!");
          form.reset();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to send message.");
        });
    });
  }

});
