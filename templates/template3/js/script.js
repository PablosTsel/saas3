document.addEventListener("DOMContentLoaded", () => {
  // Initialize Matrix Canvas
  const canvas = document.getElementById("matrixCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Characters to be used in the matrix
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Array to track the y position of each column
    const drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    // Matrix rain drawing function
    function drawMatrix() {
      // Semi-transparent black to create trail effect
      ctx.fillStyle = "rgba(10, 25, 47, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text color and font
      ctx.fillStyle = "#00ff00";
      ctx.font = `${fontSize}px monospace`;

      // Loop through each drop
      for (let i = 0; i < drops.length; i++) {
        // Get random character
        const text = chars[Math.floor(Math.random() * chars.length)];

        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top with random reset after it has crossed the screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Increment y coordinate
        drops[i]++;
      }
    }

    // Set interval for matrix animation
    const matrixInterval = setInterval(drawMatrix, 50);

    // Resize canvas when window is resized
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // DOM Elements
  const body = document.body;
  const themeToggle = document.querySelector(".theme-toggle");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeMenu = document.querySelector(".close-menu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");
  const header = document.querySelector(".terminal-header");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const backToTop = document.querySelector(".back-to-top");
  const skillBars = document.querySelectorAll(".skill-progress");
  const contactForm = document.getElementById("contactForm");

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

  // Project filtering
  if (filterBtns.length && projectCards.length) {
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

  // Initialize code highlighting
  if (typeof hljs !== "undefined") {
    hljs.highlightAll();
  }

  // Typing animation for hero section
  const typedText = document.querySelector(".typed-text");
  if (typedText) {
    const text = typedText.textContent;
    typedText.textContent = "";
    let i = 0;

    function typeWriter() {
      if (i < text.length) {
        typedText.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      }
    }

    setTimeout(typeWriter, 1000);
  }

  // Animate skill bars on scroll
  const animateSkillBars = () => {
    if (skillBars.length) {
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
    }
  };

  // Initial animation of visible elements
  setTimeout(() => {
    animateSkillBars();
  }, 300);

  // Animate elements on scroll
  window.addEventListener("scroll", () => {
    animateSkillBars();
  });

  // Fix any template placeholders that weren't replaced
  const yearElements = document.querySelectorAll('.footer-text');
  yearElements.forEach(element => {
    if (element && element.textContent.includes('{{currentYear}}')) {
      element.textContent = element.textContent.replace('{{currentYear}}', new Date().getFullYear());
    }
  });
}); 