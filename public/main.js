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
  const cursor = document.getElementById('custom-cursor');
  const muteToggle = document.getElementById('mute-toggle');
  const soundVisual = document.getElementById('sound-visual');
  let widget = null;
  let muted = false;
  let visualInterval = null;
  function updateSoundVisual(volume, playing) {
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
    if (visualInterval) clearInterval(visualInterval);
    visualInterval = setInterval(() => {
      updateSoundVisual(muted ? 0 : 100, !muted);
    }, 180);
  }
  // Hide default cursor on intro overlay
  intro.style.cursor = 'none';
  intro.addEventListener('mousemove', function(e) {
    cursor.style.left = (e.clientX + 10) + 'px';
    cursor.style.top = (e.clientY + 10) + 'px';
  });
  function setupSoundCloudPlayer(song) {
    const container = document.getElementById('soundcloud-player');
    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(song.url)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&loop=true`;
    iframe.width = '0';
    iframe.height = '0';
    iframe.frameBorder = 'no';
    iframe.scrolling = 'no';
    iframe.allow = 'autoplay';
    container.appendChild(iframe);
    // Retry logic to wait for SoundCloud API
    function tryInitWidget(retries = 15) {
      if (window.SC && window.SC.Widget) {
        widget = window.SC.Widget(iframe);
        muteToggle.style.display = 'block';
        soundVisual.style.display = 'block';
        soundVisual.textContent = '';
        startVisualPulse();
        widget.bind(window.SC.Widget.Events.READY, function () {});
        widget.bind(window.SC.Widget.Events.PLAY, function () {});
        muteToggle.onclick = function() {
          if (!widget) return;
          muted = !muted;
          widget.setVolume(muted ? 0 : 100);
          muteToggle.textContent = muted ? 'unmute' : 'mute';
          updateSoundVisual(muted ? 0 : 100, !muted);
        };
      } else if (retries > 0) {
        setTimeout(() => tryInitWidget(retries - 1), 150);
      } else {
        muteToggle.style.display = 'none';
        soundVisual.textContent = '[SoundCloud API failed]';
      }
    }
    tryInitWidget();
  }
  intro.addEventListener('click', function() {
    intro.style.display = 'none';
    main.style.display = '';
    setupSoundCloudPlayer(songData.songs[0]);
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
});
