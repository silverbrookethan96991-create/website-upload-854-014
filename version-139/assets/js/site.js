(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mainNav = document.querySelector("[data-main-nav]");

    if (menuButton && mainNav) {
        menuButton.addEventListener("click", function () {
            mainNav.classList.toggle("open");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let heroIndex = 0;
    let heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle("active", itemIndex === heroIndex);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle("active", itemIndex === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            if (heroTimer) {
                window.clearInterval(heroTimer);
            }
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        const input = scope.querySelector("[data-search-input]");
        const typeFilter = scope.querySelector("[data-type-filter]");
        const yearFilter = scope.querySelector("[data-year-filter]");
        const regionFilter = scope.querySelector("[data-region-filter]");
        const cards = Array.from(scope.querySelectorAll(".movie-card"));
        const empty = scope.querySelector("[data-empty-state]");

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }

        function applyFilter() {
            const query = valueOf(input);
            const typeValue = valueOf(typeFilter);
            const yearValue = valueOf(yearFilter);
            const regionValue = valueOf(regionFilter);
            let shown = 0;

            cards.forEach(function (card) {
                const haystack = (card.dataset.text || "").toLowerCase();
                const type = (card.dataset.type || "").toLowerCase();
                const year = (card.dataset.year || "").toLowerCase();
                const region = (card.dataset.region || "").toLowerCase();
                const matched = (!query || haystack.indexOf(query) !== -1)
                    && (!typeValue || type.indexOf(typeValue) !== -1)
                    && (!yearValue || year.indexOf(yearValue) !== -1)
                    && (!regionValue || region.indexOf(regionValue) !== -1);

                card.style.display = matched ? "" : "none";
                if (matched) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.style.display = shown ? "none" : "block";
            }
        }

        [input, typeFilter, yearFilter, regionFilter].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilter);
                element.addEventListener("change", applyFilter);
            }
        });
    });
})();
