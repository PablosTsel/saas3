document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const body = document.body;
  const themeToggle = document.querySelector(".theme-toggle");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeMenu = document.querySelector(".close-menu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");
  const header = document.querySelector(".header");
  const backToTop = document.querySelector(".back-to-top");
  const filterButtons = document.querySelectorAll(".filter-button");
  const projectCards = document.querySelectorAll(".project-card");
  const skillLevels = document.querySelectorAll(".skill-level");
  const contactForm = document.getElementById("contactForm");
  const cursor = document.querySelector(".cursor");
  const cursorFollower = document.querySelector(".cursor-follower");

  // Custom cursor
  if (cursor && cursorFollower) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
      
      // Add a slight delay to the follower for a nice effect
      setTimeout(() => {
        cursorFollower.style.left = e.clientX + "px";
        cursorFollower.style.top = e.clientY + "px";
      }, 100);
    });
    
    // Change cursor size when hovering over clickable elements
    const hoverElements = document.querySelectorAll("a, button, input[type='submit'], .filter-button");
    hoverElements.forEach(element => {
      element.addEventListener("mouseenter", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(0.5)";
        cursorFollower.style.transform = "translate(-50%, -50%) scale(1.5)";
      });
      
      element.addEventListener("mouseleave", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
        cursorFollower.style.transform = "translate(-50%, -50%) scale(1)";
      });
    });
    
    // Hide cursor when leaving the window
    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
      cursorFollower.style.opacity = "0";
    });
    
    document.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
      cursorFollower.style.opacity = "1";
    });
  }

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
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }

  // Back to Top Button
  if (backToTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) {
        backToTop.classList.add("active");
      } else {
        backToTop.classList.remove("active");
      }
    });

    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Active section highlighting
  window.addEventListener("scroll", () => {
    let current = "";
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute("id");
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // Project filtering
  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => {
          btn.classList.remove("active");
        });
        
        // Add active class to clicked button
        button.classList.add("active");
        
        const filter = button.getAttribute("data-filter");
        
        // Filter projects
        projectCards.forEach(card => {
          if (filter === "all" || card.classList.contains(filter)) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  // Animate skill levels on scroll
  const animateSkillLevels = () => {
    skillLevels.forEach(level => {
      const levelPosition = level.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;
      
      if (levelPosition < screenPosition) {
        const width = level.getAttribute("data-level");
        
        level.style.width = "0";
        setTimeout(() => {
          level.style.width = width;
        }, 100);
      }
    });
  };

  // Contact form submission
  if (contactForm) {
    contactForm.addEventListener("submit", e => {
      e.preventDefault();
      alert("Thank you for your message! This form is not functional in the portfolio demo.");
      contactForm.reset();
    });
  }

  // Animate elements on scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".animate-on-scroll");
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;
      
      if (elementPosition < screenPosition) {
        element.classList.add("animate");
      }
    });
  };

  // Initial animations
  setTimeout(() => {
    animateSkillLevels();
    animateOnScroll();
  }, 300);

  // Animations on scroll
  window.addEventListener("scroll", () => {
    animateSkillLevels();
    animateOnScroll();
  });

  // Fix for {{currentYear}} if it wasn't replaced by the server
  const yearElements = document.querySelectorAll('.currentYear');
  yearElements.forEach(element => {
    if (element && element.textContent.includes('{{currentYear}}')) {
      element.textContent = element.textContent.replace('{{currentYear}}', new Date().getFullYear());
    }
  });
}); 