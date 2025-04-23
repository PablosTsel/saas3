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

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Initialize particles.js
  if (typeof particlesJS !== "undefined") {
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

  // Set current year in footer
  const yearElement = document.querySelector('.currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop,
          behavior: 'smooth'
        });
        
        // Update active link
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
      }
    });
  });

  // Highlight active section on scroll
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    document.querySelectorAll('section').forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
    
    // Add active class to Home when at the top
    if (scrollPosition < 100) {
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#home') {
          link.classList.add('active');
        }
      });
    }
  });
  
  // Setup skills animation with duplicated skills for smooth infinite scroll
  setupSkillsAnimation();
});

// Function to duplicate skills for infinite scrolling animation
function setupSkillsAnimation() {
  const skillsContainer = document.querySelector('.skills-container');
  if (!skillsContainer) return;
  
  const skillTags = skillsContainer.querySelectorAll('.skill-tag');
  if (skillTags.length === 0) return;
  
  // Create container for original skills
  const originalSkillsWrapper = document.createElement('div');
  originalSkillsWrapper.className = 'skills-set original';
  originalSkillsWrapper.style.display = 'inline-flex';
  
  // Create container for duplicated skills
  const duplicateSkillsWrapper = document.createElement('div');
  duplicateSkillsWrapper.className = 'skills-set duplicate';
  duplicateSkillsWrapper.style.display = 'inline-flex';
  
  // Move original skill tags to the wrapper
  while (skillsContainer.firstChild) {
    originalSkillsWrapper.appendChild(skillsContainer.firstChild);
  }
  
  // Clone all skill tags for the duplicate set
  skillTags.forEach(tag => {
    const clone = tag.cloneNode(true);
    
    // Add a slight rotation to make it more visually interesting
    const randomRotation = (Math.random() * 4 - 2); // Random value between -2 and 2 degrees
    clone.style.transform = `rotate(${randomRotation}deg)`;
    
    duplicateSkillsWrapper.appendChild(clone);
  });
  
  // Add both wrappers to the skills container
  skillsContainer.appendChild(originalSkillsWrapper);
  skillsContainer.appendChild(duplicateSkillsWrapper);
  
  // Add subtle randomized effects to all skill tags
  document.querySelectorAll('.skill-tag').forEach((tag, index) => {
    // Add subtle rotation to each tag
    const randomRotation = (Math.random() * 4 - 2);
    tag.style.transform = `rotate(${randomRotation}deg)`;
    
    // Add slight delay to hover effects based on position
    tag.style.transitionDelay = `${index * 0.03}s`;
    
    // Vary box shadow slightly
    const shadowOpacity = 0.05 + (Math.random() * 0.1);
    tag.style.boxShadow = `0 4px 8px rgba(0, 0, 0, ${shadowOpacity})`;
  });
  
  // Update the CSS animation to move only the inner skills-set
  skillsContainer.style.animation = 'none';
  
  // Create the scrolling animation for the two skill sets
  const scrollingAnimation = `
    @keyframes scrollSkillsInner {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;
  
  // Add the animation to the page
  const styleElement = document.createElement('style');
  styleElement.textContent = scrollingAnimation;
  document.head.appendChild(styleElement);
  
  // Apply the animation to both wrappers
  originalSkillsWrapper.style.animation = 'scrollSkillsInner 20s linear infinite';
  duplicateSkillsWrapper.style.animation = 'scrollSkillsInner 20s linear infinite';
} 