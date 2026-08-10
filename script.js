(function () {
  const STORAGE_KEY = 'sazon-lang';
  const ANNOUNCEMENTS_URL = 'public/announcements.json';
  const FB_PAGE =
    'https://www.facebook.com/people/Sazon-247/61592829363284/';
  const FB_SHARE = 'https://www.facebook.com/share/1EcUBacwAo/';
  const dict = window.SAZON_I18N || {};

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function t(lang, key) {
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;
  }

  function currentLang() {
    return document.documentElement.lang === 'es' ? 'es' : 'en';
  }

  function pickLocalized(field, lang) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field.en || field.es || '';
  }

  function formatDate(iso, lang) {
    if (!iso) return '';
    try {
      const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
      return d.toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
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

    // Re-render featured specials in the active language
    if (window.__sazonAnnouncements) {
      renderFeatured(window.__sazonAnnouncements, code);
    }

    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }

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
  if (toggle && mobileNav) {
    const setOpen = (open) => {
      const lang = currentLang();
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
  }

  /**
   * Featured specials card — loaded from announcements.json (auto-refresh).
   * The Facebook timeline iframe beside it always shows the live public page feed.
   */
  function renderFeatured(data, lang) {
    const card = document.querySelector('[data-fb-featured-card]');
    if (!card) return;

    const featured = data && data.featured;
    if (!featured || featured.active === false) {
      card.classList.remove('is-loading');
      card.innerHTML = `
        <p class="specials-badge">${escapeHtml(t(lang, 'specials.liveBadge'))}</p>
        <h3>${escapeHtml(t(lang, 'specials.title'))}</h3>
        <p>${escapeHtml(t(lang, 'specials.lead'))}</p>
        <a class="btn btn-primary" href="${escapeAttr(data?.facebookShare || FB_SHARE)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(t(lang, 'specials.openFb'))}
        </a>
      `;
      return;
    }

    const badge = pickLocalized(featured.badge, lang) || t(lang, 'specials.liveBadge');
    const title = pickLocalized(featured.title, lang);
    const body = pickLocalized(featured.body, lang);
    const cta = pickLocalized(featured.cta, lang) || t(lang, 'specials.openFb');
    const href = featured.href || data.facebookShare || FB_SHARE;
    const dateLabel = formatDate(featured.date || data.updated, lang);

    card.classList.remove('is-loading');
    card.innerHTML = `
      <p class="specials-badge">${escapeHtml(badge)}</p>
      ${dateLabel ? `<span class="specials-date">${escapeHtml(dateLabel)}</span>` : ''}
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
      <a class="btn btn-primary" href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(cta)}
      </a>
    `;

    // Optional extra highlights under the card
    const host = document.querySelector('[data-fb-featured]');
    if (!host) return;
    let list = host.querySelector('[data-fb-highlights]');
    if (!list) {
      list = document.createElement('div');
      list.className = 'specials-highlights';
      list.setAttribute('data-fb-highlights', '');
      host.appendChild(list);
    }
    const highlights = Array.isArray(featured.highlights)
      ? featured.highlights
      : Array.isArray(data.highlights)
        ? data.highlights
        : [];
    if (!highlights.length) {
      list.innerHTML = '';
      list.hidden = true;
      return;
    }
    list.hidden = false;
    list.innerHTML = highlights
      .map((h) => {
        const ht = pickLocalized(h.title, lang);
        const hb = pickLocalized(h.body, lang);
        if (!ht && !hb) return '';
        return `<article class="specials-highlight"><h4>${escapeHtml(ht)}</h4><p>${escapeHtml(hb)}</p></article>`;
      })
      .join('');
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
  }

  async function loadAnnouncements() {
    const card = document.querySelector('[data-fb-featured-card]');
    if (!card) return;

    try {
      const res = await fetch(`${ANNOUNCEMENTS_URL}?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      window.__sazonAnnouncements = data;
      renderFeatured(data, currentLang());
    } catch {
      card.classList.remove('is-loading');
      card.innerHTML = `
        <p class="specials-badge">${escapeHtml(t(currentLang(), 'specials.liveBadge'))}</p>
        <p class="specials-error">${escapeHtml(t(currentLang(), 'specials.error'))}</p>
        <a class="btn btn-primary" href="${escapeAttr(FB_SHARE)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(t(currentLang(), 'specials.openFb'))}
        </a>
      `;
    }
  }

  // Resize Facebook iframe to container width (plugin prefers ~340–500px)
  function sizeFacebookFeed() {
    const frame = document.querySelector('[data-fb-feed] iframe');
    if (!frame) return;
    const parent = frame.parentElement;
    const width = Math.max(280, Math.min(500, Math.floor(parent.clientWidth || 500)));
    const page = encodeURIComponent(FB_PAGE);
    const src = `https://www.facebook.com/plugins/page.php?href=${page}&tabs=timeline&width=${width}&height=720&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`;
    if (frame.getAttribute('data-width') !== String(width)) {
      frame.setAttribute('data-width', String(width));
      frame.setAttribute('width', String(width));
      frame.src = src;
    }
  }

  loadAnnouncements();
  sizeFacebookFeed();
  window.addEventListener('resize', () => {
    window.clearTimeout(window.__sazonFbResize);
    window.__sazonFbResize = window.setTimeout(sizeFacebookFeed, 250);
  });

  // Soft refresh featured specials every 10 minutes while the tab is open
  setInterval(loadAnnouncements, 10 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') loadAnnouncements();
  });
})();
