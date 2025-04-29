/**
 * SmoothScroller - A utility for automatic smooth scrolling through websites
 * Ideal for recording portfolio demos and website showcases
 */

(function() {
  // Configuration
  const config = {
    // Key combinations (customize as needed)
    startKey: 'KeyS', // Press 'S' to start scrolling
    stopKey: 'KeyX',  // Press 'X' to stop scrolling
    fasterKey: 'KeyF', // Press 'F' to speed up
    slowerKey: 'KeyD', // Press 'D' to slow down
    resetSpeedKey: 'KeyR', // Press 'R' to reset speed
    upKey: 'KeyU', // Press 'U' to scroll up instead of down
    
    // Control keys that need to be held (empty array for no control key)
    controlKeys: ['ShiftLeft', 'ShiftRight'],
    
    // Scroll settings
    defaultScrollSpeed: 1.5, // pixels per animation frame
    speedIncrement: 0.5,     // How much to change speed by
    minSpeed: 0.5,           // Minimum scrolling speed
    maxSpeed: 5,             // Maximum scrolling speed
    
    // Visual indicator settings
    showIndicator: true,
    indicatorTimeout: 3000, // ms before indicator fades out
  };

  // State variables
  let isScrolling = false;
  let scrollSpeed = config.defaultScrollSpeed;
  let scrollDirection = 1; // 1 for down, -1 for up
  let scrollAnimationId = null;
  let indicatorTimeout = null;
  let controlKeysPressed = new Set();
  
  // Create UI elements
  const createScrollIndicator = () => {
    const indicator = document.createElement('div');
    indicator.id = 'smooth-scroll-indicator';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      z-index: 10000;
      transition: opacity 0.3s ease;
      pointer-events: none;
      opacity: 0;
    `;
    document.body.appendChild(indicator);
    return indicator;
  };

  const indicator = config.showIndicator ? createScrollIndicator() : null;

  // Update the indicator text and show it
  const updateIndicator = (message) => {
    if (!config.showIndicator || !indicator) return;
    
    indicator.textContent = message;
    indicator.style.opacity = '1';
    
    // Clear any existing timeout
    if (indicatorTimeout) {
      clearTimeout(indicatorTimeout);
    }
    
    // Set new timeout to hide the indicator
    indicatorTimeout = setTimeout(() => {
      indicator.style.opacity = '0';
    }, config.indicatorTimeout);
  };

  // Scroll function that gets called on animation frame
  const scrollPage = () => {
    if (!isScrolling) return;
    
    // Calculate new scroll position
    window.scrollBy({
      top: scrollSpeed * scrollDirection,
      behavior: 'auto' // We control the smoothness ourselves
    });
    
    // Check if we've reached the bottom or top
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
    const isAtTop = window.scrollY <= 0;
    
    if ((isAtBottom && scrollDirection > 0) || (isAtTop && scrollDirection < 0)) {
      stopScrolling();
      updateIndicator('Scrolling complete');
      return;
    }
    
    // Continue scrolling
    scrollAnimationId = requestAnimationFrame(scrollPage);
  };

  // Start the scrolling animation
  const startScrolling = () => {
    if (isScrolling) return;
    
    isScrolling = true;
    updateIndicator(`Scrolling ${scrollDirection > 0 ? 'down' : 'up'} (Speed: ${scrollSpeed.toFixed(1)})`);
    scrollAnimationId = requestAnimationFrame(scrollPage);
  };

  // Stop the scrolling animation
  const stopScrolling = () => {
    if (!isScrolling) return;
    
    isScrolling = false;
    if (scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
      scrollAnimationId = null;
    }
    updateIndicator('Scrolling paused');
  };

  // Change scroll speed
  const changeSpeed = (increment) => {
    scrollSpeed = Math.max(
      config.minSpeed,
      Math.min(config.maxSpeed, scrollSpeed + increment)
    );
    updateIndicator(`Speed: ${scrollSpeed.toFixed(1)}`);
  };

  // Reset to default speed
  const resetSpeed = () => {
    scrollSpeed = config.defaultScrollSpeed;
    updateIndicator(`Speed reset: ${scrollSpeed.toFixed(1)}`);
  };

  // Toggle scroll direction
  const toggleScrollDirection = () => {
    scrollDirection *= -1;
    updateIndicator(`Direction: ${scrollDirection > 0 ? 'down' : 'up'}`);
  };

  // Check if all required control keys are pressed
  const areControlKeysPressed = () => {
    if (config.controlKeys.length === 0) return true;
    
    return config.controlKeys.every(key => 
      controlKeysPressed.has(key)
    );
  };

  // Key down event handler
  const handleKeyDown = (e) => {
    // Track control keys being pressed
    controlKeysPressed.add(e.code);
    
    // Only process commands if all control keys are pressed
    if (!areControlKeysPressed()) return;
    
    // Handle various commands
    switch (e.code) {
      case config.startKey:
        if (isScrolling) {
          stopScrolling();
        } else {
          startScrolling();
        }
        e.preventDefault();
        break;
      
      case config.stopKey:
        stopScrolling();
        e.preventDefault();
        break;
      
      case config.fasterKey:
        changeSpeed(config.speedIncrement);
        e.preventDefault();
        break;
      
      case config.slowerKey:
        changeSpeed(-config.speedIncrement);
        e.preventDefault();
        break;
      
      case config.resetSpeedKey:
        resetSpeed();
        e.preventDefault();
        break;
      
      case config.upKey:
        toggleScrollDirection();
        e.preventDefault();
        break;
    }
  };

  // Key up event handler
  const handleKeyUp = (e) => {
    controlKeysPressed.delete(e.code);
  };

  // Add event listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Show initial instruction on script load
  setTimeout(() => {
    updateIndicator(`Press ${config.controlKeys.length > 0 ? 'Shift+' : ''}S to start smooth scrolling`);
  }, 1000);
  
  // Cleanup function if needed
  const cleanup = () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  };
  
  // Expose public API (optional)
  window.SmoothScroller = {
    start: startScrolling,
    stop: stopScrolling,
    speedUp: () => changeSpeed(config.speedIncrement),
    slowDown: () => changeSpeed(-config.speedIncrement),
    resetSpeed: resetSpeed,
    toggleDirection: toggleScrollDirection,
    cleanup: cleanup,
    setSpeed: (speed) => {
      scrollSpeed = Math.max(config.minSpeed, Math.min(config.maxSpeed, speed));
      updateIndicator(`Speed set to: ${scrollSpeed.toFixed(1)}`);
    }
  };
})(); 