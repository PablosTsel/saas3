// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme
  initTheme();
  
  // Initialize cursor effect
  initCursor();
  
  // Initialize canvas background
  initGradientCanvas();
  
  // Handle scroll events
  initScroll();
  
  // Handle skill animations
  initSkillBars();
  
  // Initialize TypeWriter effect 
  initTypeWriter();
  
  // Initialize project filter
  initProjectFilter();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize form validation
  initFormValidation();
});

// Theme Toggle
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme') || 'dark';
  
  // Set initial theme
  document.body.setAttribute('data-theme', storedTheme);
  
  // Handle theme toggle click
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
}

// Custom Cursor
function initCursor() {
  const cursor = document.querySelector('.cursor');
  const cursorFollower = document.querySelector('.cursor-follower');
  
  if (!cursor || !cursorFollower) return;
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Add a slight delay to follower for effect
    setTimeout(() => {
      cursorFollower.style.left = e.clientX + 'px';
      cursorFollower.style.top = e.clientY + 'px';
    }, 50);
  });
  
  // Handle hover effects
  const links = document.querySelectorAll('a, button, .btn, .filter-btn, .project-card');
  
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursor.style.backgroundColor = 'transparent';
      cursor.style.border = '2px solid var(--accent-color)';
      cursorFollower.style.width = '40px';
      cursorFollower.style.height = '40px';
    });
    
    link.addEventListener('mouseleave', () => {
      cursor.style.width = '10px';
      cursor.style.height = '10px';
      cursor.style.backgroundColor = 'var(--accent-color)';
      cursor.style.border = 'none';
      cursorFollower.style.width = '30px';
      cursorFollower.style.height = '30px';
    });
  });
  
  // Hide default cursor
  document.body.style.cursor = 'none';
  
  // Handle cursor on touch devices
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  
  if (isTouchDevice) {
    cursor.style.display = 'none';
    cursorFollower.style.display = 'none';
    document.body.style.cursor = 'auto';
  }
}

// Gradient Canvas Background
function initGradientCanvas() {
  const canvas = document.getElementById('gradient-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  
  // Set canvas size
  canvas.width = width;
  canvas.height = height;
  
  // Colors for gradient
  const colors = [
    { r: 66, g: 95, b: 235 },  // blue
    { r: 114, g: 9, b: 183 },  // purple
    { r: 76, g: 201, b: 240 }, // light blue
    { r: 67, g: 97, b: 238 }   // royal blue
  ];
  
  // Gradient points
  const points = [];
  const pointsCount = 5;
  const maxRadius = Math.sqrt(width * width + height * height) / 2;
  
  // Initialize points
  for (let i = 0; i < pointsCount; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  
  // Animation
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw gradient
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x += 5) {
        // Calculate influence of each point
        let totalInfluence = 0;
        let r = 0, g = 0, b = 0;
        
        for (const point of points) {
          const dx = x - point.x;
          const dy = y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate influence (inverse of distance)
          const influence = Math.max(0, 1 - distance / maxRadius);
          totalInfluence += influence;
          
          // Add color contribution
          r += point.color.r * influence;
          g += point.color.g * influence;
          b += point.color.b * influence;
        }
        
        // Normalize colors
        if (totalInfluence > 0) {
          r /= totalInfluence;
          g /= totalInfluence;
          b /= totalInfluence;
        }
        
        // Set pixel color
        ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        ctx.fillRect(x, y, 5, 1);
      }
    }
    
    // Move points
    for (const point of points) {
      point.x += point.vx;
      point.y += point.vy;
      
      // Bounce off edges
      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;
    }
    
    requestAnimationFrame(animate);
  }
  
  // Handle resize
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });
  
  // Start animation
  animate();
}

// Scroll Effects
function initScroll() {
  const header = document.querySelector('header');
  
  // Handle header style on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  // Smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Add active class to menu items
        document.querySelectorAll('.menu a').forEach(menuLink => {
          menuLink.classList.remove('active');
        });
        link.classList.add('active');
        
        // Scroll to target
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Highlight menu item based on scroll position
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        document.querySelector(`.menu a[href="#${sectionId}"]`)?.classList.add('active');
      } else {
        document.querySelector(`.menu a[href="#${sectionId}"]`)?.classList.remove('active');
      }
    });
  });
  
  // Scroll reveal animation
  const revealElements = document.querySelectorAll('.reveal-text');
  
  const revealOnScroll = () => {
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight - 100) {
        element.style.animation = 'revealText 0.5s forwards';
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Initial check
}

