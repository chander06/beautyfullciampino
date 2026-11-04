/* Beauty Full — bozza v0 · The SBL Company */
document.documentElement.classList.remove('no-js');

(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };

  /* ---------- Apertura: il fiore che sboccia (una volta per sessione) ---------- */
  var intro = document.querySelector('.intro');
  if (intro) {
    var seen = false;
    try { seen = sessionStorage.getItem('bf_intro') === '1'; } catch (e) {}
    if (reduce || seen) {
      intro.hidden = true;
    } else {
      root.classList.add('is-intro');
      intro.classList.add('play');
      try { sessionStorage.setItem('bf_intro', '1'); } catch (e) {}
      var end = function () {
        if (intro.hidden) return;
        intro.hidden = true;
        ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(function (t) { removeEventListener(t, end); });
      };
      setTimeout(end, 2150);
      ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(function (t) { addEventListener(t, end, { passive: true }); });
    }
  }

  /* ---------- Rivelazioni all'ingresso ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Manifesto: divido le parole ---------- */
  document.querySelectorAll('[data-words]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w'; s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i); s.style.setProperty('--n', words.length);
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Animazioni legate allo scroll ---------- */
  var hero = document.querySelector('[data-scrub]');
  var views = Array.prototype.slice.call(document.querySelectorAll('[data-scrub-view]'));
  var nav = document.querySelector('[data-nav]');
  var fab = document.querySelector('.wa-fab');

  if (reduce) {
    if (hero) hero.classList.add('is-static');
    views.forEach(function (v) { v.style.setProperty('--p', '1'); });
  }

  var ticking = false;
  function update() {
    ticking = false;
    var vh = innerHeight;
    if (hero && !reduce) {
      var r = hero.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, r.height - vh));
      var a = clamp(p / 0.5), b = clamp((p - 0.55) / 0.35);
      hero.style.setProperty('--a', a.toFixed(3));
      hero.style.setProperty('--b', b.toFixed(3));
      hero.classList.toggle('is-done', b > 0.5);
    }
    if (!reduce) {
      views.forEach(function (v) {
        var r2 = v.getBoundingClientRect();
        if (r2.bottom < 0 || r2.top > vh) return;
        // 0 quando la sezione entra dal basso, 1 quando la sua metà supera il centro dello schermo
        var p2 = clamp((vh - r2.top) / (vh * 0.55 + r2.height * 0.5));
        v.style.setProperty('--p', p2.toFixed(3));
      });
    }
    var y = scrollY;
    if (nav) nav.classList.toggle('is-solid', y > 40);
    if (fab) fab.classList.toggle('is-shown', y > (hero ? hero.offsetTop + hero.offsetHeight - vh * 0.6 : vh));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- Schede dei trattamenti ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus();
    });
  });
  if (tabs.length) select(tabs[0]);

  /* ---------- Bozza: link WhatsApp ancora da collegare ---------- */
  var toast = document.querySelector('.toast'), tt;
  document.querySelectorAll('[data-placeholder="whatsapp"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (!toast) return;
      toast.hidden = false; clearTimeout(tt);
      tt = setTimeout(function () { toast.hidden = true; }, 2600);
    });
  });
})();
