document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initializeTheme();
  
  // Setup mobile menu
  setupMobileMenu();
  
  // Setup typing animation
  setupTypingAnimation();
  
  // Update copyright year
  updateCurrentYear();
  
  // Setup smooth scrolling
  setupSmoothScrolling();
  
  // Setup scroll-based animations
  setupScrollAnimations();
});

function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme') || 'dark';
  
  // Set initial theme from local storage
  document.documentElement.setAttribute('data-theme', storedTheme);
  themeToggle.checked = storedTheme === 'dark';
  
  // Toggle theme on switch change
  themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add a transition class for smooth color changes
    document.body.classList.add('theme-transition');
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 500);
  });
}

function setupMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');
  
  // Toggle mobile menu
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });
  
  // Close menu when a nav item is clicked
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });
  
  // Highlight active section in navigation
  window.addEventListener('scroll', highlightActiveSection);
}

function highlightActiveSection() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  // Get current scroll position
  let scrollY = window.pageYOffset;
  
  // Check each section to see if it's in view
  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      // Find the corresponding nav link
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

function setupTypingAnimation() {
  const typedTextSpan = document.querySelector('.typed-text');
  const cursorSpan = document.querySelector('.cursor');
  
  // If the title element doesn't exist, exit
  if (!typedTextSpan) return;
  
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

function updateCurrentYear() {
  const yearElement = document.querySelector('.current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function setupSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      const offset = 80; // Adjust for fixed header
      const targetPosition = targetElement.offsetTop - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

function setupScrollAnimations() {
  // Reveal elements on scroll
  const revealElements = () => {
    const elements = document.querySelectorAll('.section-title, .project-card, .skill-card, .contact-item');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const revealPoint = 150;
      
      if (elementPosition < windowHeight - revealPoint) {
        element.classList.add('revealed');
      }
    });
  };
  
  // Initial check
  revealElements();
  
  // Add event listener
  window.addEventListener('scroll', revealElements);
} 