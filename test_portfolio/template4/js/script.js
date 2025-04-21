document.addEventListener("DOMContentLoaded", () => {
  // Initialize animation for wave background
  initWaveBackground();
  
  // Initialize theme toggle
  initThemeToggle();
  
  // Initialize typing effect
  initTypingEffect();
  
  // Initialize scroll animations
  initScrollAnimations();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Set current year in footer
  setCurrentYear();
  
  /**
   * Initialize the wave background animation
   */
  function initWaveBackground() {
    // Create wave element
    const waveBackground = document.getElementById('wave-background');
    const wave = document.createElement('div');
    wave.classList.add('wave');
    waveBackground.appendChild(wave);
    
    // Adjust wave effects on theme changes
    window.updateWaveColors = () => {
      const root = document.documentElement;
      const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
      
      if (isDarkTheme) {
        root.style.setProperty('--wave-color-1', 'rgba(76, 201, 240, 0.05)');
        root.style.setProperty('--wave-color-2', 'rgba(114, 9, 183, 0.05)');
        root.style.setProperty('--wave-color-3', 'rgba(247, 37, 133, 0.05)');
      } else {
        root.style.setProperty('--wave-color-1', 'rgba(67, 97, 238, 0.1)');
        root.style.setProperty('--wave-color-2', 'rgba(58, 12, 163, 0.1)');
        root.style.setProperty('--wave-color-3', 'rgba(247, 37, 133, 0.1)');
      }
    };
  }
  
  /**
   * Initialize theme toggle functionality
   */
  function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme based on user preference or system preference
    if (localStorage.getItem('theme')) {
      document.body.setAttribute('data-theme', localStorage.getItem('theme'));
    } else if (prefersDarkScheme.matches) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
    
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update wave colors when theme changes
      if (window.updateWaveColors) {
        window.updateWaveColors();
      }
    });
  }
  
  /**
   * Initialize typing effect for title
   */
  function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    const title = typingElement.textContent;
    let alternativeTitles = ['Creative', 'Professional', 'Passionate'];
    
    // Add original title to alternatives if it's not already there
    if (!alternativeTitles.includes(title)) {
      alternativeTitles.unshift(title);
    }
    
    let currentTitleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 150;
    
    function type() {
      const currentTitle = alternativeTitles[currentTitleIndex];
      
      if (isDeleting) {
        // Deleting text
        typingElement.textContent = currentTitle.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        typingSpeed = 50; // Faster when deleting
      } else {
        // Typing text
        typingElement.textContent = currentTitle.substring(0, currentCharIndex + 1);
        currentCharIndex++;
        typingSpeed = 150; // Slower when typing
      }
      
      // If finished typing the word
      if (!isDeleting && currentCharIndex === currentTitle.length) {
        isDeleting = true;
        typingSpeed = 1500; // Pause at the end of the word
      } 
      // If finished deleting the word
      else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentTitleIndex = (currentTitleIndex + 1) % alternativeTitles.length;
        typingSpeed = 500; // Pause before typing the next word
      }
      
      setTimeout(type, typingSpeed);
    }
    
    // Start typing effect after a delay
    setTimeout(type, 1000);
  }
  
  /**
   * Initialize scroll animations
   */
  function initScrollAnimations() {
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Detect scroll to add scrolled class to navbar
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      // Update active nav link based on scroll position
      updateActiveNavLink();
    });
    
    // Smooth scroll for anchor links
    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        const targetId = link.getAttribute('href');
        if (targetId.startsWith('#')) {
          e.preventDefault();
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 80,
              behavior: 'smooth'
            });
          }
        }
      });
    });
    
    // Update active link on scroll
    function updateActiveNavLink() {
      const scrollPosition = window.scrollY;
      
      // Check if at the top for the home section
      if (scrollPosition < 200) {
        navLinks.forEach(link => link.classList.remove('active'));
        const homeLink = document.querySelector('.nav-links a[href="#home"]');
        if (homeLink) homeLink.classList.add('active');
        return;
      }
      
      // Check other sections
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach(link => link.classList.remove('active'));
          const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }
    
    // Add fade-in animation for elements
    const fadeElements = document.querySelectorAll('.project-card, .contact-card, .info-item');
    
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      fadeObserver.observe(element);
    });
    
    // Initialize skills track animation
    initSkillsTracks();
  }
  
  /**
   * Initialize mobile menu functionality
   */
  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }
  
  /**
   * Initialize skills tracks and ensure continuous animation
   */
  function initSkillsTracks() {
    const track1 = document.querySelector('.skills-track.track-1');
    const track2 = document.querySelector('.skills-track.track-2');
    
    if (!track1 || !track2) return;
    
    // Clone skill items to ensure continuous flow
    const track1Items = track1.querySelectorAll('.skill-item');
    const track2Items = track2.querySelectorAll('.skill-item');
    
    // Only clone if there are items
    if (track1Items.length > 0) {
      track1Items.forEach(item => {
        const clone = item.cloneNode(true);
        track1.appendChild(clone);
      });
    }
    
    if (track2Items.length > 0) {
      track2Items.forEach(item => {
        const clone = item.cloneNode(true);
        track2.appendChild(clone);
      });
    }
  }
  
  /**
   * Set the current year in the footer
   */
  function setCurrentYear() {
    const yearElement = document.querySelector('.currentYear');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }
}); 