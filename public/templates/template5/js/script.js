// Theme Toggle
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// Check for saved theme preference or use the system preference
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

// Apply the initial theme
const initialTheme = getInitialTheme();
body.setAttribute("data-theme", initialTheme);

// Handle theme toggle click
themeToggle.addEventListener("click", () => {
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

// Mobile Menu Toggle
const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector(".menu");
const menuLinks = document.querySelectorAll(".menu li a");

menuButton.addEventListener("click", () => {
  menuButton.classList.toggle("active");
  menu.classList.toggle("active");
});

// Close the menu when a link is clicked
menuLinks.forEach(link => {
  link.addEventListener("click", () => {
    menuButton.classList.remove("active");
    menu.classList.remove("active");
  });
});

// Changing Title Animation
const changingTitle = document.querySelector(".changing-title");
const titles = ["Developer", "Designer", "Creator"];
let titleIndex = 0;

if (changingTitle) {
  setInterval(() => {
    changingTitle.textContent = titles[titleIndex];
    titleIndex = (titleIndex + 1) % titles.length;
  }, 3000);
}

// Scroll Animations
window.addEventListener("scroll", () => {
  // Header scroll effect
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
  
  // Active menu item
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".menu li a");
  
  let current = "";
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (window.scrollY >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
  
  // Animate skill bars when they come into view
  const skillItems = document.querySelectorAll(".skill-item");
  
  skillItems.forEach(item => {
    const itemTop = item.getBoundingClientRect().top;
    
    if (itemTop < window.innerHeight - 100) {
      item.classList.add("animate");
    }
  });
});

// Custom Cursor
const cursor = document.querySelector(".cursor");
const cursorFollower = document.querySelector(".cursor-follower");
const cursorElements = document.querySelectorAll(
  "a, button, .project-card, .social-link, input, textarea"
);

if (cursor && cursorFollower) {
  document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    
    // Add a slight delay to the follower for a more fluid effect
    setTimeout(() => {
      cursorFollower.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, 50);
  });
  
  // Change cursor size on hover over interactive elements
  cursorElements.forEach(element => {
    element.addEventListener("mouseenter", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1.5)";
      cursorFollower.style.transform = "translate(-50%, -50%) scale(1.5)";
      cursorFollower.style.backgroundColor = "rgba(255, 60, 120, 0.2)";
      cursorFollower.style.borderWidth = "0";
    });
    
    element.addEventListener("mouseleave", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      cursorFollower.style.transform = "translate(-50%, -50%) scale(1)";
      cursorFollower.style.backgroundColor = "transparent";
      cursorFollower.style.borderWidth = "1px";
    });
  });
  
  // Hide cursor when it leaves the window
  document.addEventListener("mouseout", () => {
    cursor.style.opacity = "0";
    cursorFollower.style.opacity = "0";
  });
  
  document.addEventListener("mouseover", () => {
    cursor.style.opacity = "1";
    cursorFollower.style.opacity = "1";
  });
}

// Gradient Canvas Background
const canvas = document.getElementById("gradient-canvas");

if (canvas) {
  const ctx = canvas.getContext("2d");
  
  // Make canvas full screen
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Handle window resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  
  // Create gradient with shifting hues
  let hue = 0;
  
  function animate() {
    // Semi-transparent black to create fade effect
    ctx.fillStyle = "rgba(15, 15, 15, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create gradient with shifting colors
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    // Use theme variables for colors
    gradient.addColorStop(0, `hsl(${hue}, 100%, 60%)`);
    gradient.addColorStop(0.5, `hsl(${hue + 60}, 100%, 60%)`);
    gradient.addColorStop(1, `hsl(${hue + 120}, 100%, 60%)`);
    
    // Draw gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Increment hue
    hue = (hue + 0.5) % 360;
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// Form submission
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Get form data - in a real application, this would be sent to a server
    const formData = new FormData(contactForm);
    const formObject = Object.fromEntries(formData.entries());
    
    // Simulate form submission
    console.log("Form submitted:", formObject);
    
    // Show success message
    const successMessage = document.createElement("div");
    successMessage.classList.add("success-message");
    successMessage.textContent = "Your message has been sent successfully!";
    
    contactForm.innerHTML = "";
    contactForm.appendChild(successMessage);
    
    // Reset the form after a delay
    setTimeout(() => {
      contactForm.reset();
      contactForm.innerHTML = contactForm.innerHTML;
    }, 5000);
  });
}

// Reveal animations on page load
document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(".reveal-text");
  
  revealElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add("revealed");
    }, index * 200);
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

// Call initialization when the DOM is fully loaded
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
  
  // Set current year
  const yearElements = document.querySelectorAll('.current-year');
  yearElements.forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}); 