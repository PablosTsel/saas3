// Progressive Disclosure Animation
document.addEventListener('DOMContentLoaded', function() {
    // Check if we need to fill in dynamic content
    updateCurrentYear();
    
    // Set up intersection observer for animations
    setupSectionAnimations();
    
    // Activate the first section by default
    document.querySelector('section').classList.add('active');
});

// Update the current year in the footer
function updateCurrentYear() {
    const yearElement = document.querySelector('footer .container p');
    const currentYear = new Date().getFullYear();
    if (yearElement && yearElement.textContent.includes('{{currentYear}}')) {
        yearElement.textContent = yearElement.textContent.replace('{{currentYear}}', currentYear);
    }
}

// Set up intersection observer for section animations
function setupSectionAnimations() {
    const sections = document.querySelectorAll('section');
    
    // If IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // If the section is intersecting (visible)
                if (entry.isIntersecting) {
                    // Add the active class to trigger the animation
                    entry.target.classList.add('active');
                    
                    // Once it's animated in, no need to observe anymore
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

// Handle active navigation state
document.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('nav a');
    
    let currentSectionId = '';
    
    // Determine which section is currently in view
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop - 150 && 
            window.scrollY < sectionTop + sectionHeight - 150) {
            currentSectionId = section.getAttribute('id');
        }
    });
    
    // Update navigation active state
    navItems.forEach(item => {
        // Remove active class from all items
        item.classList.remove('active');
        
        // Add active class to current section's nav item
        const href = item.getAttribute('href').substring(1); // Remove the #
        if (href === currentSectionId) {
            item.classList.add('active');
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const body = document.body;
    const themeToggle = document.getElementById("theme-toggle");
    const burger = document.querySelector(".burger");
    const navLinks = document.querySelector(".nav-links");
    const navItems = document.querySelectorAll(".nav-links li a");
    const sections = document.querySelectorAll("section");
    const navbar = document.getElementById("navbar");

    // Check for saved theme preference or use default
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme) {
        document.documentElement.setAttribute("data-theme", currentTheme);
    }

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener("change", () => {
            if (themeToggle.checked) {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("theme", "light");
            }
        });
    }

    // Mobile Menu Toggle
    if (burger) {
        burger.addEventListener("click", () => {
            // Toggle Nav
            navLinks.classList.toggle("nav-active");
            
            // Burger Animation
            burger.classList.toggle("toggle");
        });
    }

    // Close mobile menu when clicking a link
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navLinks.classList.remove("nav-active");
            burger.classList.remove("toggle");
        });
    });

    // Sticky Header
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("header-scrolled");
        } else {
            navbar.classList.remove("header-scrolled");
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active section highlighting
    window.addEventListener("scroll", () => {
        let current = "";
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute("id");
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("href") === `#${current}`) {
                item.classList.add("active");
            }
        });
    });

    // Update copyright year
    const yearSpan = document.querySelector(".currentYear");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}); 