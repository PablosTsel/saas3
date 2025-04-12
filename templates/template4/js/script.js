document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const body = document.body;
  const themeToggle = document.querySelector(".theme-toggle");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeMenu = document.querySelector(".close-menu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");
  const header = document.querySelector("header");
  const backToTop = document.querySelector(".back-to-top");
  const skillTags = document.querySelectorAll(".skill-tag");
  const contactForm = document.getElementById("contactForm");
  const cyberGlitch = document.querySelectorAll(".cyber-glitch");
  const cyberButtons = document.querySelectorAll(".cyber-button");
  const heroText = document.querySelector(".hero-title");
  const neonTexts = document.querySelectorAll(".neon-text");

  // Check for saved theme preference or use default
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme) {
    body.classList.remove("dark-mode");
    body.classList.add(currentTheme);
    if (currentTheme === "light-mode") {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }

  // Theme Toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      body.classList.toggle("light-mode");

      if (body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light-mode");
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      } else {
        localStorage.setItem("theme", "dark-mode");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      }
    });
  }

  // Mobile Menu Toggle
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.add("active");
    });
  }

  if (closeMenu && mobileMenu) {
    closeMenu.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
  }

  // Close mobile menu when clicking a link
  if (mobileNavLinks.length && mobileMenu) {
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
      });
    });
  }

  // Sticky Header
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      // Back to top button visibility
      if (backToTop) {
        if (window.scrollY > 500) {
          backToTop.classList.add("active");
        } else {
          backToTop.classList.remove("active");
        }
      }

      // Active section highlighting
      if (navLinks.length && sections.length) {
        let current = "";
        sections.forEach((section) => {
          const sectionTop = section.offsetTop - 100;
          const sectionHeight = section.offsetHeight;
          if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute("id");
          }
        });

        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href").substring(1) === current) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });

  // Back to top button
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // Contact form submission
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // In a real implementation, you would send the form data to a server
      alert("Thank you for your message! This form is not functional in the portfolio demo.");
      contactForm.reset();
    });
  }

  // Cyberpunk glitch effect on hover
  if (cyberGlitch.length) {
    cyberGlitch.forEach(element => {
      const originalText = element.textContent;
      
      element.addEventListener('mouseenter', () => {
        element.style.animation = 'none';
        setTimeout(() => {
          element.style.animation = 'glitch 1s infinite';
        }, 50);
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.animation = 'none';
      });
    });
  }

  // Typing effect for hero title
  if (heroText) {
    const text = heroText.textContent;
    heroText.textContent = '';
    let i = 0;
    
    function typeWriter() {
      if (i < text.length) {
        heroText.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, Math.random() * 150 + 50);
      }
    }
    
    setTimeout(typeWriter, 500);
  }

  // Flickering neon text effect
  if (neonTexts.length) {
    neonTexts.forEach(text => {
      setInterval(() => {
        const r = Math.floor(Math.random() * 100);
        if (r < 10) {
          text.style.opacity = 0.8;
          setTimeout(() => {
            text.style.opacity = 1;
          }, 100);
        }
      }, 1000);
    });
  }

  // Project filter functionality
  const filterButtons = document.querySelectorAll('.filter-button');
  const projects = document.querySelectorAll('.project-card-t4');
  
  if (filterButtons.length && projects.length) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        
        projects.forEach(project => {
          if (filter === 'all' || project.classList.contains(filter)) {
            project.style.display = 'block';
          } else {
            project.style.display = 'none';
          }
        });
      });
    });
  }

  // Animate elements on scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementPosition < windowHeight - 50) {
        element.classList.add('animated');
      }
    });
  };

  // Initial animation
  setTimeout(() => {
    animateOnScroll();
  }, 300);

  // Animate on scroll
  window.addEventListener('scroll', animateOnScroll);
  
  // Fix any template placeholders that weren't replaced
  const yearElements = document.querySelectorAll('.currentYear');
  yearElements.forEach(element => {
    if (element && element.textContent.includes('{{currentYear}}')) {
      element.textContent = element.textContent.replace('{{currentYear}}', new Date().getFullYear());
    }
  });
}); 