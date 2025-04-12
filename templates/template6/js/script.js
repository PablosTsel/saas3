/*
* Template 6 - Modern Glassmorphism Portfolio
* Created by SaaS3
*/

// DOM Elements
const body = document.querySelector('body');
const header = document.querySelector('header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const menuClose = document.querySelector('.menu-close');
const themeToggle = document.querySelector('.theme-toggle');
const backToTop = document.querySelector('.back-to-top');
const navLinks = document.querySelectorAll('.nav-link');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const skillBars = document.querySelectorAll('.skill-progress');
const animatedElements = document.querySelectorAll('.animate-on-scroll');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectItems = document.querySelectorAll('.project-item');

// Initialize the portfolio
function initPortfolio() {
    setupEventListeners();
    setupTheme();
    setupAnimations();
    setupScrollSpy();
    setupFilterProjects();
}

// Set up event listeners
function setupEventListeners() {
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }

    // Mobile menu close
    if (menuClose) {
        menuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }

    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            smoothScroll(e);
            mobileMenu.classList.remove('active');
        });
    });

    // Back to top button
    if (backToTop) {
        window.addEventListener('scroll', toggleBackToTopButton);
        backToTop.addEventListener('click', scrollToTop);
    }

    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Contact form validation
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
}

// Theme setup and toggle
function setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.setAttribute('aria-label', 'Switch to light theme');
        }
    } else {
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-label', 'Switch to dark theme');
        }
    }
}

function toggleTheme() {
    body.classList.toggle('dark-theme');
    
    if (body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.setAttribute('aria-label', 'Switch to light theme');
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.setAttribute('aria-label', 'Switch to dark theme');
    }
}

// Smooth scrolling
function smoothScroll(e) {
    e.preventDefault();
    
    const targetId = e.currentTarget.getAttribute('href');
    if (!targetId || targetId === '#') return;
    
    const targetPosition = document.querySelector(targetId).offsetTop - 80;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
    
    // Update active nav link
    navLinks.forEach(link => link.classList.remove('active'));
    e.currentTarget.classList.add('active');
}

// Back to top button
function toggleBackToTopButton() {
    if (window.scrollY > 500) {
        backToTop.classList.add('active');
    } else {
        backToTop.classList.remove('active');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Set up scroll animations
function setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Animate skill bars when in viewport
                if (entry.target.classList.contains('skill-progress')) {
                    const percentage = entry.target.getAttribute('data-percentage');
                    entry.target.style.width = percentage + '%';
                }
            }
        });
    }, { threshold: 0.1 });
    
    // Observe animated elements
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // Observe skill bars
    skillBars.forEach(bar => {
        observer.observe(bar);
    });
}

// Scroll spy for active nav highlighting
function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
        
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// Project filtering
function setupFilterProjects() {
    if (filterButtons.length > 0 && projectItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                const filterValue = button.getAttribute('data-filter');
                
                projectItems.forEach(item => {
                    if (filterValue === 'all') {
                        item.style.display = 'block';
                    } else if (item.classList.contains(filterValue)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                    
                    // Re-trigger animation
                    setTimeout(() => {
                        item.classList.remove('active');
                        void item.offsetWidth; // Force reflow
                        item.classList.add('active');
                    }, 100);
                });
            });
        });
    }
}

// Contact form handling
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());
    
    // Basic form validation
    let isValid = true;
    const inputs = e.target.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'red';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
        
        if (input.type === 'email' && !validateEmail(input.value)) {
            input.style.borderColor = 'red';
            isValid = false;
        }
    });
    
    if (isValid) {
        // Here you would normally send the form data to a server
        // For now, we'll just show a success message
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
        
        // Simulate server response
        setTimeout(() => {
            alert('Your message has been sent successfully!');
            e.target.reset();
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }, 1500);
    }
}

// Email validation helper
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initPortfolio);

// Handle page load animations
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animate hero section elements with delay
    const heroElements = document.querySelectorAll('.hero .animate-on-scroll');
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('active');
        }, 300 + (index * 100));
    });
});

// Preload images for smoother transitions
function preloadImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.src && !img.complete) {
            const newImg = new Image();
            newImg.src = img.src;
        }
    });
}

// Prevent FOUC (Flash of Unstyled Content)
document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');
preloadImages(); 