(function() {
  var toggle = document.getElementById('mobileToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() {
      showSlide(i);
    });
  });

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  if (prev) {
    prev.addEventListener('click', function() {
      showSlide(current - 1);
    });
  }
  if (next) {
    next.addEventListener('click', function() {
      showSlide(current + 1);
    });
  }
  if (slides.length) {
    showSlide(0);
    setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  var grid = document.querySelector('.library-grid');
  var keyword = document.getElementById('keyword');
  var typeFilter = document.getElementById('typeFilter');
  var regionFilter = document.getElementById('regionFilter');
  var yearFilter = document.getElementById('yearFilter');
  var emptyTip = document.querySelector('.empty-tip');

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters() {
    if (!grid) {
      return;
    }
    var q = normalize(keyword && keyword.value);
    var type = normalize(typeFilter && typeFilter.value);
    var region = normalize(regionFilter && regionFilter.value);
    var year = normalize(yearFilter && yearFilter.value);
    var shown = 0;
    Array.prototype.slice.call(grid.querySelectorAll('.movie-card')).forEach(function(card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));
      var ok = true;
      if (q && haystack.indexOf(q) === -1) {
        ok = false;
      }
      if (type && normalize(card.dataset.type).indexOf(type) === -1) {
        ok = false;
      }
      if (region && normalize(card.dataset.region).indexOf(region) === -1) {
        ok = false;
      }
      if (year && normalize(card.dataset.year) !== year) {
        ok = false;
      }
      card.style.display = ok ? '' : 'none';
      if (ok) {
        shown += 1;
      }
    });
    if (emptyTip) {
      emptyTip.style.display = shown ? 'none' : 'block';
    }
  }

  if (keyword || typeFilter || regionFilter || yearFilter) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && keyword) {
      keyword.value = q;
    }
    [keyword, typeFilter, regionFilter, yearFilter].forEach(function(el) {
      if (el) {
        el.addEventListener('input', applyFilters);
        el.addEventListener('change', applyFilters);
      }
    });
    applyFilters();
  }
})();
