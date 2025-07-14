let songData = {
  songs: [
    {
      url: 'https://soundcloud.com/crisvalk/heavy-metal-drum-solo-by-dario-scussel?si=72ca8f20bbe04f179ecb95127294ab7e&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
      title: 'Heavy Metal Guitar Shred Solo',
      author: 'Ronimal'
    }
  ]
};
document.addEventListener('DOMContentLoaded', function () {
  const intro = document.getElementById('intro-overlay');
  const main = document.getElementById('main-content');
  const muteToggle = document.getElementById('mute-toggle');
  const soundVisual = document.getElementById('sound-visual');
  let widget = null;
  let muted = false;
  let visualInterval = null;

  // Initialize the Three.js scene
  if (window.threeScene && typeof window.threeScene.init === 'function') {
    window.threeScene.init();
  }

  function updateSoundVisual(volume, playing) {
    // One-line equalizer: 10 bars, each with a height char
    const barCount = 10;
    const chars = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█']; // Unicode block characters
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
    if (visualInterval) clearInterval(visualInterval);
    visualInterval = setInterval(() => {
      updateSoundVisual(muted ? 0 : 100, !muted);
    }, 180);
  }

  function setupSoundCloudPlayer(song) {
    const container = document.getElementById('soundcloud-player');
    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(song.url)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&loop=true`;
    iframe.width = '1';
    iframe.height = '1';
    iframe.frameBorder = 'no';
    iframe.scrolling = 'no';
    iframe.allow = 'autoplay';
    container.appendChild(iframe);
    // Wait for SC.Widget to be available, then set up mute button
    function waitForWidget(retries = 30) {
      if (window.SC && window.SC.Widget) {
        widget = window.SC.Widget(iframe);
        muteToggle.style.display = 'block';
        soundVisual.style.display = 'block';
        soundVisual.textContent = '';
        startVisualPulse();
        widget.bind(window.SC.Widget.Events.READY, function () {
          // Set initial volume and button state
          widget.setVolume(muted ? 0 : 100);
          muteToggle.textContent = muted ? 'unmute' : 'mute';
        });
        muteToggle.onclick = function() {
          if (!widget) return;
          muted = !muted;
          widget.setVolume(muted ? 0 : 100);
          muteToggle.textContent = muted ? 'unmute' : 'mute';
          updateSoundVisual(muted ? 0 : 100, !muted);
        };
      } else if (retries > 0) {
        setTimeout(() => waitForWidget(retries - 1), 100);
      } else {
        muteToggle.style.display = 'none';
        // If iframe is present, show static visualizer bar as fallback
        if (container.querySelector('iframe')) {
          soundVisual.textContent = '▄▄▄▄▄▄▄▄▄▄';
        } else {
          soundVisual.textContent = '[SoundCloud API failed]';
        }
      }
    }
    waitForWidget();
  }

  const dismissIntro = () => {
    // Avoid running dismiss logic multiple times
    if (intro.style.display === 'none') return;

    intro.style.display = 'none';
    main.style.display = 'block';
    
    const soundControls = document.getElementById('soundcloud-controls');
    if (soundControls) {
        soundControls.style.display = 'flex';
    }

    // Destroy the Three.js scene to free up resources
    if (window.threeScene && typeof window.threeScene.destroy === 'function') {
        window.threeScene.destroy();
    }

    setupSoundCloudPlayer(songData.songs[0]);
  };

  intro.addEventListener('click', dismissIntro);

  let touchStartX = 0;
  let touchStartY = 0;
  const touchMoveThreshold = 10; // pixels

  intro.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
      }
  }, { passive: true });

  intro.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const deltaX = Math.abs(touchEndX - touchStartX);
          const deltaY = Math.abs(touchEndY - touchStartY);

          if (deltaX < touchMoveThreshold && deltaY < touchMoveThreshold) {
              dismissIntro();
          }
      }
  });

  const overlay = document.getElementById('lightbox-overlay');
  const img = document.getElementById('lightbox-img');
  const thumbs = Array.from(document.querySelectorAll('.lightbox-thumb'));
  let currentIdx = 0;
  function showLightbox(idx) {
    const thumb = thumbs[idx];
    if (!thumb) return;
    img.src = thumb.getAttribute('data-url');
    img.alt = thumb.getAttribute('data-alt');
    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.style.opacity = '1';
      img.style.transform = 'scale(1)';
    }, 10);
    currentIdx = idx;
  }
  thumbs.forEach(function(thumb, idx) {
    thumb.addEventListener('click', function() {
      showLightbox(idx);
    });
  });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
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
      if (e.key === 'ArrowLeft') {
        showLightbox((currentIdx - 1 + thumbs.length) % thumbs.length);
      } else if (e.key === 'ArrowRight') {
        showLightbox((currentIdx + 1) % thumbs.length);
      } else if (e.key === 'Escape') {
        overlay.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        setTimeout(() => {
          overlay.style.display = 'none';
          img.src = '';
        }, 300);
      }
    }
  });

  // --- Infinite Scroll ---
  let currentPage = 1;
  const PAGE_SIZE = window.galleryData.PAGE_SIZE;
  const allPosts = JSON.parse(window.galleryData.allPosts);
  let isLoading = false;

  function createGalleryItem(post) {
    const div = document.createElement('div');
    const img = document.createElement('img');
    img.className = 'lightbox-thumb';
    img.src = post.mainImage?.asset?.url;
    img.alt = post.title;
    img.setAttribute('data-url', post.mainImage?.asset?.url);
    img.setAttribute('data-alt', post.title);
    div.appendChild(img);
    return div;
  }

  function attachLightbox(img) {
    img.addEventListener('click', function() {
      const allThumbs = Array.from(document.querySelectorAll('.lightbox-thumb'));
      const idx = allThumbs.indexOf(img);
      showLightbox(idx);
    });
  }

  function loadNextPage(force = false) {
    if (isLoading) {
      console.log('Already loading, skipping.');
      return;
    }
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const nextPosts = allPosts.slice(start, end);
    console.log(`loadNextPage called. currentPage: ${currentPage}, start: ${start}, end: ${end}, nextPosts.length: ${nextPosts.length}`);
    if (nextPosts.length === 0 && !force) {
      console.log('No more posts to load.');
      return;
    }
    isLoading = true;
    const galleryGrid = document.querySelector('.gallery-grid');
    nextPosts.forEach((post, i) => {
      console.log(`Appending post idx: ${start + i}, title: ${post.title}`);
      const newItem = createGalleryItem(post);
      galleryGrid.appendChild(newItem);
      attachLightbox(newItem.querySelector('img'));
    });
    currentPage++;
    isLoading = false;
    console.log(`Finished loading page. currentPage is now: ${currentPage}`);
  }

  function fillViewport() {
    // Keep loading until the gallery fills the viewport or all posts are loaded
    let tries = 0;
    while (
      document.body.offsetHeight < window.innerHeight &&
      currentPage * PAGE_SIZE < allPosts.length
    ) {
      console.log(`fillViewport: body.offsetHeight=${document.body.offsetHeight}, window.innerHeight=${window.innerHeight}, currentPage=${currentPage}`);
      loadNextPage(true);
      tries++;
      if (tries > 20) {
        console.log('fillViewport: breaking after 20 tries to avoid infinite loop');
        break;
      }
    }
    console.log('fillViewport done');
  }

  window.addEventListener('scroll', () => {
    console.log(`Scroll event: window.innerHeight=${window.innerHeight}, window.scrollY=${window.scrollY}, document.body.offsetHeight=${document.body.offsetHeight}`);
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight &&
      currentPage * PAGE_SIZE < allPosts.length
    ) {
      console.log('Triggering loadNextPage from scroll');
      loadNextPage();
    }
  });

  window.addEventListener('DOMContentLoaded', fillViewport);
  setTimeout(fillViewport, 100);

  // Attach lightbox to initial images
  document.querySelectorAll('.lightbox-thumb').forEach(attachLightbox);
});
