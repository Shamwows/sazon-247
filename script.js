(function () {
  const STORAGE_KEY = 'sazon-lang';
  const dict = window.SAZON_I18N || {};

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function t(lang, key) {
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;
  }

  function applyLanguage(lang) {
    const code = lang === 'es' ? 'es' : 'en';
    document.documentElement.lang = code;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const value = t(code, key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = value;
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', t(code, key));
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.setAttribute('title', t(code, key));
    });

    const title = t(code, 'meta.title');
    if (title) document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t(code, 'meta.description'));

    document.querySelectorAll('[data-lang]').forEach((btn) => {
      const active = btn.getAttribute('data-lang') === code;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }

  // Language toggle
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLanguage(btn.getAttribute('data-lang'));
    });
  });

  let initial = 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') initial = saved;
  } catch {
    /* ignore */
  }
  applyLanguage(initial);

  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  const setOpen = (open) => {
    const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', t(lang, open ? 'nav.close' : 'nav.open'));
    mobileNav.hidden = !open;
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
})();
