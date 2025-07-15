let songData = {
  songs: [
    {
      url: 'https://soundcloud.com/crisvalk/heavy-metal-drum-solo-by-dario-scussel?si=72ca8f20bbe04f179ecb95127294ab7e&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
      title: 'Heavy Metal Guitar Shred Solo',
      author: 'Ronimal'
    }
  ]
};

function initNavIndicator() {
  const indicator = document.querySelector('.slider-indicator');
  const tabs = document.querySelectorAll('.slider-tab');
  
  function moveIndicator(activeTab) {
    if (!indicator || !activeTab) return;
    const tabRect = activeTab.getBoundingClientRect();
    const parentRect = activeTab.parentElement.getBoundingClientRect();
    
    indicator.style.width = `${tabRect.width}px`;
    indicator.style.left = `${tabRect.left - parentRect.left}px`;
  }

  const activeTab = document.querySelector('.slider-tab.active');
  if (activeTab) {
    // Initial position
    setTimeout(() => moveIndicator(activeTab), 50);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // We don't need to move it on click because the page transition will handle it.
      // The 'astro:after-swap' event will re-run this whole logic.
    });
  });
  
  window.addEventListener('resize', () => {
    const currentActiveTab = document.querySelector('.slider-tab.active');
    if (currentActiveTab) {
      moveIndicator(currentActiveTab);
    }
  });
}

