/* «За пределами возможного» — логика интерфейса */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  window.addEventListener('load', function () {
    var pre = document.getElementById('preloader');
    if (pre) setTimeout(function () { pre.classList.add('done'); }, 450);
  });
  setTimeout(function () {
    var pre = document.getElementById('preloader');
    if (pre) pre.classList.add('done');
  }, 3500);

  /* ---------- Header ---------- */
  var header = document.getElementById('siteHeader');
  var toTop = document.getElementById('toTop');
  var progress = document.getElementById('scrollProgress');
  var nav = document.getElementById('siteNav');
  var burger = document.getElementById('burger');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 30);
    if (toTop) toTop.classList.toggle('show', y > 700);
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Cursor glow ---------- */
  var glow = document.getElementById('cursorGlow');
  if (glow && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy;
    window.addEventListener('pointermove', function (e) {
      gx = e.clientX; gy = e.clientY; glow.style.opacity = '1';
    });
    (function loop() {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Hero 3D-parallax ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      var dx = (e.clientX / window.innerWidth) * 2 - 1;
      var dy = (e.clientY / window.innerHeight) * 2 - 1;
      document.documentElement.style.setProperty('--px', dx.toFixed(3));
      document.documentElement.style.setProperty('--py', dy.toFixed(3));
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  Array.prototype.forEach.call(revealEls, function (el, i) {
    if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', String(i % 4));
  });
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    Array.prototype.forEach.call(revealEls, function (el) { revealObserver.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Active nav section ---------- */
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a')) : [];
  var sections = navLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var secObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { secObserver.observe(s); });
  }

  /* ---------- Typewriter ---------- */
  var typed = document.getElementById('typed');
  if (typed && TYPED_WORDS.length) {
    if (reduceMotion) {
      typed.textContent = TYPED_WORDS[0];
    } else {
      var wi = 0, ci = 0, deleting = false;
      (function tick() {
        var word = TYPED_WORDS[wi];
        typed.textContent = word.slice(0, ci);
        var delay = deleting ? 40 : 85;
        if (!deleting && ci === word.length) { delay = 1700; deleting = true; }
        else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % TYPED_WORDS.length; delay = 320; }
        else { ci += deleting ? -1 : 1; }
        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- Hero canvas: 3D-сцена (см. js/three-scene.js) ---------- */

  /* ---------- Heroines: render, filter, modal ---------- */
  var grid = document.getElementById('heroinesGrid');
  var filters = document.getElementById('filters');
  var emptyNote = document.getElementById('heroinesEmpty');
  var modal = document.getElementById('modal');
  var modalBody = document.getElementById('modalBody');
  var lastFocused = null;

  function initialsOf(h) { return h.initials || h.name.slice(0, 2); }

  function cardHTML(h) {
    return '' +
      '<article class="heroine-card" data-cat="' + h.cat + '" data-id="' + h.id + '" tabindex="0" role="button" aria-label="Открыть историю: ' + h.name + '">' +
        '<div class="medallion">' +
          '<span class="cat-tag">' + catLabel(h.cat) + '</span>' +
          (h.photo
            ? '<img class="medallion-img" src="' + h.photo + '" alt="Фотография: ' + h.name + '" loading="lazy">'
            : '<span class="ring"></span><span class="ring two"></span><span class="initials">' + initialsOf(h) + '</span>') +
        '</div>' +
        '<div class="card-body">' +
          '<h3>' + h.name + '</h3>' +
          '<p class="role">' + h.role + '</p>' +
          '<p class="short">' + h.short + '</p>' +
          '<span class="more">Читать историю</span>' +
        '</div>' +
      '</article>';
  }

  function catLabel(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i].label;
    return '';
  }

  if (grid) {
    grid.innerHTML = HEROINES.map(cardHTML).join('');
  }

  if (filters) {
    filters.innerHTML = CATEGORIES.map(function (c) {
      return '<button class="chip' + (c.id === 'all' ? ' active' : '') + '" data-filter="' + c.id + '" type="button">' + c.label + '</button>';
    }).join('');
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      var value = btn.getAttribute('data-filter');
      filters.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      btn.classList.add('active');
      var visible = 0;
      grid.querySelectorAll('.heroine-card').forEach(function (card) {
        var show = value === 'all' || card.getAttribute('data-cat') === value;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (emptyNote) emptyNote.hidden = visible !== 0;
    });
  }

  function openModal(h) {
    if (!modal || !modalBody) return;
    modalBody.innerHTML = '' +
      '<div class="modal-hero" data-cat="' + h.cat + '">' +
        '<div class="modal-monogram">' + initialsOf(h) + '</div>' +
        '<div><h2 id="modalTitle">' + h.name + '</h2>' +
        '<p class="modal-role">' + h.role + (h.years ? ' · ' + h.years : '') + '</p></div>' +
      '</div>' +
      '<p class="modal-lead">' + h.lead + '</p>' +
      (h.photo
        ? '<figure class="modal-photo-wrap"><img class="modal-photo" src="' + h.photo + '" alt="Фотография: ' + h.name + '">' +
          '<figcaption class="photo-credit">' + (h.photoCredit || 'Фото') +
          (h.photoArticle ? ' · <a href="' + h.photoArticle + '" target="_blank" rel="noopener">источник</a>' : '') +
          '</figcaption></figure>'
        : '') +
      '<div class="modal-section"><h3>Что она сделала</h3><ul class="modal-facts">' +
        h.facts.map(function (f) { return '<li>' + f + '</li>'; }).join('') +
      '</ul></div>' +
      '<div class="modal-section"><h3>Почему это вдохновляет</h3>' +
      '<p class="modal-inspire">' + h.inspire + '</p></div>';
    lastFocused = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (grid) {
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.heroine-card');
      if (!card) return;
      var h = HEROINES.filter(function (x) { return x.id === card.getAttribute('data-id'); })[0];
      if (h) openModal(h);
    });
    grid.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target.closest('.heroine-card');
      if (!card) return;
      e.preventDefault();
      var h = HEROINES.filter(function (x) { return x.id === card.getAttribute('data-id'); })[0];
      if (h) openModal(h);
    });
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- Card tilt ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('.heroine-card') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg');
      card.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
    });
    document.addEventListener('pointerout', function (e) {
      var card = e.target.closest ? e.target.closest('.heroine-card') : null;
      if (!card) return;
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  }

  /* ---------- Counters ---------- */
  var counters = document.querySelectorAll('.counter b[data-count]');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    var start = null, dur = 1500;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var cObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(counters, function (c) { cObserver.observe(c); });
  } else {
    Array.prototype.forEach.call(counters, function (c) { c.textContent = c.getAttribute('data-count'); });
  }
})();