// Animate skill bars on scroll
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-level');
  const percentageSpans = document.querySelectorAll('.skill-percentage');
  
  // Remove any percentage spans that might exist
  percentageSpans.forEach(span => {
    if (span && span.parentNode) {
      span.parentNode.removeChild(span);
    }
  });
  
  // Remove any text content or children from skill bars
  skillBars.forEach(bar => {
    // Clear any text content
    bar.textContent = '';
    
    // Remove any child elements
    while (bar.firstChild) {
      bar.removeChild(bar.firstChild);
    }
    
    // Make sure there's no text or HTML inside
    bar.innerHTML = '';
  });
  
  const animateSkills = () => {
    skillBars.forEach(bar => {
      const barTop = bar.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (barTop < windowHeight - 50) {
        // Use fixed width (90%) instead of data-level
        bar.style.width = '90%';
        
        // Ensure no text is added during animation
        bar.textContent = '';
      }
    });
  };
  
  window.addEventListener('scroll', animateSkills);
  // Initial call for visible skills
  setTimeout(animateSkills, 500);
}

// Typewriter effect
function initTypeWriter() {
  const typingElement = document.querySelector('.changing-title');
  if (!typingElement) return;
  
  const titles = JSON.parse(typingElement.getAttribute('data-titles') || '[]');
  if (titles.length === 0) return;
  
  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  function type() {
    const currentTitle = titles[titleIndex];
    
    if (isDeleting) {
      // Deleting text
      typingElement.textContent = currentTitle.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
      
      if (charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        typingSpeed = 500; // Pause before typing next title
      }
    } else {
      // Typing text
      typingElement.textContent = currentTitle.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
      
      if (charIndex === currentTitle.length) {
        isDeleting = true;
        typingSpeed = 1000; // Pause before deleting
      }
    }
    
    setTimeout(type, typingSpeed);
  }
  
  // Start typing effect
  setTimeout(type, 1000);
}

// Project filtering
function initProjectFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (filterButtons.length === 0 || projectCards.length === 0) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Set active class
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const filterValue = button.getAttribute('data-filter');
      
      // Filter projects
      projectCards.forEach(card => {
        if (filterValue === 'all') {
          card.style.display = 'flex';
        } else {
          const category = card.getAttribute('data-category');
          if (category && category.includes(filterValue)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        }
      });
    });
  });
}

// Mobile Menu
function initMobileMenu() {
  const menuButton = document.querySelector('.menu-button');
  const menu = document.querySelector('.menu');
  
  if (!menuButton || !menu) return;
  
  menuButton.addEventListener('click', () => {
    menuButton.classList.toggle('active');
    menu.classList.toggle('active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !menuButton.contains(e.target) && menu.classList.contains('active')) {
      menu.classList.remove('active');
      menuButton.classList.remove('active');
    }
  });
  
  // Close menu when clicking on menu links
  document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      menuButton.classList.remove('active');
    });
  });
}

// Form validation
function initFormValidation() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form inputs
    const nameInput = contactForm.querySelector('input[name="name"]');
    const emailInput = contactForm.querySelector('input[name="email"]');
    const messageInput = contactForm.querySelector('textarea[name="message"]');
    
    let isValid = true;
    
    // Simple validation
    if (!nameInput.value.trim()) {
      showError(nameInput, 'Please enter your name');
      isValid = false;
    } else {
      clearError(nameInput);
    }
    
    if (!emailInput.value.trim()) {
      showError(emailInput, 'Please enter your email');
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, 'Please enter a valid email');
      isValid = false;
    } else {
      clearError(emailInput);
    }
    
    if (!messageInput.value.trim()) {
      showError(messageInput, 'Please enter your message');
      isValid = false;
    } else {
      clearError(messageInput);
    }
    
    // If form is valid, submit it
    if (isValid) {
      // In a real application, you would send the form data to a server
      // For demo purposes, just show a success message
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      
      // Simulate sending
      setTimeout(() => {
        submitButton.textContent = 'Message Sent!';
        contactForm.reset();
        
        // Reset button after 3 seconds
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }, 3000);
      }, 1500);
    }
  });
  
  // Helper functions
  function showError(input, message) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message') || document.createElement('div');
    
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.85rem';
    errorElement.style.marginTop = '0.5rem';
    
    if (!formGroup.querySelector('.error-message')) {
      formGroup.appendChild(errorElement);
    }
    
    input.style.borderColor = '#e74c3c';
  }
  
  function clearError(input) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    if (errorElement) {
      formGroup.removeChild(errorElement);
    }
    
    input.style.borderColor = '';
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 