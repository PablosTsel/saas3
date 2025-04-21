document.addEventListener("DOMContentLoaded", () => {
  // Initialize the animated background
  initAnimatedBackground();
  
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
    
    // Update animation colors when theme changes
    updateAnimationColors();
  });

  // Floating geometric shapes background animation
  function initAnimatedBackground() {
    const canvas = document.getElementById("animated-background");
    const ctx = canvas.getContext("2d");
    
    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Array to store all shapes
    const shapes = [];
    
    // Shape types: circle, triangle, square, and pentagon
    const shapeTypes = ["circle", "triangle", "square", "pentagon"];
    
    // Get theme-based colors
    function getColors() {
      const isDarkTheme = document.body.getAttribute("data-theme") === "dark";
      
      return {
        primary: isDarkTheme ? "#6c63ff" : "#6c63ff",
        secondary: isDarkTheme ? "#8a84ff" : "#5a54d4",
        accent: isDarkTheme ? "#ff6584" : "#ff6584",
        background: isDarkTheme ? "#121212" : "#ffffff"
      };
    }
    
    // Create shape objects
    function createShapes(count) {
      const colors = getColors();
      
      for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 20 + 10; // 10-30px
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        // Generate random color from our palette
        const colorKeys = Object.keys(colors).filter(key => key !== "background");
        const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        const color = colors[colorKey];
        
        // Random transparency
        const alpha = Math.random() * 0.15 + 0.05; // 0.05-0.20
        
        // Random speed and direction
        const speedX = (Math.random() - 0.5) * 0.5;
        const speedY = (Math.random() - 0.5) * 0.5;
        
        // Random rotation
        const rotation = Math.random() * Math.PI * 2;
        const rotationSpeed = (Math.random() - 0.5) * 0.02;
        
        shapes.push({
          x, y, size, type, color, alpha, speedX, speedY, rotation, rotationSpeed
        });
      }
    }
    
    // Draw a shape based on its type
    function drawShape(shape) {
      const { x, y, size, type, color, alpha, rotation } = shape;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      
      switch (type) {
        case "circle":
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size * 0.866, size * 0.5); // 60° angles
          ctx.lineTo(-size * 0.866, size * 0.5);
          ctx.closePath();
          ctx.fill();
          break;
          
        case "square":
          ctx.fillRect(-size / 2, -size / 2, size, size);
          break;
          
        case "pentagon":
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const pointX = Math.cos(angle) * size;
            const pointY = Math.sin(angle) * size;
            if (i === 0) {
              ctx.moveTo(pointX, pointY);
            } else {
              ctx.lineTo(pointX, pointY);
            }
          }
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    }
    
    // Update shape positions and rotations
    function updateShapes() {
      shapes.forEach(shape => {
        // Update position
        shape.x += shape.speedX;
        shape.y += shape.speedY;
        
        // Update rotation
        shape.rotation += shape.rotationSpeed;
        
        // Wrap around screen edges
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size;
      });
    }
    
    // Draw all shapes
    function drawShapes() {
      const colors = getColors();
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      shapes.forEach(drawShape);
    }
    
    // Animation loop
    function animate() {
      updateShapes();
      drawShapes();
      requestAnimationFrame(animate);
    }
    
    // Update colors when theme changes
    function updateAnimationColors() {
      const colors = getColors();
      shapes.forEach(shape => {
        const colorKeys = Object.keys(colors).filter(key => key !== "background");
        const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        shape.color = colors[colorKey];
      });
    }
    
    // Handle window resize
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    
    // Make updateAnimationColors function available globally
    window.updateAnimationColors = updateAnimationColors;
    
    // Create initial shapes
    createShapes(50); // 50 shapes
    
    // Start animation
    animate();
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
  
  // Add fade-in animation to elements
  const fadeInElements = document.querySelectorAll('.project-card, .skill-tag, .contact-card');
  
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  fadeInElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    fadeInObserver.observe(element);
  });

  // Initialize skills animation
  initSkillsScroll();

  function initSkillsScroll() {
    const skillsContainer = document.querySelector('.skills-container');
    if (!skillsContainer) return;
    
    // Clone the skills for continuous scrolling
    const skillTags = skillsContainer.querySelectorAll('.skill-tag');
    if (skillTags.length > 0) {
      // Create clones to ensure continuous flow
      skillTags.forEach(tag => {
        const clone = tag.cloneNode(true);
        skillsContainer.appendChild(clone);
      });
    }
  }
}); 