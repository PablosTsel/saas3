document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle functionality
  const themeToggleBtn = document.getElementById("theme-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Set initial theme based on user preference or system preference
  if (localStorage.getItem("theme")) {
    document.body.setAttribute("data-theme", localStorage.getItem("theme"));
  } else if (prefersDarkScheme.matches) {
    document.body.setAttribute("data-theme", "dark");
  } else {
    document.body.setAttribute("data-theme", "light");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";

      document.body.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    });
  }

  // Setup typing animation
  setupTypingAnimation();

  // Mobile navigation toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    // Close mobile nav when clicking on a link
    document.querySelectorAll(".nav-links a").forEach(link => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70, // Adjust for fixed navbar
          behavior: 'smooth'
        });
      }
    });
  });

  // Initialize particles.js if available
  if (typeof particlesJS !== "undefined" && document.getElementById("particles-js")) {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#4169e1",
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#4169e1",
          opacity: 0.2,
          width: 1,
        },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1,
            },
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
    });
  }

  // Update copyright year
  const currentYearElement = document.querySelector(".current-year");
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
});

// Typing Animation
function setupTypingAnimation() {
  const typedTextSpan = document.querySelector('.typed-text');
  const cursorSpan = document.querySelector('.cursor');
  
  // If the title element doesn't exist, exit
  if (!typedTextSpan || !cursorSpan) return;
  
  // Get the title from the window variable, title tag, or fallback
  const roleTitle = window.portfolioTitle || 
                   document.querySelector('title').textContent.split('|')[1]?.trim() || 
                   '{{title}}';
  
  const textArray = [roleTitle];
  const typingDelay = 100;
  const erasingDelay = 100;
  const newTextDelay = 2000;
  let textArrayIndex = 0;
  let charIndex = 0;
  
  function type() {
    if (charIndex < textArray[textArrayIndex].length) {
      if (!cursorSpan.classList.contains('typing')) {
        cursorSpan.classList.add('typing');
      }
      typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, typingDelay);
    } else {
      cursorSpan.classList.remove('typing');
      setTimeout(erase, newTextDelay);
    }
  }
  
  function erase() {
    if (charIndex > 0) {
      if (!cursorSpan.classList.contains('typing')) {
        cursorSpan.classList.add('typing');
      }
      typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, erasingDelay);
    } else {
      cursorSpan.classList.remove('typing');
      textArrayIndex++;
      if (textArrayIndex >= textArray.length) textArrayIndex = 0;
      setTimeout(type, typingDelay + 1100);
    }
  }
  
  // Start the typing animation
  if (textArray.length) setTimeout(type, newTextDelay + 250);
} 