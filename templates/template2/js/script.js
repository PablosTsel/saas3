document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const body = document.body;
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeMenu = document.querySelector(".close-menu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const header = document.querySelector(".header");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const backToTop = document.querySelector(".back-to-top");
  const skillBars = document.querySelectorAll(".skill-progress");
  const themeToggle = document.querySelector(".theme-toggle");
  const contactForm = document.getElementById("contact-form");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");

  // Check for saved theme preference or use default
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme) {
    body.classList.add(currentTheme);
    if (currentTheme === "dark-theme") {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }

  // Theme Toggle
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-theme");

    if (body.classList.contains("dark-theme")) {
      localStorage.setItem("theme", "dark-theme");
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      localStorage.setItem("theme", "");
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  });

  // Mobile Menu Toggle
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("active");
  });

  closeMenu.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });

  // Close mobile menu when clicking a link
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
  });

  // Sticky Header
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Back to top button visibility
    if (window.scrollY > 500) {
      backToTop.classList.add("active");
    } else {
      backToTop.classList.remove("active");
    }

    // Active section highlighting
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
  });

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

  // Project filtering
  if (filterBtns.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all buttons
        filterBtns.forEach((b) => b.classList.remove("active"));
        // Add active class to clicked button
        btn.classList.add("active");

        const filter = btn.getAttribute("data-filter");

        projectCards.forEach((card) => {
          if (filter === "all" || card.getAttribute("data-category") === filter) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  // Back to top button
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Contact form submission
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // In a real implementation, you would send the form data to a server
      alert("Thank you for your message! This form is not functional in the portfolio demo.");
      contactForm.reset();
    });
  }

  // Animate skill bars on scroll
  const animateSkillBars = () => {
    skillBars.forEach((bar) => {
      const barTop = bar.getBoundingClientRect().top;
      if (barTop < window.innerHeight - 100) {
        const width = bar.style.width || bar.getAttribute("style")?.match(/width: (\d+)%/)?.[1] || "90";
        bar.style.width = "0%";
        setTimeout(() => {
          bar.style.width = width + "%";
        }, 100);
      }
    });
  };

  // Animation for sections
  const animateSections = () => {
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop < window.innerHeight - 100) {
        section.classList.add('active');
      }
    });
  };

  // Initial animation of visible elements
  setTimeout(() => {
    animateSkillBars();
    animateSections();
  }, 300);

  // Animate elements on scroll
  window.addEventListener("scroll", () => {
    animateSkillBars();
    animateSections();
  });

  // Fix any template placeholders that weren't replaced
  const yearElements = document.querySelectorAll('.footer-copyright p');
  yearElements.forEach(element => {
    if (element.textContent.includes('{{currentYear}}')) {
      element.textContent = element.textContent.replace('{{currentYear}}', new Date().getFullYear());
    }
  });
}); 