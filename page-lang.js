/* page-lang.js — English mode for the Blessings / Prayers / Tehillim pages.
   The prayer text itself always stays in Hebrew; only explanations, instructions
   and buttons switch to English (from data-en* attributes on each element).
   Language comes from ?lang=en|he, otherwise from the app's saved choice (mg-app-lang). */
(function () {
  var lang = 'he';
  try {
    var q = (location.search.match(/[?&]lang=(en|he)\b/) || [])[1];
    lang = q || localStorage.getItem('mg-app-lang') || 'he';
  } catch (e) {}
  if (lang !== 'en') return;

  var root = document.documentElement;
  root.classList.add('pl-en');
  var css = document.createElement('style');
  css.textContent =
    'html.pl-en:not(.pl-ready) body{visibility:hidden}' +
    'html.pl-en body{direction:ltr;text-align:left}' +
    'html.pl-en p.pr,html.pl-en .bracha,html.pl-en .nusach .bracha{direction:rtl;text-align:right}' +
    'html.pl-en [dir=rtl]{unicode-bidi:isolate}' +
    'html.pl-en .pill.b::before{content:"Before: "}' +
    'html.pl-en .pill.a::before{content:"After: "}';
  (document.head || root).appendChild(css);
  setTimeout(function () { root.classList.add('pl-ready'); }, 2500); /* never leave the page hidden */

  function sortFoods() {
    var list = document.getElementById('list');
    if (!list || !list.querySelector('.food[data-en-name]')) return;
    var foods = [].slice.call(list.querySelectorAll('.food'));
    foods.sort(function (a, b) {
      return (a.getAttribute('data-en-name') || '').localeCompare(b.getAttribute('data-en-name') || '');
    });
    list.innerHTML = '';
    var letters = [], cur = '';
    foods.forEach(function (f) {
      var L = (f.getAttribute('data-en-name') || '?').charAt(0).toUpperCase();
      if (L !== cur) {
        cur = L; letters.push(L);
        var h = document.createElement('h3');
        h.className = 'letter'; h.id = 'l-' + L; h.textContent = L;
        list.appendChild(h);
      }
      list.appendChild(f);
    });
    var nav = document.querySelector('.letters');
    if (nav) nav.innerHTML = letters.map(function (L) { return '<a href="#l-' + L + '">' + L + '</a>'; }).join('');
    /* search by English name (replace the input to drop the Hebrew-only handler) */
    var q = document.getElementById('q'), none = document.getElementById('none');
    if (!q) return;
    var q2 = q.cloneNode(true); q.parentNode.replaceChild(q2, q);
    q2.addEventListener('input', function () {
      var v = q2.value.trim().toLowerCase(), shown = 0;
      foods.forEach(function (f) {
        var ok = !v || (f.getAttribute('data-en-name') || '').toLowerCase().indexOf(v) > -1 || (f.getAttribute('data-name') || '').indexOf(q2.value.trim()) > -1;
        f.classList.toggle('hidden', !ok); if (ok) shown++;
      });
      [].slice.call(list.querySelectorAll('.letter')).forEach(function (h) {
        var n = h.nextElementSibling, any = false;
        while (n && !n.classList.contains('letter')) { if (!n.classList.contains('hidden')) any = true; n = n.nextElementSibling; }
        h.classList.toggle('hidden', !any);
      });
      if (none) none.classList.toggle('hidden', shown > 0);
    });
  }

  function apply() {
    try {
      root.setAttribute('lang', 'en');
      root.setAttribute('dir', 'ltr');
      var t = root.getAttribute('data-en-title'); if (t) document.title = t;
      [].slice.call(document.querySelectorAll('[data-en]')).forEach(function (el) { el.innerHTML = el.getAttribute('data-en'); });
      [].slice.call(document.querySelectorAll('[data-en-placeholder]')).forEach(function (el) { el.setAttribute('placeholder', el.getAttribute('data-en-placeholder')); });
      [].slice.call(document.querySelectorAll('[data-en-aria-label]')).forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-en-aria-label')); });
      /* "לדף הראשי" home button: keep the icon, swap the text */
      [].slice.call(document.querySelectorAll('a.homebtn')).forEach(function (a) {
        for (var n = a.lastChild; n; n = n.previousSibling) { if (n.nodeType === 3 && n.nodeValue.trim()) { n.nodeValue = 'Home'; break; } }
      });
      /* keep English on internal links for visitors who came with ?lang=en */
      [].slice.call(document.querySelectorAll('a[href]')).forEach(function (a) {
        var h = a.getAttribute('href');
        if (/^(\/(brachot|tefilot|tehilim)\/|[a-z-]+\.html)/.test(h) && !/[?&]lang=/.test(h) && h.indexOf('#') < 0) {
          a.setAttribute('href', h + (h.indexOf('?') < 0 ? '?' : '&') + 'lang=en');
        }
      });
      sortFoods();
    } catch (e) {}
    root.classList.add('pl-ready');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