function initGalleryFeatures() {
  // Update nav active state
  const currentPath = window.location.pathname;
  document.querySelectorAll('.slider-tab').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Initialize the nav indicator
  initNavIndicator();

  const intro = document.getElementById('intro-overlay');
  const main = document.getElementById('main-content');
  const muteToggle = document.getElementById('mute-toggle');
  const soundVisual = document.getElementById('sound-visual');
  const soundControls = document.getElementById('soundcloud-controls');
  const galleryGrid = document.querySelector('.gallery-grid');
  const overlay = document.getElementById('lightbox-overlay');
  const imagesSection = document.getElementById('images-section');

  let widget = null;
  let muted = false;
  let visualInterval = null;

  // --- Intro & Three.js ---
  if (intro) {
    // Initialize the Three.js scene with a delay to ensure the module is loaded
    function initThreeJSWhenReady() {
      if (window.threeScene && typeof window.threeScene.init === 'function') {
        window.threeScene.init();
      } else {
        setTimeout(initThreeJSWhenReady, 100);
      }
    }
    initThreeJSWhenReady();

    // Hide default cursor on intro overlay
    intro.style.cursor = 'none';

    intro.addEventListener('click', function() {
      intro.style.display = 'none';
      if (main) main.style.display = '';
      if (soundControls) setupSoundCloudPlayer(songData.songs[0]);
      alignSoundControls(); // Align controls after main content is visible
    });
  }

  // --- SoundCloud Player ---
  function updateSoundVisual(volume, playing) {
    if (!soundVisual) return;
    // One-line equalizer: 10 bars, each with a height char
    const barCount = 10;
    const chars = [' ', '.', ':', 'l', 'I', '!', '|']; // Increasing height
    let bars = [];
    if (!playing || volume === 0) {
      bars = Array(barCount).fill(' ');
    } else {
      for (let i = 0; i < barCount; i++) {
        const h = Math.floor(Math.random() * (chars.length - 1)) + 1;
        bars.push(chars[h]);
      }
    }
    soundVisual.textContent = bars.join('');
  }

  function startVisualPulse() {
    if (!soundVisual) return;
    if (visualInterval) clearInterval(visualInterval);
    visualInterval = setInterval(() => {
      updateSoundVisual(muted ? 0 : 100, !muted);
    }, 100);
  }

  function setupSoundCloudPlayer(song) {
    const container = document.getElementById('soundcloud-player');
    if (!container) return;

    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(song.url)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&loop=true`;
    iframe.width = '0';
    iframe.height = '0';
    iframe.frameBorder = 'no';
    iframe.scrolling = 'no';
    iframe.allow = 'autoplay';
    container.appendChild(iframe);

    // Wait for SC.Widget to be available, then set up mute button
    function waitForWidget(retries = 30) {
      if (window.SC && window.SC.Widget) {
        widget = window.SC.Widget(iframe);
        if (muteToggle) muteToggle.style.display = 'block';
        if (soundVisual) {
          soundVisual.style.display = 'block';
          soundVisual.textContent = '';
        }
        startVisualPulse();
        widget.bind(window.SC.Widget.Events.READY, function() {
          // Set initial volume and button state
          widget.setVolume(muted ? 0 : 100);
          if (muteToggle) muteToggle.textContent = muted ? 'unmute' : 'mute';
        });

        if (muteToggle) {
          muteToggle.onclick = function() {
            if (!widget) return;
            muted = !muted;
            widget.setVolume(muted ? 0 : 100);
            muteToggle.textContent = muted ? 'unmute' : 'mute';
            updateSoundVisual(muted ? 0 : 100, !muted);
          };
        }
      } else if (retries > 0) {
        setTimeout(() => waitForWidget(retries - 1), 100);
      } else {
        if (muteToggle) muteToggle.style.display = 'none';
        // If iframe is present, show static visualizer bar as fallback
        if (container.querySelector('iframe') && soundVisual) {
          soundVisual.textContent = '| | | | | | | | | |';
        } else if (soundVisual) {
          soundVisual.textContent = '[SoundCloud API failed]';
        }
      }
    }
    waitForWidget();
  }

  // If not showing intro, and on gallery page, start sound immediately.
  if ((!intro || intro.style.display === 'none') && galleryGrid) {
    setupSoundCloudPlayer(songData.songs[0]);
  }


  // --- Lightbox ---
  if (overlay) {
    const img = document.getElementById('lightbox-img');
    let currentIdx = 0;

    function getAllThumbs() {
      return Array.from(document.querySelectorAll('.lightbox-thumb'));
    }

    function showLightbox(clickedThumb) {
      const thumbs = getAllThumbs();
      const idx = thumbs.indexOf(clickedThumb);
      if (idx === -1 || !img) return;

      img.src = clickedThumb.getAttribute('data-url');
      img.alt = clickedThumb.getAttribute('data-alt');
      
      // Position the overlay at the current scroll position
      overlay.style.top = `${window.scrollY}px`;
      
      overlay.style.display = 'flex';
      setTimeout(() => {
        overlay.style.opacity = '1';
        img.style.transform = 'scale(1)';
      }, 10);
      currentIdx = idx;
    }

    // Use event delegation instead of attaching individual listeners
    if (galleryGrid) {
      galleryGrid.addEventListener('click', function(e) {
        if (e.target.classList.contains('lightbox-thumb')) {
          showLightbox(e.target);
        }
      });
    }

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay && img) {
        overlay.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        setTimeout(() => {
          overlay.style.display = 'none';
          img.src = '';
        }, 300);
      }
    });

    document.addEventListener('keydown', function(e) {
      if (overlay.style.display === 'flex') {
        const thumbs = getAllThumbs();
        if (e.key === 'ArrowLeft') {
          const newIdx = (currentIdx - 1 + thumbs.length) % thumbs.length;
          showLightbox(thumbs[newIdx]);
        } else if (e.key === 'ArrowRight') {
          const newIdx = (currentIdx + 1) % thumbs.length;
          showLightbox(thumbs[newIdx]);
        } else if (e.key === 'Escape' && img) {
          overlay.style.opacity = '0';
          img.style.transform = 'scale(0.95)';
          setTimeout(() => {
            overlay.style.display = 'none';
            img.src = '';
          }, 300);
        }
      }
    });
  }


  // --- Sound Control Alignment ---
  function alignSoundControls() {
    // Re-query inside function to ensure we have the latest elements after nav
    const currentGalleryGrid = document.querySelector('.gallery-grid');
    const currentSoundControls = document.getElementById('soundcloud-controls');
    if (currentGalleryGrid && currentSoundControls && currentGalleryGrid.offsetParent !== null) {
      const rect = currentGalleryGrid.getBoundingClientRect();
      const rightMargin = window.innerWidth - rect.right;
      currentSoundControls.style.right = `${rightMargin}px`;
    }
  }

  // Align on resize, but only if on the gallery page
  if (galleryGrid) {
    alignSoundControls();
    window.addEventListener('resize', alignSoundControls);
  }


  // --- Infinite scroll for gallery ---
  function initInfiniteScroll() {
    // Re-query grid here
    const grid = document.querySelector('.gallery-grid');
    if (!grid || !window.galleryData || !window.galleryData.allPosts) {
      return;
    }

    const allPosts = window.galleryData.allPosts;
    const PAGE_SIZE = window.galleryData.PAGE_SIZE || 120;
    let loaded = PAGE_SIZE; // Initial batch already loaded
    let loading = false;

    function appendImages() {
      if (loading || allPosts.length === 0) return;
      loading = true;

      // Repeat images infinitely by cycling through allPosts
      for (let i = 0; i < PAGE_SIZE; i++) {
        const post = allPosts[(loaded + i) % allPosts.length];
        if (!post || !post.mainImage || !post.mainImage.asset) continue;

        const divEl = document.createElement('div');
        const imgEl = document.createElement('img');
        
        imgEl.className = 'lightbox-thumb';
        imgEl.src = post.mainImage.asset.url;
        imgEl.alt = post.title || 'Gallery image';
        imgEl.setAttribute('data-url', post.mainImage.asset.url);
        imgEl.setAttribute('data-alt', post.title || 'Gallery image');
        imgEl.loading = 'lazy';
        imgEl.decode = 'async';
        
        divEl.appendChild(imgEl);
        grid.appendChild(divEl);
      }
      loaded += PAGE_SIZE;
      loading = false;
    }

    function checkScroll() {
      // Check if the images-section is on the page
      const currentImagesSection = document.getElementById('images-section');
      if (!currentImagesSection) {
        // If not on gallery page, remove the scroll listener
        window.removeEventListener('scroll', checkScroll);
        return;
      }
      if (window.innerHeight + window.scrollY >= currentImagesSection.offsetHeight - 500) {
        appendImages();
      }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Initial check
  }

  // Only initialize infinite scroll if we are on the gallery page
  if (imagesSection) {
    initInfiniteScroll();
  }
}

// This function should be defined once globally
function handleAstroPageLoad() {
  // Re-initialize all features, which now includes internal checks for page-specific elements
  initGalleryFeatures();
}

// Use astro:page-load which fires after new page is loaded and visible
document.removeEventListener('astro:page-load', handleAstroPageLoad);
document.addEventListener('astro:page-load', handleAstroPageLoad);

// Initial load
initGalleryFeatures();
