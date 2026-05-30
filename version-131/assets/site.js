(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggles = document.querySelectorAll("[data-menu-toggle]");
    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var target = document.querySelector(toggle.getAttribute("data-menu-toggle"));
        if (target) {
          target.classList.toggle("is-open");
        }
      });
    });

    var sliders = document.querySelectorAll("[data-hero-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var current = 0;

      function setSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          setSlide(index);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          setSlide(current + 1);
        }, 5200);
      }
    });

    var searchInputs = document.querySelectorAll("[data-search-input]");
    searchInputs.forEach(function (input) {
      var scopeSelector = input.getAttribute("data-search-scope") || "body";
      var scope = document.querySelector(scopeSelector) || document;
      var filterSelector = input.getAttribute("data-filter-select");
      var filter = filterSelector ? document.querySelector(filterSelector) : null;
      var empty = document.querySelector(input.getAttribute("data-empty-target") || "");

      function applyFilter() {
        var term = input.value.trim().toLowerCase();
        var selected = filter ? filter.value : "";
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || "").toLowerCase();
          var category = card.getAttribute("data-category") || "";
          var matchedText = term === "" || text.indexOf(term) !== -1;
          var matchedCategory = selected === "" || selected === category;
          var show = matchedText && matchedCategory;
          card.classList.toggle("is-hidden", !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible === 0 ? "block" : "none";
        }
      }

      input.addEventListener("input", applyFilter);
      if (filter) {
        filter.addEventListener("change", applyFilter);
      }
    });
  });

  window.setupPlayer = function (videoId, coverId, buttonId, url) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    var loaded = false;
    var instance = null;

    if (!video || !url) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(url);
        instance.attachMedia(video);
      } else {
        video.src = url;
      }

      loaded = true;
    }

    function play() {
      load();
      if (cover) {
        cover.classList.add("hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (instance && typeof instance.destroy === "function") {
        instance.destroy();
      }
    });
  };
})();
