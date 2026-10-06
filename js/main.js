/* =========================================================
   ProBASE — main.js
   Header state, mobile nav, active links, counters,
   reveal-on-scroll, contact form handling.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var root = document.documentElement;
  if (toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = root.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    document.querySelectorAll('.main-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        root.classList.remove('nav-open');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        root.classList.remove('nav-open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- Active nav link ---------- */
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll ----------
     Only arm the hidden starting state once we know we can also reveal it —
     avoids content getting stuck invisible if the observer never fires. */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    document.documentElement.classList.add('reveal-armed');

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el, i) {
      el.style.setProperty('--i', i % 6);
      io.observe(el);
    });

    // Safety net: guarantee nothing stays invisible if something above misfires.
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }, 3500);
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    var duration = 1600;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString();
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Video hero: pause when off-screen (perf) ---------- */
  var heroVideos = document.querySelectorAll('.hero-media video');
  if ('IntersectionObserver' in window && heroVideos.length) {
    var vio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var v = entry.target;
          if (entry.isIntersecting) v.play().catch(function () {});
          else v.pause();
        });
      },
      { threshold: 0.1 }
    );
    heroVideos.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- Media-frame carousels (auto-cycling images) ---------- */
  var carousels = document.querySelectorAll('.media-frame--carousel');
  carousels.forEach(function (frame) {
    var images = (frame.getAttribute('data-images') || '')
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
    if (images.length < 2) return;

    var img = frame.querySelector('img');
    var dotsWrap = frame.querySelector('.media-frame__dots');
    if (dotsWrap) {
      images.forEach(function (_, i) {
        var dot = document.createElement('span');
        if (i === 0) dot.classList.add('is-active');
        dotsWrap.appendChild(dot);
      });
    }

    var idx = 0;
    setInterval(function () {
      idx = (idx + 1) % images.length;
      img.style.opacity = '0';
      setTimeout(function () {
        img.setAttribute('src', images[idx]);
        img.style.opacity = '1';
      }, 260);
      if (dotsWrap) {
        var dots = dotsWrap.querySelectorAll('span');
        dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
      }
    }, 2000);
  });

  /* ---------- Contact form (no backend — mailto fallback) ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var subject = (data.get('subject') || 'Website enquiry').toString().trim();
      var message = (data.get('message') || '').toString().trim();

      if (!name || !email || !message) return;

      var body = encodeURIComponent(
        'Name: ' + name + '\nEmail: ' + email + '\n\n' + message
      );
      var mailto = 'mailto:info@probasegroup.com?subject=' +
        encodeURIComponent(subject) + '&body=' + body;

      var success = document.getElementById('form-success');
      if (success) success.classList.add('is-visible');
      form.reset();

      window.location.href = mailto;
    });
  }
})();
