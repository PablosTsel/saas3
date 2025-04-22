// Template 2 - Modern Professional Portfolio
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the theme based on user preference or previous setting
    initTheme();
    
    // Update any dynamic content
    updateCurrentYear();
    
    // Set up intersection observer for fade-in animations
    setupSectionAnimations();
    
    // Setup navigation scroll events
    setupNavigation();
    
    // Setup mobile menu toggle
    setupMobileMenu();
    
    // Setup typing animation
    setupTypingAnimation();
    
    // Ensure icons are properly centered
    ensureIconsCentered();
});

// Initialize theme based on saved preference or system preference
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('theme-toggle');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeToggle) {
            themeToggle.checked = savedTheme === 'dark';
        }
    } else {
        // Check if user prefers dark mode
        const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeToggle) {
                themeToggle.checked = true;
            }
        }
    }
    
    // Add event listener for theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

// Update the current year in the footer
function updateCurrentYear() {
    const yearElement = document.querySelector('.currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Set up intersection observer for revealing sections on scroll
function setupSectionAnimations() {
    const sections = document.querySelectorAll('section');
    
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: '-50px 0px'
        });
        
        sections.forEach(section => {
            section.classList.add('fade-in-section');
            sectionObserver.observe(section);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        sections.forEach(section => {
            section.classList.add('in-view');
        });
    }
}

// Setup navigation with scrolling and active state
function setupNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    
    // Handle navbar background on scroll
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                document.body.classList.add('scrolled');
            } else {
                document.body.classList.remove('scrolled');
            }
        });
    }
    
    // Smooth scrolling for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            const burger = document.querySelector('.burger');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                burger.classList.remove('active');
            }
            
            // Scroll to target
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop - 100 && window.scrollY < sectionTop + sectionHeight - 100) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1);
            if (href === currentSectionId) {
                link.classList.add('active');
            }
        });
    });
}

// Setup mobile menu toggle
function setupMobileMenu() {
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    
    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            burger.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !burger.contains(e.target)) {
                navLinks.classList.remove('active');
                burger.classList.remove('active');
            }
        });
    }
}

// Add fade-in animation for elements when scrolled into view
document.addEventListener('scroll', function() {
    const fadeElements = document.querySelectorAll('.fade-element');
    
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8) {
            element.classList.add('fade-in');
        }
    });
});

// Add CSS for animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .fade-in-section {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in-section.in-view {
        opacity: 1;
        transform: translateY(0);
    }
    
    .fade-element {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .fade-element.fade-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .hero-text h1, .hero-text h2, .hero-text p, .hero-cta, .profile-img-container {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .in-view .hero-text h1 {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.2s;
    }
    
    .in-view .hero-text h2 {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.4s;
    }
    
    .in-view .hero-text p {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.6s;
    }
    
    .in-view .hero-cta {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.8s;
    }
    
    .in-view .profile-img-container {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.5s;
    }
    
    .skill-card, .exp-card, .project-card, .contact-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .in-view .skill-card, .in-view .exp-card, .in-view .project-card, .in-view .contact-card {
        opacity: 1;
        transform: translateY(0);
    }
    
    .in-view .skill-card:nth-child(1), .in-view .exp-card:nth-child(1), .in-view .project-card:nth-child(1), .in-view .contact-card:nth-child(1) {
        transition-delay: 0.1s;
    }
    
    .in-view .skill-card:nth-child(2), .in-view .exp-card:nth-child(2), .in-view .project-card:nth-child(2), .in-view .contact-card:nth-child(2) {
        transition-delay: 0.2s;
    }
    
    .in-view .skill-card:nth-child(3), .in-view .exp-card:nth-child(3), .in-view .project-card:nth-child(3) {
        transition-delay: 0.3s;
    }
    
    .in-view .skill-card:nth-child(4), .in-view .exp-card:nth-child(4), .in-view .project-card:nth-child(4) {
        transition-delay: 0.4s;
    }
    
    .in-view .skill-card:nth-child(5), .in-view .project-card:nth-child(5) {
        transition-delay: 0.5s;
    }
    
    .in-view .skill-card:nth-child(6), .in-view .project-card:nth-child(6) {
        transition-delay: 0.6s;
    }
`;

document.head.appendChild(animationStyles);

// Add this function to the document ready handler
function ensureIconsCentered() {
  const allIcons = document.querySelectorAll('.skill-icon i, .detail-icon i, .contact-icon i');
  
  allIcons.forEach(icon => {
    // Ensure parent container is properly sized
    const container = icon.parentElement;
    if (container) {
      // Force a reflow to ensure proper centering
      container.style.display = 'inline-flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';
    }
  });
}

// Setup typing animation for the title
function setupTypingAnimation() {
    const typedTextSpan = document.querySelector('.typed-text');
    const cursorSpan = document.querySelector('.cursor');
    
    // If the title element doesn't exist, exit
    if (!typedTextSpan || !cursorSpan) return;
    
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