class PageNavigation {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.threshold = 50; // minimum swipe distance
    this.currentPage = window.location.pathname;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateIndicator();
  }

  setupEventListeners() {
    const body = document.body;

    // Touch/mouse events for swipe
    if (body) {
      body.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
      body.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
      body.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
      
      body.addEventListener('mousedown', (e) => this.handleMouseDown(e));
      body.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      body.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.navigateToPage('/');
      } else if (e.key === 'ArrowRight') {
        this.navigateToPage('/about');
      }
    });
  }

  navigateToPage(path) {
    if (path !== this.currentPage) {
      window.location.href = path;
    }
  }

  updateIndicator() {
    const indicator = document.querySelector('.slider-indicator');
    const tabs = document.querySelectorAll('.slider-tab');
    
    if (indicator && tabs.length > 0) {
      let activeTab = null;
      
      // Find the active tab based on current page
      tabs.forEach(tab => {
        if (tab.href && tab.href.endsWith(this.currentPage)) {
          activeTab = tab;
        } else if (this.currentPage === '/' && tab.href && tab.href.endsWith('/')) {
          activeTab = tab;
        }
      });
      
      if (activeTab) {
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = activeTab.parentElement.getBoundingClientRect();
        
        const left = tabRect.left - containerRect.left;
        const width = tabRect.width;
        
        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
      }
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
        // Swipe left - go to about page
        this.navigateToPage('/about');
      } else {
        // Swipe right - go to images page
        this.navigateToPage('/');
      }
    }
    
    this.startX = 0;
    this.startY = 0;
  }

  // Mouse events (for desktop)
  handleMouseDown(e) {
    // Only handle if not clicking on a link or interactive element
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.tagName === 'IMG') {
      return;
    }
    
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
        // Drag left - go to about page
        this.navigateToPage('/about');
      } else {
        // Drag right - go to images page
        this.navigateToPage('/');
      }
    }
    
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
  }

  // Handle window resize
  handleResize() {
    this.updateIndicator();
  }
}

// Initialize page navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pageNavigation = new PageNavigation();
  
  // Handle resize
  window.addEventListener('resize', () => {
    if (window.pageNavigation) {
      window.pageNavigation.handleResize();
    }
  });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.pageNavigation) {
    window.pageNavigation = null;
  }
});
