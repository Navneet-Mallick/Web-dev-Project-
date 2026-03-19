// ================= DOM READY =================
// Hide loader after page load
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500); // wait for fade out
});
document.addEventListener("DOMContentLoaded", () => {
// Force hide loader after 3 seconds
setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 500);
}, 3000);
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

window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    // fade out loader after 1 second max
    setTimeout(() => {
      loader.style.opacity = 0;
      loader.style.pointerEvents = 'none';
      loader.style.transition = 'opacity 0.5s ease';
      loader.style.display = 'none';
    }, 500); // 0.5s delay
  }
});
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
// ===== LOADER =====
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  loader.style.opacity = "0";

  setTimeout(() => {
    loader.style.display = "none";
  }, 500);
});


// ===== SCROLL REVEAL =====
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const windowHeight = window.innerHeight;

  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;

    if (top < windowHeight - 100) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();


// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;

    if (pageYOffset >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");

    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});
