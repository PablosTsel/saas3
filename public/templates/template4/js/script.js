// Template 4 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeTheme();
    setupNavigationHighlight();
    setupMobileMenu();
    setupSectionAnimations();
    updateCurrentYear();
    enhanceBubbleAnimations();
    
    // Add scroll event listener for sticky header
    window.addEventListener('scroll', function() {
        handleHeaderScroll();
        highlightActiveSection();
    });

    // Initialize smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
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

// Enhance moving background with mouse movement
document.addEventListener('mousemove', function(e) {
    const bubbles = document.querySelectorAll('.bubble');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    bubbles.forEach((bubble, index) => {
        // Create different movement factors for each bubble
        const factorX = (index + 1) * 5; // Reduced from 10 for subtler effect
        const factorY = (index + 1) * 7; // Reduced from 15 for subtler effect
        
        const translateX = (x * factorX) - (factorX / 2);
        const translateY = (y * factorY) - (factorY / 2);
        
        // Add a slight delay for a more natural feel
        setTimeout(() => {
            bubble.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }, index * 50);
    });
});

// Add bubble animations dynamically to allow them to continue their
// base animation while also responding to mouse movement
function enhanceBubbleAnimations() {
    const bubbles = document.querySelectorAll('.bubble');
    
    bubbles.forEach((bubble, index) => {
        // Set initial random positions for more organic feel
        const randomX = Math.random() * 20 - 10;
        const randomY = Math.random() * 20 - 10;
        bubble.style.transform = `translate(${randomX}px, ${randomY}px)`;
        
        // Allow CSS animations and JS transforms to coexist
        bubble.style.transition = 'transform 0.8s ease-out';
    });
} 