/* «За пределами возможного» — логика страниц (без фреймворков). */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byId = function (id) { return document.getElementById(id); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function findHeroine(id) {
    for (var i = 0; i < HEROINES.length; i++) if (HEROINES[i].id === id) return HEROINES[i];
    return null;
  }
  function sphereOf(h) { return SPHERES[h.sphere] || ''; }

  /* ---------------- Меню на телефоне ---------------- */
  var burger = byId('burger'), nav = byId('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------------- Мягкое появление блоков ---------------- */
  function applyReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var nodes = document.querySelectorAll('.section .section__head, .entries .entry, .chronicle li, .table tbody tr, .emblem, .strip__item');
    if (!nodes.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(nodes, function (n) { n.classList.add('reveal'); io.observe(n); });
  }

  /* ---------------- Карточка записи ---------------- */
  function entryHTML(h) {
    return '' +
      '<a class="entry" data-sphere="' + esc(h.sphere) + '" href="heroines.html?id=' + encodeURIComponent(h.id) + '">' +
        '<div class="entry__photo">' +
          '<img src="' + esc(h.photo) + '" alt="' + esc(h.name) + ', ' + esc(h.years) + '" loading="lazy">' +
          '<span class="entry__cat">' + esc(sphereOf(h)) + '</span>' +
        '</div>' +
        '<div class="entry__body">' +
          '<h3>' + esc(h.name) + '</h3>' +
          '<p class="entry__years">' + esc(h.years) + '</p>' +
          '<p class="entry__role">' + esc(h.role) + '</p>' +
          '<p class="entry__text">' + esc(h.summary) + '</p>' +
          '<span class="entry__more">Запись каталога →</span>' +
        '</div>' +
      '</a>';
  }

  /* ---------------- Обложка: полоса портретов ---------------- */
  var stripHost = byId('coverStrip');
  if (stripHost) {
    var stripIds = ['euphrosyne', 'kash', 'pashkevich', 'vasilevskaya', 'domracheva'];
    stripHost.innerHTML = stripIds.map(function (id) {
      var h = findHeroine(id);
      if (!h) return '';
      return '<a class="strip__item" href="heroines.html?id=' + encodeURIComponent(h.id) + '">' +
        '<img src="' + esc(h.photo) + '" alt="' + esc(h.name) + '" loading="lazy">' +
        '<b>' + esc(h.name) + '</b><span>' + esc(h.years) + '</span></a>';
    }).join('');
  }

  /* ---------------- Главная: избранные записи ---------------- */
  var featuredHost = byId('featuredEntries');
  if (featuredHost) {
    var featuredIds = ['euphrosyne', 'kash', 'pashkevich', 'vasilevskaya', 'domracheva', 'khoruzhaya'];
    featuredHost.innerHTML = featuredIds.map(function (id) {
      var h = findHeroine(id);
      return h ? entryHTML(h) : '';
    }).join('');
  }

  /* ---------------- Главная: документы ---------------- */
  var docsHost = byId('docsList');
  if (docsHost) {
    docsHost.innerHTML = DOCUMENTS.map(function (d) {
      return '<div><dt>' + esc(d.name) + '</dt><dd>' + esc(d.value) + '</dd></div>';
    }).join('');
  }

  /* ---------------- Главная: хроника ---------------- */
  var chronHost = byId('chronicleList');
  if (chronHost) {
    chronHost.innerHTML = CHRONICLE.map(function (c) {
      return '<li' + (c.state ? ' class="is-year"' : '') + '>' +
        '<time>' + esc(c.year) + '</time>' +
        '<div><h3>' + esc(c.title) + '</h3><p>' + esc(c.text) + '</p></div></li>';
    }).join('');
  }

  /* ---------------- Список источников ---------------- */
  var srcHosts = document.querySelectorAll('#sourcesList');
  Array.prototype.forEach.call(srcHosts, function (host) {
    host.innerHTML = SOURCES.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a>' +
        '<span>' + esc(s.note) + '</span></li>';
    }).join('');
  });

  /* ---------------- Каталог: указатель, фильтр, записи ---------------- */
  var entriesHost = byId('entries');
  var indexBody = byId('indexBody');
  var filtersHost = byId('filters');
  var emptyNote = byId('entriesEmpty');

  if (entriesHost) {
    var sorted = HEROINES.slice().sort(function (a, b) {
      var ya = parseInt(String(a.years).replace(/\D/g, '').slice(0, 4), 10) || 0;
      var yb = parseInt(String(b.years).replace(/\D/g, '').slice(0, 4), 10) || 0;
      return ya - yb;
    });
    entriesHost.innerHTML = sorted.map(entryHTML).join('');

    if (indexBody) {
      indexBody.innerHTML = sorted.map(function (h) {
        return '<tr>' +
          '<td class="t-years">' + esc(h.years) + '</td>' +
          '<td class="t-name"><a href="heroines.html?id=' + encodeURIComponent(h.id) + '">' + esc(h.name) + '</a></td>' +
          '<td class="t-sphere">' + esc(sphereOf(h)) + '</td>' +
        '</tr>';
      }).join('');
    }

    if (filtersHost) {
      filtersHost.innerHTML = CATEGORIES.map(function (c) {
        return '<button class="chip" type="button" data-filter="' + c.id + '" aria-pressed="' + (c.id === 'all' ? 'true' : 'false') + '">' + esc(c.label) + '</button>';
      }).join('');
      filtersHost.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.chip') : null;
        if (!btn) return;
        var value = btn.getAttribute('data-filter');
        Array.prototype.forEach.call(filtersHost.querySelectorAll('.chip'), function (c) {
          c.setAttribute('aria-pressed', c === btn ? 'true' : 'false');
        });
        var shown = 0;
        Array.prototype.forEach.call(entriesHost.querySelectorAll('.entry'), function (card) {
          var match = value === 'all' || card.getAttribute('data-sphere') === value;
          card.style.display = match ? '' : 'none';
          if (match) shown++;
        });
        if (emptyNote) emptyNote.hidden = shown !== 0;
      });
    }
  }

  /* ---------------- Модальная запись ---------------- */
  var modal = byId('modal');
  var modalBody = byId('modalBody');
  var lastFocus = null;

  function openRecord(id) {
    var h = findHeroine(id);
    if (!h || !modal || !modalBody) return false;
    modalBody.innerHTML = '' +
      '<div class="modal__head">' +
        '<p class="mono">Запись каталога · ' + esc(sphereOf(h)) + '</p>' +
        '<h2 id="modalTitle">' + esc(h.name) + '</h2>' +
        '<p class="modal__role">' + esc(h.years) + ' · ' + esc(h.role) + '</p>' +
      '</div>' +
      '<div class="modal__grid">' +
        '<figure class="modal__photo">' +
          '<img src="' + esc(h.photo) + '" alt="' + esc(h.name) + '">' +
          '<figcaption>' + esc(h.photoCaption || '') +
            (h.photoSource ? ' · <a href="' + esc(h.photoSource) + '" target="_blank" rel="noopener">источник</a>' : '') +
          '</figcaption>' +
        '</figure>' +
        '<div>' +
          '<p class="modal__lead">' + esc(h.lead) + '</p>' +
          '<h3>Основные сведения</h3>' +
          '<ul class="facts">' + h.facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
          '<h3 style="margin-top:22px">Значение</h3>' +
          '<p>' + esc(h.meaning) + '</p>' +
        '</div>' +
      '</div>';
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var close = modal.querySelector('.modal__close');
    if (close) close.focus();
    return true;
  }

  function closeRecord() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeRecord();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeRecord();
    });
  }

  // ссылки вида heroines.html?id=… — открываем запись без перезагрузки
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="heroines.html?id="]') : null;
    if (!a || !entriesHost) return;
    var id = decodeURIComponent(a.getAttribute('href').split('id=')[1] || '');
    if (openRecord(id)) {
      e.preventDefault();
      if (history.replaceState) history.replaceState(null, '', 'heroines.html?id=' + encodeURIComponent(id));
    }
  });

  // прямая ссылка с параметром id — сразу открываем запись
  if (entriesHost) {
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get('id');
    if (wanted) openRecord(wanted);
  }

  applyReveal();
})();
