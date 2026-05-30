(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var links = document.querySelector("[data-nav-links]");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    roots.forEach(function (root) {
      var search = root.querySelector("[data-filter-search]");
      var region = root.querySelector("[data-filter-region]");
      var type = root.querySelector("[data-filter-type]");
      var year = root.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
      var empty = root.querySelector("[data-empty-state]");

      function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
      }

      function apply() {
        var q = normalize(search && search.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var y = normalize(year && year.value);
        var shown = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var ok = true;

          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (r && cardRegion.indexOf(r) === -1) {
            ok = false;
          }
          if (t && cardType.indexOf(t) === -1) {
            ok = false;
          }
          if (y && cardYear !== y) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      [search, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });

  window.initMoviePlayer = function (videoId, coverId, src) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !src) {
      return;
    }

    function playNow() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    function loadAndPlay() {
      if (cover) {
        cover.classList.add("is-hidden");
      }

      if (loaded) {
        playNow();
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", playNow, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playNow);
        return;
      }

      video.src = src;
      video.addEventListener("loadedmetadata", playNow, { once: true });
      video.load();
    }

    if (cover) {
      cover.addEventListener("click", loadAndPlay);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        loadAndPlay();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };
})();
