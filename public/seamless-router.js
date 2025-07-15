class SeamlessRouter {
  constructor() {
    this.currentSection = window.location.pathname === '/about' ? 1 : 0;
    this.isAnimating = false;
    this.startX = 0;
    this.startY = 0;
    this.threshold = 50;
    this.isDragging = false;
    
    this.init();
  }
  
  init() {
    this.createSeamlessLayout();
    this.setupEventListeners();
    this.updateIndicator();
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      const newSection = window.location.pathname === '/about' ? 1 : 0;
      this.navigateToSection(newSection, false);
    });
  }
  
  createSeamlessLayout() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    // Store the original gallery content
    const originalContent = mainContent.innerHTML;
    
    // Create slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.id = 'seamless-slider';
    sliderContainer.style.cssText = `
      display: flex;
      width: 200vw;
      height: 100vh;
      overflow: hidden;
      position: relative;
      transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `;
    
    // Create gallery section - takes full viewport width
    const gallerySection = document.createElement('div');
    gallerySection.className = 'seamless-section';
    gallerySection.id = 'gallery-section';
    gallerySection.style.cssText = `
      width: 100vw;
      height: 100vh;
      overflow-y: auto;
      flex-shrink: 0;
      position: relative;
    `;
    gallerySection.innerHTML = originalContent;
    
    // Create about section - also takes full viewport width
    const aboutSection = document.createElement('div');
    aboutSection.className = 'seamless-section';
    aboutSection.id = 'about-section';
    aboutSection.style.cssText = `
      width: 100vw;
      height: 100vh;
      overflow-y: auto;
      flex-shrink: 0;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 20, 40, 0.9) 100%);
      position: relative;
    `;
    
    // Generate about content using available data
    const aboutContent = window.galleryData?.aboutContent;
    aboutSection.innerHTML = this.generateAboutHTML(aboutContent);
    
    // Assemble the structure
    sliderContainer.appendChild(gallerySection);
    sliderContainer.appendChild(aboutSection);
    
    // Replace main content
    mainContent.innerHTML = '';
    mainContent.appendChild(sliderContainer);
    
    // Set initial position based on current route
    this.updateSliderPosition(false);
  }
  
  generateAboutHTML(aboutContent) {
    return `
      <div class="about-content">
        <h1>About Domain King</h1>
        <p>Welcome to Domain King - a cutting-edge photography showcase that pushes the boundaries of visual storytelling and digital art.</p>
        
        <div class="features-grid">
          <div class="feature-card">
            <h3>Infinite Gallery</h3>
            <p>Experience seamless browsing through our curated collection with intelligent infinite scroll technology.</p>
          </div>
          
          <div class="feature-card">
            <h3>Interactive Experience</h3>
            <p>Immerse yourself in a responsive, touch-friendly interface designed for modern devices.</p>
          </div>
          
          <div class="feature-card">
            <h3>Curated Content</h3>
            <p>Every image is carefully selected and optimized for the ultimate viewing experience.</p>
          </div>
          
          <div class="feature-card">
            <h3>Performance First</h3>
            <p>Built with cutting-edge web technologies for lightning-fast load times and smooth interactions.</p>
          </div>
        </div>
        
        ${aboutContent ? `
          <div class="sanity-content">
            <h2>${aboutContent.title || 'Our Story'}</h2>
            <p>${aboutContent.description || 'Discover the vision behind Domain King.'}</p>
          </div>
        ` : ''}
        
        <div class="contact-section">
          <h3>Get in Touch</h3>
          <p>Ready to collaborate or have questions? We'd love to hear from you.</p>
        </div>
      </div>
    `;
  }
  
  setupEventListeners() {
    // Convert navigation tabs to work with sections instead of pages
    const tabs = document.querySelectorAll('.slider-tab');
    
    tabs.forEach((tab, index) => {
      // Remove any href attributes and make them buttons
      if (tab.tagName === 'A') {
        const button = document.createElement('button');
        button.className = tab.className;
        button.textContent = tab.textContent;
        button.setAttribute('data-section', index.toString());
        button.style.cssText = `
          background: none;
          border: none;
          color: inherit;
          font: inherit;
          cursor: pointer;
          padding: 10px 20px;
          position: relative;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          transition: color 0.3s ease;
          white-space: nowrap;
          user-select: none;
          z-index: 2;
          border-radius: 20px;
          text-decoration: none;
          display: inline-block;
        `;
        tab.parentNode.replaceChild(button, tab);
      } else {
        tab.setAttribute('data-section', index.toString());
      }
    });
    
    // Add click events to tabs
    document.addEventListener('click', (e) => {
      if (e.target.closest('.slider-tab')) {
        const tab = e.target.closest('.slider-tab');
        const section = parseInt(tab.getAttribute('data-section') || '0');
        this.navigateToSection(section, true);
      }
    });
    
    // Swipe and touch events
    const container = document.getElementById('seamless-slider');
    if (container) {
      container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
      container.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
      container.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
      
      container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
      container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      container.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.navigateToSection(0, true);
      } else if (e.key === 'ArrowRight') {
        this.navigateToSection(1, true);
      }
    });
    
    this.updateTabs();
  }
  
  navigateToSection(section, updateHistory = true) {
    if (this.isAnimating || section === this.currentSection) return;
    
    this.isAnimating = true;
    this.currentSection = section;
    
    // Update slider position with smooth transition
    this.updateSliderPosition(true);
    
    // Update URL and title
    if (updateHistory) {
      const newPath = section === 1 ? '/about' : '/';
      history.pushState({ section }, '', newPath);
      document.title = section === 1 ? 'About - DOMAIN KING' : 'DOMAIN KING';
    }
    
    this.updateTabs();
    this.updateIndicator();
    
    // Reset animation lock after transition
    setTimeout(() => {
      this.isAnimating = false;
    }, 800);
  }
  
  updateSliderPosition(animate = true) {
    const sliderContainer = document.getElementById('seamless-slider');
    if (!sliderContainer) return;
    
    // Move by full viewport width since each section is 100vw
    const translateX = this.currentSection === 1 ? '-100vw' : '0';
    
    if (animate) {
      // Use GSAP for smooth animation
      if (window.gsap) {
        gsap.to(sliderContainer, {
          x: translateX,
          duration: 0.8,
          ease: 'power2.inOut'
        });
      } else {
        // Fallback to CSS transition
        sliderContainer.style.transform = `translateX(${translateX})`;
      }
    } else {
      // Immediate positioning
      if (window.gsap) {
        gsap.set(sliderContainer, { x: translateX });
      } else {
        sliderContainer.style.transform = `translateX(${translateX})`;
        sliderContainer.style.transition = 'none';
        setTimeout(() => {
          sliderContainer.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 10);
      }
    }
  }
  
  updateTabs() {
    const tabs = document.querySelectorAll('.slider-tab');
    tabs.forEach((tab, index) => {
      if (index === this.currentSection) {
        tab.classList.add('active');
        tab.style.color = 'rgba(255, 255, 255, 1)';
      } else {
        tab.classList.remove('active');
        tab.style.color = 'rgba(255, 255, 255, 0.6)';
      }
    });
  }
  
  updateIndicator() {
    const indicator = document.querySelector('.slider-indicator');
    const tabs = document.querySelectorAll('.slider-tab');
    
    if (indicator && tabs.length > 0) {
      const activeTab = tabs[this.currentSection];
      if (activeTab) {
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = activeTab.parentElement.getBoundingClientRect();
        const left = tabRect.left - containerRect.left;
        const width = tabRect.width;
        
        if (window.gsap) {
          gsap.to(indicator, {
            left: left,
            width: width,
            duration: 0.3,
            ease: 'power2.out'
          });
        } else {
          indicator.style.left = left + 'px';
          indicator.style.width = width + 'px';
        }
      }
    }
  }
  
  // Touch and mouse event handlers
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
        this.navigateToSection(1, true);  // Swipe left -> About
      } else {
        this.navigateToSection(0, true);  // Swipe right -> Gallery
      }
    }
    
    this.startX = 0;
    this.startY = 0;
  }
  
  handleMouseDown(e) {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'IMG' || e.target.tagName === 'A') return;
    
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.isDragging = true;
  }
  
  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    const currentX = e.clientX;
    const diffX = this.startX - currentX;
    
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
        this.navigateToSection(1, true);  // Drag left -> About
      } else {
        this.navigateToSection(0, true);  // Drag right -> Gallery
      }
    }
    
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.seamlessRouter = new SeamlessRouter();
});

export default SeamlessRouter;
