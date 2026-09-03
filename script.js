/* =========================================================
   Sevier Quality Property & Projects — site interactions
   Vanilla JS, no dependencies
   ========================================================= */
(function () {
  'use strict';

  /* ---------------- Header scroll state ---------------- */
  var header = document.getElementById('siteHeader');
  var backToTop = document.getElementById('backToTop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 40);
    if (backToTop) backToTop.classList.toggle('show', y > 600);
    highlightNav();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Mobile navigation ---------------- */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  function closeNav() {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  function openNav() {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      if (primaryNav.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
        header.classList.add('scrolled');
      }
    });

    primaryNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && primaryNav.classList.contains('open')) {
        closeNav();
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (
        primaryNav.classList.contains('open') &&
        !primaryNav.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeNav();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ---------------- Active nav link on scroll ---------------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.primary-nav a[href^="#"]')
  );
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return null;
      var el = document.querySelector(id);
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  function highlightNav() {
    var pos = (window.pageYOffset || document.documentElement.scrollTop) + 140;
    var current = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= pos) current = s;
    });
    navLinks.forEach(function (l) { l.classList.remove('active'); });
    if (current) current.link.classList.add('active');
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            setTimeout(function () { el.classList.add('visible'); }, i * 70);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- Quote form validation ---------------- */
  var form = document.getElementById('quoteForm');
  var status = document.getElementById('formStatus');

  var RULES = {
    name: {
      required: true,
      test: function (v) { return v.trim().length >= 2; },
      message: 'Please enter your full name.'
    },
    email: {
      required: true,
      test: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); },
      message: 'Please enter a valid email address.'
    },
    phone: {
      required: false,
      test: function (v) {
        if (!v.trim()) return true;
        var digits = v.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
      },
      message: 'Please enter a valid phone number (at least 10 digits).'
    },
    service: {
      required: true,
      test: function (v) { return v !== ''; },
      message: 'Please choose the service you need.'
    },
    message: {
      required: true,
      test: function (v) { return v.trim().length >= 10; },
      message: 'Please tell us a little more about the project (10+ characters).'
    }
  };

  function fieldWrap(input) {
    return input.closest('.field');
  }

  function setError(input, message) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.add('invalid');
    var err = wrap.querySelector('.error');
    if (err) err.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.remove('invalid');
    var err = wrap.querySelector('.error');
    if (err) err.textContent = '';
    input.removeAttribute('aria-invalid');
  }

  function validateField(input) {
    var rule = RULES[input.name];
    if (!rule) return true;
    var value = input.value || '';
    if (rule.required && !value.trim()) {
      setError(input, rule.message);
      return false;
    }
    if (!rule.test(value)) {
      setError(input, rule.message);
      return false;
    }
    clearError(input);
    return true;
  }

  function showStatus(text, type) {
    if (!status) return;
    status.textContent = text;
    status.className = 'form-status show ' + type;
  }

  if (form) {
    var inputs = Array.prototype.slice.call(
      form.querySelectorAll('input[name], select[name], textarea[name]')
    ).filter(function (el) { return RULES[el.name]; });

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        if (fieldWrap(input) && fieldWrap(input).classList.contains('invalid')) {
          validateField(input);
        }
      });
      if (input.tagName === 'SELECT') {
        input.addEventListener('change', function () { validateField(input); });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      inputs.forEach(function (input) {
        var ok = validateField(input);
        if (!ok && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        showStatus('Please correct the highlighted fields and try again.', 'error');
        firstInvalid.focus();
        return;
      }

      var name = (form.elements.name.value || '').trim().split(' ')[0];
      showStatus(
        'Thank you' + (name ? ', ' + name : '') +
        '! Your request has been received. We will follow up with pricing and availability within one business day.',
        'success'
      );
      form.reset();
      inputs.forEach(clearError);
    });
  }

  /* ---------------- Smooth scroll fallback ---------------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    var target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.pageYOffset - 76;
    if ('scrollBehavior' in document.documentElement.style && !reduceMotion) {
      window.scrollTo({ top: top, behavior: 'smooth' });
    } else {
      window.scrollTo(0, top);
    }
    if (history.replaceState) history.replaceState(null, '', hash);
  });

  onScroll();
})();
