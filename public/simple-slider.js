class SimpleSlider {
  constructor() {
    this.currentSection = 0;
    this.isAnimating = false;
    this.startX = 0;
    this.startY = 0;
    this.threshold = 50; // minimum swipe distance
    
    this.init();
  }

  init() {
    this.setupSlider();
    this.setupEventListeners();
    this.updateIndicator();
  }

  setupSlider() {
    const container = document.getElementById('slider-container');
    const sections = document.querySelectorAll('.slider-section');
    
    if (!container || sections.length === 0) return;

    // Set up container for horizontal sliding
    container.style.display = 'flex';
    container.style.width = '200%'; // 2 sections = 200%
    container.style.height = '100%';
    container.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    container.style.transform = 'translateX(0)';

    // Set up each section
    sections.forEach((section, index) => {
      section.style.width = '50%'; // Each section takes 50% of container
      section.style.height = '100%';
      section.style.flexShrink = '0';
    });
  }

  setupEventListeners() {
    const tabs = document.querySelectorAll('.slider-tab');
    const container = document.getElementById('slider-container');

    // Tab click events
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        this.goToSection(index);
      });
    });

    // Touch/mouse events for swipe
    if (container) {
      container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
      container.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
      container.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
      
      container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
      container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      container.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.goToSection(Math.max(0, this.currentSection - 1));
      } else if (e.key === 'ArrowRight') {
        this.goToSection(Math.min(1, this.currentSection + 1));
      }
    });
  }

  goToSection(sectionIndex) {
    if (this.isAnimating || sectionIndex === this.currentSection) return;
    
    this.isAnimating = true;
    this.currentSection = sectionIndex;
    
    const container = document.getElementById('slider-container');
    const targetX = -sectionIndex * 50; // Each section is 50% wide
    
    container.style.transform = `translateX(${targetX}%)`;
    
    this.updateTabs();
    this.updateIndicator();
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 600); // Match transition duration
  }

  updateTabs() {
    const tabs = document.querySelectorAll('.slider-tab');
    tabs.forEach((tab, index) => {
      if (index === this.currentSection) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  updateIndicator() {
    const indicator = document.querySelector('.slider-indicator');
    const tabs = document.querySelectorAll('.slider-tab');
    
    if (indicator && tabs.length > 0) {
      const activeTab = tabs[this.currentSection];
      const tabRect = activeTab.getBoundingClientRect();
      const containerRect = activeTab.parentElement.getBoundingClientRect();
      
      const left = tabRect.left - containerRect.left;
      const width = tabRect.width;
      
      indicator.style.left = `${left}px`;
      indicator.style.width = `${width}px`;
    }
  }

  // Touch events
  handleTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  }

  handleTouchMove(e) {
    if (!this.startX || !this.startY) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const diffX = this.startX - currentX;
    const diffY = this.startY - currentY;
    
    // Only handle horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault();
    }
  }

  handleTouchEnd(e) {
    if (!this.startX || !this.startY) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = this.startX - endX;
    
    if (Math.abs(diffX) > this.threshold) {
      if (diffX > 0) {
        // Swipe left - go to next section
        this.goToSection(Math.min(1, this.currentSection + 1));
      } else {
        // Swipe right - go to previous section
        this.goToSection(Math.max(0, this.currentSection - 1));
      }
    }
    
    this.startX = 0;
    this.startY = 0;
  }

  // Mouse events (for desktop)
  handleMouseDown(e) {
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.isDragging = true;
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    const currentX = e.clientX;
    const diffX = this.startX - currentX;
    
    // Only handle significant horizontal movement
    if (Math.abs(diffX) > Math.abs(this.startY - e.clientY)) {
      e.preventDefault();
    }
  }

  handleMouseUp(e) {
    if (!this.isDragging) return;
    
    const endX = e.clientX;
    const diffX = this.startX - endX;
    
    if (Math.abs(diffX) > this.threshold) {
      if (diffX > 0) {
        // Drag left - go to next section
        this.goToSection(Math.min(1, this.currentSection + 1));
      } else {
        // Drag right - go to previous section
        this.goToSection(Math.max(0, this.currentSection - 1));
      }
    }
    
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
  }

  // Handle window resize
  handleResize() {
    if (this.isAnimating) return;
    
    this.updateIndicator();
  }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.simpleSlider = new SimpleSlider();
  
  // Handle resize
  window.addEventListener('resize', () => {
    if (window.simpleSlider) {
      window.simpleSlider.handleResize();
    }
  });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.simpleSlider) {
    window.simpleSlider = null;
  }
});
