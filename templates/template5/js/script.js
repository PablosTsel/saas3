// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  
  // Initialize skill levels
  initSkillLevels();
  
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
  
  // Mobile menu toggle
  const menuBtn = document.querySelector('.menu-button');
  const menu = document.querySelector('.menu');
  
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function() {
      menuBtn.classList.toggle('active');
      menu.classList.toggle('active');
    });
  }
  
  // Add subtle animation to profile section
  const profileSection = document.querySelector(".profile-section");

  if (profileSection) {
    profileSection.style.opacity = "0";
    profileSection.style.transform = "translateY(20px)";

    setTimeout(() => {
      profileSection.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      profileSection.style.opacity = "1";
      profileSection.style.transform = "translateY(0)";
    }, 200);
  }
  
  // Anchor link smooth scrolling
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (menu && menu.classList.contains('active')) {
          menu.classList.remove('active');
          menuBtn.classList.remove('active');
        }
      }
    });
  });
  
  // Typing effect for title
  const changingTitle = document.querySelector('.changing-title');
  if (changingTitle) {
    let titles = ['Developer', 'Designer', 'Creator'];
    const dataTitles = changingTitle.getAttribute('data-titles');
    if (dataTitles) {
      try {
        const parsedTitles = JSON.parse(dataTitles);
        if (Array.isArray(parsedTitles) && parsedTitles.length > 0) {
          titles = parsedTitles;
        }
      } catch (e) {
        console.log('Error parsing titles:', e);
      }
    }
    
    let currentIndex = 0;
    let isDeleting = false;
    let text = '';
    let typingSpeed = 100;
    
    function type() {
      const currentTitle = titles[currentIndex];
      
      if (isDeleting) {
        text = currentTitle.substring(0, text.length - 1);
        typingSpeed = 50;
      } else {
        text = currentTitle.substring(0, text.length + 1);
      }
      
      changingTitle.textContent = text;
      
      if (!isDeleting && text === currentTitle) {
        typingSpeed = 1000;
        isDeleting = true;
      } else if (isDeleting && text === '') {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % titles.length;
        typingSpeed = 500;
      }
      
      setTimeout(type, typingSpeed);
    }
    
    setTimeout(type, 1000);
  }
  
  // Project filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Set active class
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      
      // Filter projects
      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || filter === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
  
  // Form validation
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let valid = true;
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      
      // Simple validation
      if (!nameInput.value.trim()) {
        nameInput.classList.add('error');
        valid = false;
      } else {
        nameInput.classList.remove('error');
      }
      
      if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
        emailInput.classList.add('error');
        valid = false;
      } else {
        emailInput.classList.remove('error');
      }
      
      if (!messageInput.value.trim()) {
        messageInput.classList.add('error');
        valid = false;
      } else {
        messageInput.classList.remove('error');
      }
      
      if (valid) {
        // Show success message (in a real app, would send data to server)
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        // Simulate sending
        setTimeout(() => {
          contactForm.reset();
          submitBtn.textContent = 'Message Sent!';
          
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }, 2000);
        }, 1500);
      }
    });
  }
  
  // Set current year
  const yearElements = document.querySelectorAll('.currentYear');
  yearElements.forEach(el => {
    el.textContent = new Date().getFullYear();
  });
  
  // Show header background on scroll
  const header = document.querySelector('header');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  // Scroll reveal animation
  const revealElements = document.querySelectorAll('.reveal-text');
  
  function reveal() {
    revealElements.forEach(el => {
      const windowHeight = window.innerHeight;
      const elementTop = el.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
        el.style.animation = 'revealText 0.5s forwards';
      }
    });
  }
  
  window.addEventListener('scroll', reveal);
  
  // Initial reveal call
  reveal();
  
  // Highlight active section on scroll
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    document.querySelectorAll('section').forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll('.menu a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
    
    // Add active class to Home when at the top
    if (scrollPosition < 100) {
      document.querySelectorAll('.menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#home') {
          link.classList.add('active');
        }
      });
    }
  });
});

// Initialize skill bars
function initSkillLevels() {
  const skillBars = document.querySelectorAll('.skill-level');
  const percentageSpans = document.querySelectorAll('.skill-percentage');
  
  // Remove any percentage spans that might exist
  percentageSpans.forEach(span => {
    if (span && span.parentNode) {
      span.parentNode.removeChild(span);
    }
  });
  
  skillBars.forEach(bar => {
    // Remove data-level attribute to prevent percentages
    if (bar.hasAttribute('data-level')) {
      bar.removeAttribute('data-level');
    }
    
    // Set fixed width without using data-level
    bar.style.width = '90%';
  });
}

// Email validation helper
function isValidEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
} 