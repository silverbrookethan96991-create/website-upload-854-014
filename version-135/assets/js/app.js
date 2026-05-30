(function () {
  var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
  var hlsLoading = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      document.body.classList.toggle('menu-open', nav.classList.contains('open'));
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function textIncludes(haystack, needle) {
    if (!needle) {
      return true;
    }
    return String(haystack || '').toLowerCase().indexOf(String(needle || '').toLowerCase()) !== -1;
  }

  function setupFilters() {
    var sections = document.querySelectorAll('[data-filter-section]');
    sections.forEach(function (section) {
      var keywordInput = section.querySelector('.js-filter-input');
      var regionSelect = section.querySelector('.js-filter-region');
      var typeSelect = section.querySelector('.js-filter-type');
      var yearSelect = section.querySelector('.js-filter-year');
      var result = section.querySelector('.filter-result');
      var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));

      function apply() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        var region = regionSelect ? regionSelect.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
          var title = card.getAttribute('data-title') || '';
          var regionText = card.getAttribute('data-region') || '';
          var typeText = card.getAttribute('data-type') || '';
          var yearText = card.getAttribute('data-year') || '';
          var genreText = card.getAttribute('data-genre') || '';
          var allText = [title, regionText, typeText, yearText, genreText, card.textContent].join(' ').toLowerCase();
          var matched = textIncludes(allText, keyword)
            && textIncludes(regionText.toLowerCase(), region)
            && textIncludes(typeText.toLowerCase(), type)
            && textIncludes(yearText.toLowerCase(), year);
          card.classList.toggle('is-filter-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
        }
      }

      [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && keywordInput) {
        keywordInput.value = query;
      }
      apply();
    });
  }

  function loadHls(callback, errorCallback) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }
    if (!hlsLoading) {
      hlsLoading = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = HLS_CDN;
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = function () {
          reject(new Error('HLS 脚本加载失败'));
        };
        document.head.appendChild(script);
      });
    }
    hlsLoading.then(callback).catch(errorCallback);
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (player) {
      var source = player.getAttribute('data-video-src');
      var poster = player.getAttribute('data-poster');
      var button = player.querySelector('[data-play-button]');
      var video = player.querySelector('video');
      var message = player.querySelector('[data-player-message]');
      var hlsInstance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function playVideo() {
        if (!video || !source) {
          setMessage('未找到可用播放源');
          return;
        }
        if (button) {
          button.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        if (poster) {
          video.setAttribute('poster', poster);
        }
        setMessage('正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().then(function () {
            setMessage('');
          }).catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击视频播放。');
          });
          return;
        }

        loadHls(function (Hls) {
          if (Hls && Hls.isSupported()) {
            if (hlsInstance) {
              hlsInstance.destroy();
            }
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().then(function () {
                setMessage('');
              }).catch(function () {
                setMessage('浏览器阻止了自动播放，请再次点击视频播放。');
              });
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setMessage('播放源加载失败，请刷新页面后重试。');
              }
            });
          } else {
            video.src = source;
            video.play().catch(function () {
              setMessage('当前浏览器不支持 HLS 播放。');
            });
          }
        }, function () {
          video.src = source;
          video.play().catch(function () {
            setMessage('HLS 播放组件加载失败，当前浏览器可能无法播放 m3u8。');
          });
        });
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            video.play().catch(function () {});
          } else {
            video.pause();
          }
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
