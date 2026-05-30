(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function findAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.getElementById("mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero-frame");
        if (!hero) {
            return;
        }
        var slides = findAll(".hero-slide", hero);
        var dots = findAll(".hero-dot", hero);
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearch(inputId, panelId) {
        var input = document.getElementById(inputId);
        var panel = document.getElementById(panelId);
        if (!input || !panel || typeof MOVIE_SEARCH_INDEX === "undefined") {
            return;
        }

        function close() {
            panel.classList.remove("is-open");
            panel.innerHTML = "";
        }

        function render(items, query) {
            if (!query) {
                close();
                return;
            }
            panel.classList.add("is-open");
            if (!items.length) {
                panel.innerHTML = "<p>未找到相关影片</p>";
                return;
            }
            panel.innerHTML = items.slice(0, 8).map(function (item) {
                return "<a href=\"" + item.url + "\"><strong>" + escapeHtml(item.title) + "</strong><em>" + escapeHtml(item.year + " · " + item.region + " · " + item.oneLine) + "</em></a>";
            }).join("");
        }

        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                close();
                return;
            }
            var results = MOVIE_SEARCH_INDEX.filter(function (item) {
                return [item.title, item.year, item.region, item.type, item.genre, item.oneLine].join(" ").toLowerCase().indexOf(query) !== -1;
            });
            render(results, query);
        });

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                var first = panel.querySelector("a");
                if (first) {
                    window.location.href = first.getAttribute("href");
                }
            }
            if (event.key === "Escape") {
                close();
            }
        });

        document.addEventListener("click", function (event) {
            if (!panel.contains(event.target) && event.target !== input) {
                close();
            }
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupCatalogFilter() {
        var root = document.querySelector(".catalog-filter");
        if (!root) {
            return;
        }
        var keyword = root.querySelector("[data-filter-keyword]");
        var year = root.querySelector("[data-filter-year]");
        var type = root.querySelector("[data-filter-type]");
        var cards = findAll(".movie-card");
        var empty = document.querySelector(".empty-state");

        function apply() {
            var keywordValue = keyword ? keyword.value.trim().toLowerCase() : "";
            var yearValue = year ? year.value : "";
            var typeValue = type ? type.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre].join(" ").toLowerCase();
                var matchKeyword = !keywordValue || haystack.indexOf(keywordValue) !== -1;
                var matchYear = !yearValue || card.dataset.year === yearValue;
                var matchType = !typeValue || card.dataset.type.indexOf(typeValue) !== -1;
                var show = matchKeyword && matchYear && matchType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [keyword, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch("site-search", "search-panel");
        setupSearch("mobile-site-search", "mobile-search-panel");
        setupCatalogFilter();
    });
})();

function initializePlayer(source) {
    var video = document.getElementById("movie-player");
    var cover = document.querySelector(".player-cover");
    if (!video || !source) {
        return;
    }
    var loaded = false;
    var hlsInstance = null;

    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        load();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
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
