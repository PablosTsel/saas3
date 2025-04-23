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
    
    // Ensure icons are properly centered
    ensureIconsCentered();
    
    // Remove any code icons from the page
    removeCodeIcons();
    
    // Enhance the skills styling
    enhanceSkillsBoxes();
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

// Remove any code icons that might be dynamically added
function removeCodeIcons() {
    // Target all potential code icons in section titles and headers
    const potentialCodeIcons = document.querySelectorAll('.section-title i, .section-header i, h2 i, .fa-code, [class*="fa-code"]');
    
    // Remove all found elements
    potentialCodeIcons.forEach(icon => {
        if (icon.classList.contains('fa-code') || 
            icon.classList.contains('fa-code-branch') ||
            icon.className.includes('fa-code')) {
            icon.remove();
        }
    });
    
    // Also check for any elements that might have been added as ::before or ::after
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .section-title::before, .section-title::after,
        .section-header::before, .section-header::after,
        h2::before, h2::after {
            display: none !important;
            content: none !important;
        }
    `;
    document.head.appendChild(styleElement);
    
    // Set up a mutation observer to catch any dynamically added icons
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        const codeIcons = node.querySelectorAll('.fa-code, [class*="fa-code"]');
                        codeIcons.forEach(icon => icon.remove());
                        
                        // Also check if the node itself is a code icon
                        if (node.classList && 
                            (node.classList.contains('fa-code') || 
                             node.classList.contains('fa-code-branch') ||
                             node.className.includes('fa-code'))) {
                            node.remove();
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });
}

// Enhance the skills boxes with additional styling and effects
function enhanceSkillsBoxes() {
    const skillTags = document.querySelectorAll('.skill-tag');
    
    if (skillTags.length === 0) return;
    
    // Add random subtle variations to make skills more distinct
    skillTags.forEach((tag, index) => {
        // Add subtle rotation to some tags
        const randomRotation = (Math.random() * 4 - 2);
        tag.style.transform = `rotate(${randomRotation}deg)`;
        
        // Slightly vary the background gradient angle
        const gradientAngle = 135 + (Math.random() * 30 - 15);
        tag.style.background = `linear-gradient(${gradientAngle}deg, var(--primary-color) 0%, var(--accent-color) 100%)`;
        
        // Add a small delay to the hover animation based on index
        tag.style.transitionDelay = `${index * 0.03}s`;
        
        // Vary the border opacity slightly
        const borderOpacity = 0.1 + (Math.random() * 0.2);
        tag.style.borderColor = `rgba(255, 255, 255, ${borderOpacity})`;
    });
    
    // Get the skills container and ensure proper duplicated content for infinite scroll
    const skillsContainer = document.querySelector('.skills-container');
    if (skillsContainer) {
        // If needed, duplicate skill tags to ensure smooth scrolling
        const containerWidth = skillsContainer.scrollWidth;
        const viewportWidth = document.querySelector('.skills-grid').clientWidth;
        
        if (containerWidth < viewportWidth * 2) {
            // Need more items for a smooth scroll
            const tags = Array.from(skillTags);
            tags.forEach(tag => {
                const clone = tag.cloneNode(true);
                // Apply slightly different rotation to clones
                const randomRotation = (Math.random() * 4 - 2);
                clone.style.transform = `rotate(${randomRotation}deg)`;
                skillsContainer.appendChild(clone);
            });
        }
    }
} 