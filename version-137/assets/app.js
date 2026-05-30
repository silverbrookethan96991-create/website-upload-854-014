(() => {
  const body = document.body;
  const toggle = document.querySelector('[data-mobile-toggle]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      body.classList.toggle('is-nav-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let active = 0;
    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    };
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => show(index));
    });
    if (slides.length > 1) {
      setInterval(() => show(active + 1), 5200);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-filter-input]') || document.querySelector('[data-filter-input]');
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
    if (!input || !cards.length) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const text = card.getAttribute('data-search') || '';
        card.classList.toggle('hidden-card', Boolean(q) && !text.includes(q));
      });
    });
  });

  const globalInput = document.getElementById('globalSearchInput');
  const globalResults = document.getElementById('globalSearchResults');
  if (globalInput && globalResults && Array.isArray(window.SITE_SEARCH_INDEX)) {
    const render = (items) => {
      globalResults.innerHTML = items.slice(0, 80).map((item) => `
        <article class="movie-card compact">
          <a class="poster-link" href="./${item.file}" aria-label="${escapeHtml(item.title)}">
            <img src="${item.cover}" alt="${escapeHtml(item.title)}" loading="lazy">
            <span class="poster-shine"></span>
          </a>
          <div class="movie-card-body">
            <div class="movie-meta">
              <span>${escapeHtml(item.year || '精选')}</span>
              <span>${escapeHtml(item.region)}</span>
              <span>${escapeHtml(item.type)}</span>
            </div>
            <h3><a href="./${item.file}">${escapeHtml(item.title)}</a></h3>
            <p>${escapeHtml(item.oneLine)}</p>
            <div class="tag-row">${item.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
          </div>
        </article>
      `).join('');
    };
    const search = () => {
      const q = globalInput.value.trim().toLowerCase();
      if (!q) {
        render(window.SITE_SEARCH_INDEX.slice(0, 40));
        return;
      }
      render(window.SITE_SEARCH_INDEX.filter((item) => item.search.includes(q)));
    };
    globalInput.addEventListener('input', search);
    search();
  }

  document.querySelectorAll('[data-video-player]').forEach((shell) => {
    const video = shell.querySelector('video');
    const cover = shell.querySelector('.player-cover');
    const stream = shell.getAttribute('data-stream');
    if (!video || !stream) return;

    const prepare = () => {
      if (shell.getAttribute('data-ready') === '1') return;
      shell.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        shell.hls = hls;
      } else {
        video.src = stream;
        video.load();
      }
    };

    const start = () => {
      prepare();
      if (cover) cover.classList.add('is-hidden');
      video.controls = true;
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {});
      }
    };

    prepare();
    if (cover) cover.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (video.paused) start();
    });
  });

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
