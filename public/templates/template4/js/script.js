// Template 4 - Modern Professional JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const body = document.body;
    const themeToggle = document.getElementById("theme-toggle");
    const burger = document.querySelector(".burger");
    const navLinks = document.querySelector(".nav-links");
    const navItems = document.querySelectorAll(".nav-links li a");
    const sections = document.querySelectorAll("section");
    const navbar = document.getElementById("navbar");

    // Initialize animations
    initializeAnimations();
    
    // Update current year in footer
    updateCurrentYear();

    // Check for saved theme preference or use default (dark)
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme) {
        document.documentElement.setAttribute("data-theme", currentTheme);
        if (themeToggle) {
            themeToggle.checked = currentTheme === "dark";
        }
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

    // Active section highlighting on scroll
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
});

// Update copyright year in footer
function updateCurrentYear() {
    const yearSpan = document.querySelector(".currentYear");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Initialize animations with IntersectionObserver
function initializeAnimations() {
    const sections = document.querySelectorAll('section');
    const fadeElements = document.querySelectorAll('.project-card, .skill-card, .contact-card, .detail-item');
    
    // Add initial classes
    document.querySelector('section').classList.add('active');
    
    // Section animations
    if ('IntersectionObserver' in window) {
        // Create observer for sections
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: '-50px 0px'
        });
        
        // Observe each section
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
        
        // Create observer for card elements
        const fadeObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add staggered animation delay
                    setTimeout(() => {
                        entry.target.classList.add('fade-in');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px'
        });
        
        // Observe each fade element
        fadeElements.forEach(element => {
            // Add fade class to all elements
            element.classList.add('fade');
            fadeObserver.observe(element);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        sections.forEach(section => {
            section.classList.add('active');
        });
        
        fadeElements.forEach(element => {
            element.classList.add('fade-in');
        });
    }
}

// Typing effect for home section
function initTypeWriter() {
    const textElement = document.querySelector('.hero-text h2');
    if (!textElement) return;
    
    const text = textElement.textContent;
    textElement.textContent = '';
    
    let i = 0;
    const speed = 100; // Typing speed in milliseconds
    
    function type() {
        if (i < text.length) {
            textElement.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    // Start typing effect with a small delay
    setTimeout(type, 1000);
}

// Add a subtle parallax effect on mouse move
function initParallax() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    heroSection.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
        const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
        
        document.querySelector('.hero::before').style.transform = `translate(${moveX}px, ${moveY}px)`;
        document.querySelector('.hero::after').style.transform = `translate(${-moveX}px, ${-moveY}px)`;
    });
} 