/* «За пределами возможного» — логика страницы. Без фреймворков. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var el = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function sphere(h) { return SPHERES[h.sphere] || ''; }

  /* меню на телефоне */
  var burger = el('burger'), menu = el('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* стена портретов */
  var wall = el('wall');
  if (wall) {
    var ordered = HEROINES.slice().sort(function (a, b) {
      var ya = parseInt(String(a.years).replace(/\D/g, '').slice(0, 4), 10) || 0;
      var yb = parseInt(String(b.years).replace(/\D/g, '').slice(0, 4), 10) || 0;
      return ya - yb;
    });
    wall.innerHTML = ordered.map(function (h) {
      return '<a class="tile" href="#record" data-id="' + esc(h.id) + '" data-sphere="' + esc(h.sphere) + '">' +
        '<span class="tile__photo">' +
          '<img src="' + esc(h.photo) + '" alt="' + esc(h.name) + '" loading="lazy">' +
          '<span class="tile__sphere">' + esc(sphere(h)) + '</span>' +
        '</span>' +
        '<h3>' + esc(h.name) + '</h3>' +
        '<time>' + esc(h.years) + '</time>' +
      '</a>';
    }).join('');

    var filter = el('filter');
    if (filter) {
      filter.innerHTML = CATEGORIES.map(function (c) {
        return '<button type="button" data-filter="' + c.id + '" aria-pressed="' + (c.id === 'all' ? 'true' : 'false') + '">' + esc(c.label) + '</button>';
      }).join('');
      filter.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('button[data-filter]') : null;
        if (!btn) return;
        var value = btn.getAttribute('data-filter');
        Array.prototype.forEach.call(filter.querySelectorAll('button'), function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        Array.prototype.forEach.call(wall.querySelectorAll('.tile'), function (t) {
          t.style.display = (value === 'all' || t.getAttribute('data-sphere') === value) ? '' : 'none';
        });
      });
    }
  }

  /* хроника */
  var chron = el('chronicleList');
  if (chron) {
    chron.innerHTML = CHRONICLE.map(function (c) {
      return '<li><time>' + esc(c.year) + '</time>' +
        '<div><h3>' + esc(c.title) + '</h3><p>' + esc(c.text) + '</p></div></li>';
    }).join('');
  }

  /* документы года */
  var docs = el('docsList');
  if (docs) {
    docs.innerHTML = DOCUMENTS.map(function (d) {
      return '<div><dt>' + esc(d.name) + '</dt><dd>' + esc(d.value) + '</dd></div>';
    }).join('');
  }

  /* источники */
  var src = el('sourcesList');
  if (src) {
    src.innerHTML = SOURCES.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a>' +
        '<span>' + esc(s.note) + '</span></li>';
    }).join('');
  }

  /* запись */
  var modal = el('modal'), modalBody = el('modalBody'), modalPhoto = el('modalPhoto'), lastFocus = null;

  function open(id) {
    var h = null;
    for (var i = 0; i < HEROINES.length; i++) if (HEROINES[i].id === id) h = HEROINES[i];
    if (!h || !modal) return;
    modalPhoto.innerHTML = '<img src="' + esc(h.photo) + '" alt="' + esc(h.name) + '">' +
      '<figcaption>' + esc(h.photoCaption || '') +
      (h.photoSource ? ' · <a href="' + esc(h.photoSource) + '" target="_blank" rel="noopener">источник</a>' : '') +
      '</figcaption>';
    modalBody.innerHTML = '<p class="caps">' + esc(sphere(h)) + '</p>' +
      '<h2 id="modalTitle">' + esc(h.name) + '</h2>' +
      '<p class="modal__role">' + esc(h.years) + ' · ' + esc(h.role) + '</p>' +
      '<p>' + esc(h.lead) + '</p>' +
      '<h3>Основные сведения</h3>' +
      '<ul class="facts">' + h.facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
      '<h3>Значение</h3>' +
      '<p class="modal__meaning">' + esc(h.meaning) + '</p>';
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var c = modal.querySelector('.modal__close');
    if (c) c.focus();
  }

  function close() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (wall) {
    wall.addEventListener('click', function (e) {
      var tile = e.target.closest ? e.target.closest('.tile') : null;
      if (!tile) return;
      e.preventDefault();
      open(tile.getAttribute('data-id'));
    });
  }
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });
  }

  /* мягкое появление */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var nodes = document.querySelectorAll('.tile, .number, .chronicle li, .sec-head');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(nodes, function (n) { n.classList.add('reveal'); io.observe(n); });
  }
})();
