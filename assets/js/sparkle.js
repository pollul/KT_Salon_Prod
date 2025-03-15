/**
 * Interactive Sparkle Effect for KT's Coiffure salon website
 * Adds floating sparkles that follow mouse movements and respond to clicks
 */

class Sparkle {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.count = options.count || 50;
    this.speed = options.speed || 1;
    this.minSize = options.minSize || 10;
    this.maxSize = options.maxSize || 20;
    this.mouseX = 0;
    this.mouseY = 0;
    this.sparkles = [];
    this.colors = options.colors || ['#FFD700', '#FFC0CB', '#ADD8E6', '#90EE90', '#FFFFFF', '#FFFACD'];
    this.isActive = false;
    
    // Create the canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'sparkle-canvas';
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas styles
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '10';
    
    // Append canvas to the container
    this.container.appendChild(this.canvas);
    
    // Set up event listeners
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    window.addEventListener('mousemove', this.trackMouse.bind(this));
    window.addEventListener('click', this.addSparkleExplosion.bind(this));
    window.addEventListener('touchmove', this.trackTouch.bind(this));
    window.addEventListener('touchstart', this.trackTouch.bind(this));
    window.addEventListener('touchend', this.addSparkleExplosion.bind(this));
    
    // Initialize
    this.resizeCanvas();
    this.initSparkles();
    this.isActive = true;
    this.animate();
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  trackMouse(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }
  
  trackTouch(e) {
    if (e.touches && e.touches[0]) {
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
      e.preventDefault();
    }
  }
  
  addSparkleExplosion(e) {
    const x = e.clientX || this.mouseX;
    const y = e.clientY || this.mouseY;
    
    // Create explosion of sparkles at click point
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100;
      
      this.sparkles.push({
        x: x,
        y: y,
        size: Math.random() * (this.maxSize - this.minSize) + this.minSize,
        speedX: Math.cos(angle) * (Math.random() * 5 + 2),
        speedY: Math.sin(angle) * (Math.random() * 5 + 2),
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        opacity: 1,
        targetX: x + Math.cos(angle) * distance,
        targetY: y + Math.sin(angle) * distance,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
  }
  
  initSparkles() {
    // Create initial sparkles
    for (let i = 0; i < this.count; i++) {
      this.sparkles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * (this.maxSize - this.minSize) + this.minSize,
        speedX: (Math.random() - 0.5) * this.speed,
        speedY: (Math.random() - 0.5) * this.speed,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        opacity: Math.random() * 0.5 + 0.3,
        targetX: null,
        targetY: null,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2
      });
    }
  }
  
  drawSparkle(sparkle) {
    this.ctx.save();
    this.ctx.translate(sparkle.x, sparkle.y);
    this.ctx.rotate(sparkle.rotation * Math.PI / 180);
    
    this.ctx.globalAlpha = sparkle.opacity;
    this.ctx.fillStyle = sparkle.color;
    
    // Draw a star shape
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144) * Math.PI / 180;
      const outerX = Math.cos(angle) * sparkle.size;
      const outerY = Math.sin(angle) * sparkle.size;
      const innerAngle = ((i * 144) + 72) * Math.PI / 180;
      const innerX = Math.cos(innerAngle) * (sparkle.size / 2.5);
      const innerY = Math.sin(innerAngle) * (sparkle.size / 2.5);
      
      if (i === 0) {
        this.ctx.moveTo(outerX, outerY);
      } else {
        this.ctx.lineTo(outerX, outerY);
      }
      
      this.ctx.lineTo(innerX, innerY);
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  updateSparkle(sparkle) {
    // Update position
    sparkle.x += sparkle.speedX;
    sparkle.y += sparkle.speedY;
    sparkle.rotation += sparkle.rotationSpeed;
    
    // If sparkle has a target (explosion sparkle)
    if (sparkle.targetX !== null && sparkle.targetY !== null) {
      // Move towards target position
      sparkle.x += (sparkle.targetX - sparkle.x) * 0.05;
      sparkle.y += (sparkle.targetY - sparkle.y) * 0.05;
      
      // Fade out
      sparkle.opacity -= 0.02;
      
      // Remove if fully faded
      return sparkle.opacity > 0;
    }
    
    // Mouse attraction for regular sparkles
    if (this.mouseX && this.mouseY) {
      const dx = this.mouseX - sparkle.x;
      const dy = this.mouseY - sparkle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        sparkle.speedX += dx * 0.001;
        sparkle.speedY += dy * 0.001;
      }
    }
    
    // Boundary checking
    if (sparkle.x < -sparkle.size) sparkle.x = this.canvas.width + sparkle.size;
    if (sparkle.x > this.canvas.width + sparkle.size) sparkle.x = -sparkle.size;
    if (sparkle.y < -sparkle.size) sparkle.y = this.canvas.height + sparkle.size;
    if (sparkle.y > this.canvas.height + sparkle.size) sparkle.y = -sparkle.size;
    
    // Apply drag effect
    sparkle.speedX *= 0.99;
    sparkle.speedY *= 0.99;
    
    // Regular sparkles don't get removed
    return true;
  }
  
  animate() {
    if (!this.isActive) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw sparkles
    this.sparkles = this.sparkles.filter(sparkle => {
      const keepSparkle = this.updateSparkle(sparkle);
      if (keepSparkle) {
        this.drawSparkle(sparkle);
      }
      return keepSparkle;
    });
    
    // Request next frame
    requestAnimationFrame(this.animate.bind(this));
  }
  
  start() {
    if (!this.isActive) {
      this.isActive = true;
      this.animate();
    }
  }
  
  stop() {
    this.isActive = false;
  }
}

// Initialize sparkle effect when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const sparkleEffect = new Sparkle({
    count: 40,
    colors: ['#FFD700', '#FFC0CB', '#ADD8E6', '#90EE90', '#FFFFFF', '#FCE4EC'],
    minSize: 5,
    maxSize: 15
  });
}); 