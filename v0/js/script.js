document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle")
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")

  // Set initial theme based on user preference or system preference
  if (localStorage.getItem("theme")) {
    document.body.setAttribute("data-theme", localStorage.getItem("theme"))
  } else if (prefersDarkScheme.matches) {
    document.body.setAttribute("data-theme", "dark")
  } else {
    document.body.setAttribute("data-theme", "light")
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme")
    const newTheme = currentTheme === "light" ? "dark" : "light"

    document.body.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
  })

  // Mobile menu toggle
  const menuButton = document.querySelector(".menu-button")
  const menu = document.querySelector(".menu")

  menuButton.addEventListener("click", () => {
    menuButton.classList.toggle("active")
    menu.classList.toggle("active")
  })

  // Close menu when clicking on a link
  const menuLinks = document.querySelectorAll(".menu a")
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.classList.remove("active")
      menu.classList.remove("active")
    })
  })

  // Changing title animation
  const changingTitle = document.querySelector(".changing-title")
  if (changingTitle) {
    const titles = changingTitle.getAttribute("data-titles").split(",")
    let currentIndex = 0

    function changeTitle() {
      changingTitle.textContent = titles[currentIndex]
      currentIndex = (currentIndex + 1) % titles.length
    }

    changeTitle() // Initial call
    setInterval(changeTitle, 3000)
  }

  // Scroll animations
  const header = document.querySelector("header")
  const sections = document.querySelectorAll("section")
  const navLinks = document.querySelectorAll(".menu a")

  window.addEventListener("scroll", () => {
    // Header scroll effect
    if (window.scrollY > 50) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }

    // Highlight active menu item
    let current = ""

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100
      const sectionHeight = section.clientHeight
      if (pageYOffset >= sectionTop) {
        current = section.getAttribute("id")
      }
    })

    navLinks.forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("href").substring(1) === current) {
        link.classList.add("active")
      }
    })

    // Animate skill bars when in view
    const skillItems = document.querySelectorAll(".skill-item")
    skillItems.forEach((item) => {
      const itemTop = item.getBoundingClientRect().top
      if (itemTop < window.innerHeight - 100) {
        item.classList.add("animate")
      }
    })
  })

  // Custom cursor
  const cursor = document.querySelector(".cursor")
  const cursorFollower = document.querySelector(".cursor-follower")

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px"
    cursor.style.top = e.clientY + "px"

    setTimeout(() => {
      cursorFollower.style.left = e.clientX + "px"
      cursorFollower.style.top = e.clientY + "px"
    }, 100)
  })

  // Cursor effects on hover
  const hoverElements = document.querySelectorAll("a, button, .project-card, .social-link")

  hoverElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1.5)"
      cursorFollower.style.transform = "translate(-50%, -50%) scale(1.5)"
      cursorFollower.style.backgroundColor = "rgba(255, 60, 120, 0.2)"
    })

    element.addEventListener("mouseleave", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)"
      cursorFollower.style.transform = "translate(-50%, -50%) scale(1)"
      cursorFollower.style.backgroundColor = "transparent"
    })
  })

  // Gradient canvas background
  const canvas = document.getElementById("gradient-canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Resize canvas when window is resized
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  // Gradient animation
  const gradientAnimation = {
    hue: 0,
    colorStops: [
      { x: 0, y: 0, radius: 0 },
      { x: canvas.width, y: 0, radius: canvas.width * 0.8 },
      { x: canvas.width / 2, y: canvas.height, radius: canvas.width * 0.4 },
    ],
    animate: function () {
      this.hue = (this.hue + 0.2) % 360

      // Move color stops
      this.colorStops.forEach((stop, index) => {
        stop.x += Math.sin(Date.now() * 0.001 + index) * 2
        stop.y += Math.cos(Date.now() * 0.001 + index) * 2

        // Keep within bounds
        stop.x = Math.max(0, Math.min(canvas.width, stop.x))
        stop.y = Math.max(0, Math.min(canvas.height, stop.y))
      })

      // Create gradient
      const gradient = ctx.createRadialGradient(
        this.colorStops[0].x,
        this.colorStops[0].y,
        this.colorStops[0].radius,
        this.colorStops[1].x,
        this.colorStops[1].y,
        this.colorStops[1].radius,
      )

      gradient.addColorStop(0, `hsla(${this.hue}, 100%, 60%, 1)`)
      gradient.addColorStop(0.5, `hsla(${(this.hue + 60) % 360}, 100%, 60%, 1)`)
      gradient.addColorStop(1, `hsla(${(this.hue + 120) % 360}, 100%, 60%, 1)`)

      // Draw gradient
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      requestAnimationFrame(() => this.animate())
    },
  }

  gradientAnimation.animate()

  // Form submission
  const contactForm = document.getElementById("contact-form")
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form data
      const formData = new FormData(contactForm)
      const formObject = Object.fromEntries(formData)

      // Simulate form submission
      console.log("Form submitted:", formObject)

      // Show success message
      alert("Thank you for your message! I will get back to you soon.")

      // Reset form
      contactForm.reset()
    })
  }

  // Reveal animations on page load
  setTimeout(() => {
    const revealElements = document.querySelectorAll(".reveal-text")
    revealElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add("revealed")
      }, index * 200)
    })
  }, 500)
})
