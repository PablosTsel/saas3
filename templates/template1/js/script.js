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