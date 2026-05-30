(function () {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  function setHeaderState() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      document.body.classList.toggle('is-menu-open');
    });
  }

  document.querySelectorAll('[data-search-root]').forEach(function (root) {
    const input = root.querySelector('[data-search-input]');
    const results = root.querySelector('[data-search-results]');

    if (!input || !results || !Array.isArray(window.SITE_SEARCH_DATA)) {
      return;
    }

    function closeResults() {
      results.classList.remove('is-open');
      results.innerHTML = '';
    }

    input.addEventListener('input', function () {
      const keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        closeResults();
        return;
      }

      const matches = window.SITE_SEARCH_DATA.filter(function (item) {
        return item.title.toLowerCase().includes(keyword) ||
          item.region.toLowerCase().includes(keyword) ||
          item.genre.toLowerCase().includes(keyword) ||
          item.tags.toLowerCase().includes(keyword) ||
          item.desc.toLowerCase().includes(keyword);
      }).slice(0, 8);

      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">没有找到相关作品</div>';
        results.classList.add('is-open');
        return;
      }

      results.innerHTML = matches.map(function (item) {
        return '<a href="' + item.url + '"><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.year + ' · ' + item.genre + '</span></a>';
      }).join('');
      results.classList.add('is-open');
    });

    input.addEventListener('focus', function () {
      if (results.innerHTML.trim()) {
        results.classList.add('is-open');
      }
    });

    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) {
        closeResults();
      }
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  });

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    const buttons = Array.from(root.querySelectorAll('[data-filter]'));
    const grid = root.parentElement.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll('[data-region]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');

        const filter = button.getAttribute('data-filter');
        cards.forEach(function (card) {
          let visible = true;
          if (filter !== 'all') {
            const parts = filter.split(':');
            const key = parts[0];
            const value = parts.slice(1).join(':');
            visible = card.getAttribute('data-' + key) === value;
          }
          card.classList.toggle('is-hidden', !visible);
        });
      });
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const source = player.getAttribute('data-src');
    let ready = false;
    let hls = null;

    function attachMedia() {
      if (ready || !video || !source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        ready = true;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
      }
    }

    function start() {
      attachMedia();
      player.classList.add('is-playing');
      const playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          player.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
