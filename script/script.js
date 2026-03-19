<script>
document.addEventListener("DOMContentLoaded", () => {

  // ===== MOBILE MENU =====
  const hamburger = document.getElementById("hamburger-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const closeBtn = document.getElementById("close-menu");

  hamburger.addEventListener("click", () => {
    mobileMenu.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });

  document.querySelectorAll(".mobile-menu a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
  });


  // ===== TYPING EFFECT =====
  const typedText = document.querySelector(".typed-text");
  const phrases = ["Web Developer", "ML Enthusiast", "Problem Solver"];

  let i = 0, j = 0, isDeleting = false;

  function typeEffect() {
    const text = phrases[i];

    if (!isDeleting) {
      typedText.textContent = text.substring(0, j++);
      if (j > text.length) {
        isDeleting = true;
        setTimeout(typeEffect, 1000);
        return;
      }
    } else {
      typedText.textContent = text.substring(0, j--);
      if (j < 0) {
        isDeleting = false;
        i = (i + 1) % phrases.length;
      }
    }

    setTimeout(typeEffect, isDeleting ? 80 : 120);
  }

  if (typedText) typeEffect();


  // ===== THEME TOGGLE =====
  const toggle = document.querySelector(".theme-toggle");
  const icon = toggle.querySelector("i");

  if(localStorage.getItem("theme") === "light"){
    document.body.classList.add("light-mode");
    icon.classList.replace("fa-moon","fa-sun");
  }

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    if(document.body.classList.contains("light-mode")){
      icon.classList.replace("fa-moon","fa-sun");
      localStorage.setItem("theme","light");
    } else {
      icon.classList.replace("fa-sun","fa-moon");
      localStorage.setItem("theme","dark");
    }
  });


  // ===== EMAILJS =====
  emailjs.init(CONFIG.PUBLIC_KEY);

  const form = document.querySelector(".contact-form");

  if(form){
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const data = {
        name: this.name.value,
        email: this.email.value,
        message: this.message.value,
        time: new Date().toLocaleString()
      };

      emailjs.send(CONFIG.SERVICE_ID, CONFIG.TEMPLATE_ID, data)
        .then(() => {
          alert("Message sent successfully!");
          form.reset();
        })
        .catch(() => {
          alert("Failed to send message.");
        });
    });
  }

});
</script>















// const typedText = document.querySelector(".typed-text");
// const phrases = ["Web Developer", "Machine Learning Enthusiast", "Problem Solver"];
// let i = 0; // phrase index
// let j = 0; // letter index
// let current = "";
// let isDeleting = false;
// let speed = 150; // typing speed

// function typeEffect() {
//   const fullText = phrases[i];

//   if (!isDeleting) {
//     current = fullText.slice(0, j + 1);
//     typedText.textContent = current;
//     j++;
//     if (j === fullText.length) {
//       isDeleting = true;
//       speed = 1000; // pause at full word
//     } else {
//       speed = 150;
//     }
//   } else {
//     current = fullText.slice(0, j - 1);
//     typedText.textContent = current;
//     j--;
//     if (j === 0) {
//       isDeleting = false;
//       i = (i + 1) % phrases.length; // next phrase
//       speed = 500; // pause before typing next word
//     } else {
//       speed = 100;
//     }
//   }

//   setTimeout(typeEffect, speed);
// }
// const toggle = document.querySelector(".theme-toggle");
// const icon = toggle.querySelector("i");

// if(localStorage.getItem("theme") === "light"){
//   document.body.classList.add("light-mode");
//   icon.classList.replace("fa-moon","fa-sun");
// }

// toggle.addEventListener("click", () => {
//   document.body.classList.toggle("light-mode");

//   if(document.body.classList.contains("light-mode")){
//     icon.classList.replace("fa-moon","fa-sun");
//     localStorage.setItem("theme","light");
//   }else{
//     icon.classList.replace("fa-sun","fa-moon");
//     localStorage.setItem("theme","dark");
//   }
// });

// // });
// // start typing
// typeEffect();
// // --- EMAILJS ---
// emailjs.init(CONFIG.PUBLIC_KEY);

