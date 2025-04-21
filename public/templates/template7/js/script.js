// Template 7 JavaScript - Gradient Wave Animation

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeTheme();
    setupNavigationHighlight();
    setupMobileMenu();
    setupSectionAnimations();
    updateCurrentYear();
    
    // Add scroll event listener for sticky header
    window.addEventListener('scroll', function() {
        handleHeaderScroll();
        highlightActiveSection();
    });

    // Initialize smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
    
    // Initialize wave animation enhancement
    setupWaveAnimation();
});

// Initialize theme based on user preference or saved setting
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    
    // Set theme based on saved preference or default to dark
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeToggle.checked = currentTheme === 'dark';
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

// Set up mobile menu functionality
function setupMobileMenu() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if (burger) {
        burger.addEventListener('click', function() {
            // Toggle nav menu
            nav.classList.toggle('nav-active');
            
            // Animate burger
            burger.classList.toggle('toggle');
            
            // Animate links
            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
            navLinks.forEach(link => {
                link.style.animation = '';
            });
        });
    });
}

// Handle header color and shadow on scroll
function handleHeaderScroll() {
    const header = document.querySelector('header');
    
    if (window.scrollY > 50) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
}

// Setup for highlighting the active section in navigation
function setupNavigationHighlight() {
    // Initial call to set the active section
    highlightActiveSection();
}

// Highlight the active section in the navigation menu
function highlightActiveSection() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Find the current section in view
    let currentSection = '';
    let sectionOffset = 100; // Offset to account for the fixed header
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - sectionOffset;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Update the active class in navigation
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkSection = link.getAttribute('href').substring(1);
        
        if (linkSection === currentSection) {
            link.classList.add('active');
        }
    });
}

// Setup for section animations using Intersection Observer
function setupSectionAnimations() {
    const sections = document.querySelectorAll('section');
    
    // If IntersectionObserver is supported by the browser
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null, // Use the viewport
            threshold: 0.15, // Trigger when 15% of the element is visible
            rootMargin: '-50px 0px' // Trigger slightly before the element is visible
        });
        
        // Observe each section
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        sections.forEach(section => {
            section.classList.add('active');
        });
    }
}

// Update the current year in the footer copyright
function updateCurrentYear() {
    const yearElement = document.querySelector('.currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Handle smooth scrolling for anchor links
function handleSmoothScroll(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
        const offset = 80; // Offset for fixed header
        const targetPosition = targetElement.offsetTop - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Setup advanced wave animation with parallax effect
function setupWaveAnimation() {
    const waves = document.querySelectorAll('.wave');
    const container = document.querySelector('.gradient-waves');
    
    if (!container) return;
    
    // Add mouse move parallax effect
    document.addEventListener('mousemove', function(e) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // Different effect for each wave
        waves.forEach((wave, index) => {
            const speed = (index + 1) * 15;
            const offsetX = (x - 0.5) * speed;
            const offsetY = (y - 0.5) * speed;
            
            wave.style.transform = `rotate(${offsetX * 2}deg) translate(${offsetX}px, ${offsetY}px)`;
        });
    });
    
    // Add scroll parallax effect
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY / window.innerHeight;
        
        waves.forEach((wave, index) => {
            const speed = (index + 1) * 30;
            const rotateSpeed = (index + 1) * 5;
            const offsetY = scrollY * speed;
            
            wave.style.transform = `rotate(${scrollY * rotateSpeed}deg) translateY(${offsetY}px)`;
        });
    });
}

// Enhance skill cards with hover animation
document.addEventListener('DOMContentLoaded', function() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Small pulse animation
            this.classList.add('animate-pulse');
            
            // Highlight the icon
            const icon = this.querySelector('.skill-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // Remove animation
            this.classList.remove('animate-pulse');
            
            // Reset icon
            const icon = this.querySelector('.skill-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
    });
}); 