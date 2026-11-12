/* La Curva · Academia de Choferes — interacción del sitio */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURACIÓN — editá estos valores para actualizar el sitio.
     ------------------------------------------------------------------ */
  const CONFIG = {
    whatsapp: '59898628378', // 098 628 378 con código de país (598) y sin el 0
    // Pegá acá las direcciones exactas de los perfiles cuando las tengas.
    // Mientras estén vacías, los botones abren la búsqueda en cada red.
    instagram: '',
    facebook: ''
  };

  const SOCIAL_FALLBACK = {
    instagram: 'https://www.instagram.com/explore/search/keyword/?q=academia%20la%20curva',
    facebook: 'https://www.facebook.com/search/top?q=academia%20de%20choferes%20la%20curva'
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waUrl = (text) => `https://wa.me/${CONFIG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

  /* ---------- Enlaces de WhatsApp con mensaje prearmado ---------- */
  $$('[data-wa]').forEach((a) => { a.href = waUrl(a.dataset.wa); });

  /* ---------- Redes sociales ---------- */
  $$('[data-social]').forEach((a) => {
    const key = a.dataset.social;
    a.href = CONFIG[key] || SOCIAL_FALLBACK[key];
  });

  /* ---------- Año del footer ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Header: estado al hacer scroll ---------- */
  const header = $('.site-header');
  const fab = $('.fab-wa');
  const mobileBar = $('.mobile-bar');
  const hero = $('.hero');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight * 0.6 : 400;
    const show = y > heroBottom;
    fab && fab.classList.toggle('is-visible', show);
    mobileBar && mobileBar.classList.toggle('is-visible', show);
    updateParallax(y);
    updateRoad();
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Menú móvil ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('#main-nav');
  const setNav = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    header.classList.toggle('menu-open', open);
    if (open) header.classList.add('is-scrolled');
    else header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1221px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });

  /* ---------- Sección activa en el menú ---------- */
  const navLinks = $$('.main-nav__list a');
  const sectionMap = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          const link = sectionMap.get(en.target.id);
          if (link) link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionMap.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Apariciones al hacer scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Parallax suave del hero ---------- */
  const parallaxEls = reduceMotion ? [] : $$('[data-parallax]');
  function updateParallax(y) {
    if (!parallaxEls.length || y > window.innerHeight * 1.2) return;
    parallaxEls.forEach((el) => {
      const k = parseFloat(el.dataset.parallax) || 0;
      el.style.transform = `translate3d(0, ${(y * k).toFixed(1)}px, 0)`;
    });
  }

  /* ---------- Selector de forma de pago ---------- */
  const payGroup = $('.pay-switch__options');
  const payGrid = $('.courses__grid');
  if (payGroup && payGrid) {
    const pill = $('.pay-switch__pill', payGroup);
    const buttons = $$('button', payGroup);
    const movePill = (btn) => {
      pill.style.width = `${btn.offsetWidth}px`;
      pill.style.transform = `translateX(${btn.offsetLeft}px)`;
    };
    const select = (btn, focus) => {
      buttons.forEach((b) => {
        const on = b === btn;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      payGrid.dataset.payMode = btn.dataset.pay;
      movePill(btn);
      if (focus) btn.focus();
    };
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => select(b));
      b.addEventListener('keydown', (e) => {
        let n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = buttons[(i + 1) % buttons.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = buttons[(i - 1 + buttons.length) % buttons.length];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    const init = () => movePill(buttons.find((b) => b.getAttribute('aria-checked') === 'true') || buttons[0]);
    select(buttons[0]);
    window.addEventListener('resize', init);
    document.fonts && document.fonts.ready.then(init);
  }

  /* ---------- Ruta "Cómo empezar": el auto avanza con el scroll ---------- */
  const road = $('[data-road]');
  const roadSvg = road && $('.road__svg', road);
  const roadPath = road && $('.road__base', road);
  const car = road && $('.road__car', road);
  const roadClip = road && $('.road__clip', road);
  const roadLen = roadPath ? roadPath.getTotalLength() : 0;
  function updateRoad() {
    if (!road) return;
    const r = road.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -100 || r.top > vh + 100) return;
    // progreso: 0 cuando la ruta entra a mitad de pantalla, 1 cuando su final llega a la mitad
    let p = (vh * 0.55 - r.top) / r.height;
    p = Math.min(1, Math.max(0, p));
    if (reduceMotion) p = 1;
    const pt = roadPath.getPointAtLength(roadLen * p);
    // el camino siempre baja, así que alcanza con recortar hasta la altura del auto
    roadClip.setAttribute('height', pt.y.toFixed(1));
    const s = roadSvg.getBoundingClientRect();
    const x = s.left - r.left + (pt.x / 100) * s.width;
    const yPos = s.top - r.top + (pt.y / 1000) * s.height;
    car.style.transform = `translate3d(${x.toFixed(1)}px, ${yPos.toFixed(1)}px, 0)`;
  }
  window.addEventListener('resize', () => requestAnimationFrame(updateRoad));

  /* ---------- Videos de práctica ---------- */
  $$('.reel').forEach((reel) => {
    const video = $('video', reel);
    const btn = $('.reel__play', reel);
    btn.addEventListener('click', () => {
      // pausar los demás
      $$('.reel video').forEach((v) => { if (v !== video) v.pause(); });
      video.controls = true;
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    });
    video.addEventListener('play', () => reel.classList.add('is-playing'));
    video.addEventListener('pause', () => { if (video.ended || video.currentTime === 0) reel.classList.remove('is-playing'); });
    video.addEventListener('ended', () => { reel.classList.remove('is-playing'); video.controls = false; });
  });
  // Pausar el video del hero cuando no está visible (ahorra batería)
  const heroVideo = $('.hero__video video');
  if (heroVideo) {
    if (reduceMotion) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { const p = heroVideo.play(); p && p.catch && p.catch(() => {}); }
        else heroVideo.pause();
      }).observe(heroVideo);
    }
  }

  /* ---------- Galería con lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lightbox-img');
  const lbCap = $('#lightbox-cap');
  const items = $$('.gallery__btn');
  let current = 0;
  let lastFocus = null;
  const show = (i) => {
    current = (i + items.length) % items.length;
    const btn = items[current];
    const img = $('img', btn);
    lbImg.src = btn.dataset.full;
    lbImg.alt = img.alt;
    lbCap.textContent = `${img.alt} · ${current + 1} / ${items.length}`;
  };
  const openLb = (i) => {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lightbox__close', lb).focus();
  };
  const closeLb = () => {
    lb.hidden = true;
    document.body.style.overflow = '';
    lbImg.removeAttribute('src');
    lastFocus && lastFocus.focus();
  };
  items.forEach((b, i) => b.addEventListener('click', () => openLb(i)));
  if (lb) {
    $('.lightbox__close', lb).addEventListener('click', closeLb);
    $('.lightbox__nav--prev', lb).addEventListener('click', () => show(current - 1));
    $('.lightbox__nav--next', lb).addEventListener('click', () => show(current + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'Tab') { // mantener el foco dentro del diálogo
        const f = $$('button', lb);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // deslizar en celular
    let sx = null;
    lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ---------- FAQ: una pregunta abierta a la vez ---------- */
  const faqs = $$('.faq-item');
  faqs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  }));

  /* ---------- Formulario → WhatsApp ---------- */
  const form = $('#contact-form');
  if (form) {
    const done = $('#form-done');
    const doneLink = $('#form-done-link');
    const setError = (field, msg) => {
      const wrap = field.closest('.field');
      const err = $('.field__error', wrap);
      wrap.classList.toggle('has-error', !!msg);
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) { err.textContent = msg || ''; field.setAttribute('aria-describedby', err.id); }
    };
    const name = form.elements.nombre;
    const course = form.elements.curso;
    name.addEventListener('input', () => setError(name, ''));
    course.addEventListener('change', () => setError(course, ''));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      const n = name.value.trim();
      if (n.length < 2) { setError(name, 'Contanos tu nombre para saber cómo llamarte.'); ok = false; }
      if (!course.value) { setError(course, 'Elegí qué curso o servicio te interesa.'); ok = false; }
      if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }

      const lines = [
        `¡Hola La Curva! Soy ${n}.`,
        `Me interesa: ${course.value}.`
      ];
      if (form.elements.zona.value) lines.push(`Zona: ${form.elements.zona.value}.`);
      if (form.elements.horario.value) lines.push(`Horario preferido: ${form.elements.horario.value}.`);
      const msg = form.elements.mensaje.value.trim();
      if (msg) lines.push(msg);
      const url = waUrl(lines.join('\n'));

      doneLink.href = url;
      done.hidden = false;
      done.focus();
      const w = window.open(url, '_blank', 'noopener');
      if (w) w.opener = null;
    });

    $('#form-reset').addEventListener('click', () => { done.hidden = true; name.focus(); });
  }

  onScroll();
})();