// const contactForm = document.querySelector(".contact-form");

// contactForm.addEventListener("submit", function(e) {
//   e.preventDefault();

//   const templateParams = {
//     name: this.name.value,
//     email: this.email.value,
//     message: this.message.value,
//     time: new Date().toLocaleString()
//   };

//   emailjs.send(CONFIG.SERVICE_ID, CONFIG.TEMPLATE_ID, templateParams)
//     .then(() => {
//       alert("Message sent successfully!");
//       contactForm.reset();
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//       alert("Failed to send message.");
//     });
// });
// // Get the elements
// document.addEventListener('DOMContentLoaded', () => {
//     const hamburger = document.querySelector('.hamburger');
//     const dropdown = document.querySelector('.dropdown-menu');

//     if (hamburger && dropdown) {
//         hamburger.addEventListener('click', (e) => {
//             e.stopPropagation(); // Prevents the click from closing the menu immediately
//             dropdown.classList.toggle('active');
//             console.log("Menu Toggled. Current classes:", dropdown.className); // Debugging line
//         });

//         // Close menu when clicking anywhere else
//         document.addEventListener('click', (e) => {
//             if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
//                 dropdown.classList.remove('active');
//             }
//         });
//     } else {
//         console.error("Hamburger or Dropdown not found in HTML!");
//     }
// });

// // document.addEventListener('DOMContentLoaded', () => {
// //     const hamburger = document.getElementById('hamburger-btn');
// //     const dropdown = document.getElementById('nav-dropdown');

// //     // 1. Toggle Dropdown on Click
// //     hamburger.addEventListener('click', (e) => {
// //         e.stopPropagation();
// //         dropdown.classList.toggle('active');
// //     });

// //     // 2. Close dropdown when clicking any link inside it
// //     const navLinks = dropdown.querySelectorAll('a');
// //     navLinks.forEach(link => {
// //         link.addEventListener('click', () => {
// //             dropdown.classList.remove('active');
// //         });
// //     });

// //     // 3. Close dropdown when clicking anywhere outside
// //     document.addEventListener('click', (e) => {
// //         if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
// //             dropdown.classList.remove('active');
// //         }
// //     });
// document.addEventListener('DOMContentLoaded', () => {
//     const hamburger = document.getElementById('hamburger-btn');
//     const dropdown = document.getElementById('nav-dropdown');

//     // 1. Toggle Menu
//     hamburger.addEventListener('click', (e) => {
//         e.stopPropagation(); // Prevents click from bubbling to document
//         dropdown.classList.toggle('active');
//     });

//     // 2. Close Menu when clicking any link inside
//     const menuLinks = dropdown.querySelectorAll('a');
//     menuLinks.forEach(link => {
//         link.addEventListener('click', () => {
//             dropdown.classList.remove('active');
//         });
//     });

//     // 3. Close Menu when clicking anywhere else on the screen
//     document.addEventListener('click', (e) => {
//         if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
//             dropdown.classList.remove('active');
//         }
//     });

//     // --- Keep your Theme Toggle and Typing Effect below this ---
// });

//     // 4. Typing Effect for Hero Section
//     const typedText = document.querySelector(".typed-text");
//     const phrases = ["Web Developer", "ML Enthusiast", "Problem Solver"];
//     let phraseIdx = 0;
//     let charIdx = 0;
//     let isDeleting = false;

//     function type() {
//         const currentPhrase = phrases[phraseIdx];
        
//         if (isDeleting) {
//             typedText.textContent = currentPhrase.substring(0, charIdx--);
//         } else {
//             typedText.textContent = currentPhrase.substring(0, charIdx++);
//         }

//         if (!isDeleting && charIdx === currentPhrase.length + 1) {
//             isDeleting = true;
//             setTimeout(type, 1500); // Pause at end
//         } else if (isDeleting && charIdx === 0) {
//             isDeleting = false;
//             phraseIdx = (phraseIdx + 1) % phrases.length;
//             setTimeout(type, 500); // Pause before next word
//         } else {
//             setTimeout(type, isDeleting ? 100 : 200);
//         }
//     }

//     if(typedText) type();
// });
