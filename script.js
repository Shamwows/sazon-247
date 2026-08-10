(function () {
  const STORAGE_KEY = 'sazon-lang';
  const ANNOUNCEMENTS_URL = 'public/announcements.json';
  const FB_PAGE = 'https://www.facebook.com/people/Sazon-247/61592829363284/';
  const FB_SHARE = 'https://www.facebook.com/share/1EcUBacwAo/';
  const dict = window.SAZON_I18N || {};

  let carouselTimer = null;
  let carouselIndex = 0;
  let carouselItems = [];
  let rotateMs = 6000;
  let pauseCarousel = false;

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
      });
    } catch {
      return iso;
    }
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

    if (window.__sazonAnnouncements) {
      buildCarousel(window.__sazonAnnouncements, code, { keepIndex: true });
    }

    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }

  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
  });

  let initial = 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') initial = saved;
  } catch {
    /* ignore */
  }
  applyLanguage(initial);

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
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
  }

  function stopCarouselTimer() {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  function startCarouselTimer() {
    stopCarouselTimer();
    if (carouselItems.length < 2 || pauseCarousel) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    carouselTimer = setInterval(() => goSlide(carouselIndex + 1), rotateMs);
  }

  function goSlide(next) {
    if (!carouselItems.length) return;
    const n = ((next % carouselItems.length) + carouselItems.length) % carouselItems.length;
    carouselIndex = n;
    const track = document.querySelector('[data-announce-track]');
    const dots = document.querySelector('[data-announce-dots]');
    if (track) {
      track.querySelectorAll('.announce-slide').forEach((slide, i) => {
        slide.classList.toggle('is-active', i === n);
        slide.setAttribute('aria-hidden', i === n ? 'false' : 'true');
      });
    }
    if (dots) {
      dots.querySelectorAll('.announce-dot').forEach((dot, i) => {
        dot.classList.toggle('is-active', i === n);
        dot.setAttribute('aria-selected', i === n ? 'true' : 'false');
      });
    }
  }

  function buildCarousel(data, lang, opts = {}) {
    const track = document.querySelector('[data-announce-track]');
    const dots = document.querySelector('[data-announce-dots]');
    if (!track) return;

    const keepIndex = Boolean(opts.keepIndex);
    const prevIndex = carouselIndex;

    let items = [];
    if (Array.isArray(data.announcements) && data.announcements.length) {
      items = data.announcements.filter((a) => a && a.active !== false);
    } else if (data.featured && data.featured.active !== false) {
      items = [data.featured];
    }

    carouselItems = items;
    rotateMs = Math.max(4000, Number(data.rotateSeconds || 6) * 1000);

    if (!items.length) {
      track.innerHTML = `
        <div class="announce-slide is-active">
          <p class="specials-badge">${escapeHtml(t(lang, 'specials.liveBadge'))}</p>
          <h3>${escapeHtml(t(lang, 'specials.title'))}</h3>
          <p class="announce-body">${escapeHtml(t(lang, 'specials.lead'))}</p>
          <a class="btn btn-primary" href="${escapeAttr(data.facebookShare || FB_SHARE)}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(t(lang, 'specials.openFb'))}
          </a>
        </div>
      `;
      if (dots) dots.innerHTML = '';
      stopCarouselTimer();
      return;
    }

    track.innerHTML = items
      .map((item, i) => {
        const badge = pickLocalized(item.badge, lang) || t(lang, 'specials.liveBadge');
        const title = pickLocalized(item.title, lang);
        const body = pickLocalized(item.body, lang);
        const cta = pickLocalized(item.cta, lang) || t(lang, 'specials.openFb');
        const href = item.href || data.facebookShare || FB_SHARE;
        const dateLabel = formatDate(item.date || data.updated, lang);
        const external = /^https?:/i.test(href);
        return `
          <article class="announce-slide${i === 0 ? ' is-active' : ''}" data-slide-index="${i}" aria-hidden="${i === 0 ? 'false' : 'true'}">
            <p class="specials-badge">${escapeHtml(badge)}</p>
            ${dateLabel ? `<span class="specials-date">${escapeHtml(dateLabel)}</span>` : ''}
            <h3>${escapeHtml(title)}</h3>
            <p class="announce-body">${escapeHtml(body)}</p>
            <a class="btn btn-primary" href="${escapeAttr(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
              ${escapeHtml(cta)}
            </a>
          </article>
        `;
      })
      .join('');

    if (dots) {
      dots.innerHTML = items
        .map(
          (_, i) =>
            `<button type="button" class="announce-dot${i === 0 ? ' is-active' : ''}" data-dot-index="${i}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" aria-label="Announcement ${i + 1}"></button>`
        )
        .join('');
      dots.querySelectorAll('.announce-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          goSlide(Number(dot.getAttribute('data-dot-index')));
          startCarouselTimer();
        });
      });
    }

    if (keepIndex && items.length) {
      goSlide(Math.min(prevIndex, items.length - 1));
    } else {
      carouselIndex = 0;
      goSlide(0);
    }
    startCarouselTimer();
  }

  document.querySelector('[data-announce-prev]')?.addEventListener('click', () => {
    goSlide(carouselIndex - 1);
    startCarouselTimer();
  });
  document.querySelector('[data-announce-next]')?.addEventListener('click', () => {
    goSlide(carouselIndex + 1);
    startCarouselTimer();
  });

  const carousel = document.querySelector('[data-announce-carousel]');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => {
      pauseCarousel = true;
      stopCarouselTimer();
    });
    carousel.addEventListener('mouseleave', () => {
      pauseCarousel = false;
      startCarouselTimer();
    });
    carousel.addEventListener('focusin', () => {
      pauseCarousel = true;
      stopCarouselTimer();
    });
    carousel.addEventListener('focusout', (e) => {
      if (!carousel.contains(e.relatedTarget)) {
        pauseCarousel = false;
        startCarouselTimer();
      }
    });
  }

  async function loadAnnouncements() {
    try {
      const res = await fetch(`${ANNOUNCEMENTS_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      window.__sazonAnnouncements = data;
      buildCarousel(data, currentLang());
    } catch {
      const track = document.querySelector('[data-announce-track]');
      if (track) {
        track.innerHTML = `
          <div class="announce-slide is-active">
            <p class="specials-badge">${escapeHtml(t(currentLang(), 'specials.liveBadge'))}</p>
            <p class="specials-error">${escapeHtml(t(currentLang(), 'specials.error'))}</p>
            <a class="btn btn-primary" href="${escapeAttr(FB_SHARE)}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(t(currentLang(), 'specials.openFb'))}
            </a>
          </div>
        `;
      }
    }
  }

  function sizeFacebookFeed() {
    const frame = document.querySelector('[data-fb-feed] iframe');
    if (!frame) return;
    const parent = frame.parentElement;
    const width = Math.max(280, Math.min(500, Math.floor(parent.clientWidth || 500)));
    const height = Math.max(360, Math.min(480, Math.floor(parent.clientHeight || 420)));
    const page = encodeURIComponent(FB_PAGE);
    const src = `https://www.facebook.com/plugins/page.php?href=${page}&tabs=timeline&width=${width}&height=${height}&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`;
    const key = `${width}x${height}`;
    if (frame.getAttribute('data-size') !== key) {
      frame.setAttribute('data-size', key);
      frame.setAttribute('width', String(width));
      frame.setAttribute('height', String(height));
      frame.style.maxHeight = `${height}px`;
      frame.src = src;
    }
  }

  loadAnnouncements();
  sizeFacebookFeed();
  window.addEventListener('resize', () => {
    window.clearTimeout(window.__sazonFbResize);
    window.__sazonFbResize = window.setTimeout(sizeFacebookFeed, 250);
  });

  setInterval(loadAnnouncements, 10 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      loadAnnouncements();
      startCarouselTimer();
    } else {
      stopCarouselTimer();
    }
  });
})();
