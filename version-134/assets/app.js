(function () {
  var root = document.body.getAttribute("data-root") || "./";

  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  var toggle = $("[data-mobile-toggle]");
  var mobileNav = $("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  $all("[data-search-input]").forEach(function (input) {
    var box = input.parentElement.querySelector("[data-search-suggest]");

    function render() {
      var query = input.value.trim().toLowerCase();
      if (!box || !query || !window.SEARCH_INDEX) {
        if (box) {
          box.classList.remove("is-open");
          box.innerHTML = "";
        }
        return;
      }

      var results = window.SEARCH_INDEX.filter(function (item) {
        return item.searchText.indexOf(query) !== -1;
      }).slice(0, 6);

      if (!results.length) {
        box.classList.remove("is-open");
        box.innerHTML = "";
        return;
      }

      box.innerHTML = results.map(function (item) {
        return "<a class=\"suggest-link\" href=\"" + root + item.link + "\">" +
          "<span class=\"suggest-title\">" + escapeHtml(item.title) + "</span>" +
          "<span class=\"suggest-desc\">" + escapeHtml(item.description) + "</span>" +
          "</a>";
      }).join("");
      box.classList.add("is-open");
    }

    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    input.addEventListener("blur", function () {
      window.setTimeout(function () {
        if (box) {
          box.classList.remove("is-open");
        }
      }, 180);
    });
  });

  $all("[data-local-search]").forEach(function (input) {
    var scope = document.querySelector(input.getAttribute("data-local-search"));
    if (!scope) {
      return;
    }

    var cards = $all("[data-filter-text]", scope);
    var empty = $("[data-no-result]");

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var matched = !query || card.getAttribute("data-filter-text").toLowerCase().indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    });
  });

  var carousel = $("[data-hero-carousel]");
  if (carousel) {
    var slides = $all("[data-hero-slide]", carousel);
    var dots = $all("[data-hero-dot]", carousel);
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  $all("[data-video-shell]").forEach(function (shell) {
    var video = $("video", shell);
    var cover = $("[data-play-cover]", shell);
    var src = shell.getAttribute("data-src");
    var loaded = false;
    var hlsInstance = null;

    function attach() {
      if (!video || !src || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });

      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
