// TYPING EFFECT
const typedText = document.querySelector(".typed-text");
const phrases = ["Web Developer", "Machine Learning Enthusiast", "Problem Solver"];
let i=0,j=0,current="",isDeleting=false,speed=150;
function typeEffect(){
  const fullText=phrases[i];
  if(!isDeleting){current=fullText.slice(0,j+1);typedText.textContent=current;j++;
    if(j===fullText.length){isDeleting=true;speed=1000;}else{speed=150;}
  }else{current=fullText.slice(0,j-1);typedText.textContent=current;j--;
    if(j===0){isDeleting=false;i=(i+1)%phrases.length;speed=500;}else{speed=100;}
  }
  setTimeout(typeEffect,speed);
}
typeEffect();

// THEME TOGGLE
const toggle=document.querySelector(".theme-toggle");
const icon=toggle.querySelector("i");
if(localStorage.getItem("theme")==="light"){document.body.classList.add("light-mode");icon.classList.replace("fa-moon","fa-sun");}
toggle.addEventListener("click",()=>{
  document.body.classList.toggle("light-mode");
  if(document.body.classList.contains("light-mode")){icon.classList.replace("fa-moon","fa-sun");localStorage.setItem("theme","light");}
  else{icon.classList.replace("fa-sun","fa-moon");localStorage.setItem("theme","dark");}
});

// HAMBURGER / DROPDOWN
const hamburger=document.querySelector(".hamburger");
const dropdownMenu=document.querySelector(".dropdown-menu");
hamburger.addEventListener("click",()=>{dropdownMenu.classList.toggle("active");});
document.addEventListener("click",(e)=>{if(!hamburger.contains(e.target)&&!dropdownMenu.contains(e.target)){dropdownMenu.classList.remove("active");}});

// SCROLL REVEAL
const scrollElements=document.querySelectorAll(".reveal");
function revealOnScroll(){
  const windowHeight=window.innerHeight;
  scrollElements.forEach(el=>{
    const elementTop=el.getBoundingClientRect().top;
    if(elementTop<windowHeight-100){el.classList.add("active");}
  });
}
window.addEventListener("scroll",revealOnScroll);
revealOnScroll();