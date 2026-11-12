/* La Curva · Simulacro de examen teórico
   30 preguntas: las 10 fijas (id 1–10, en orden) + 20 sorteadas del resto del banco. */
(() => {
  'use strict';

  const BANK = window.LaCurvaPreguntas || [];
  const SIGNS = window.LaCurvaSenales || {};
  const FIXED_COUNT = 10;
  const RANDOM_COUNT = 20;
  const TOTAL = FIXED_COUNT + RANDOM_COUNT;
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const STORE_KEY = 'lacurva-simulacro';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Señales (en toda la página) ---------- */
  const renderSign = (key) => {
    if (!key) return '';
    const [name, a, b] = key.split(':');
    const fn = SIGNS[name];
    if (!fn) return '';
    return name === 'semaforo' ? fn(a, b === '1') : fn();
  };
  $$('[data-sign]').forEach((el) => { el.innerHTML = renderSign(el.dataset.sign); });

  const root = $('[data-sim]');
  if (!root || !BANK.length) return;

  /* ---------- Almacenamiento (opcional) ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };
  const showBest = () => {
    const best = store.get().best;
    const el = $('[data-best]', root);
    if (el) el.textContent = typeof best === 'number' ? `${best}/${TOTAL}` : '—';
  };
  showBest();

  /* ---------- Estado ---------- */
  let S = null;
  let timerId = null;

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const buildExam = () => {
    const fixed = BANK.filter((q) => q.id <= FIXED_COUNT).sort((a, b) => a.id - b.id);
    const drawn = shuffle(BANK.filter((q) => q.id > FIXED_COUNT)).slice(0, RANDOM_COUNT);
    return fixed.concat(drawn).map((q, i) => ({ ...q, n: i + 1, fixed: q.id <= FIXED_COUNT, chosen: null }));
  };

  /* ---------- Vistas ---------- */
  const views = $$('[data-view]', root);
  const show = (name) => {
    views.forEach((v) => { v.hidden = v.dataset.view !== name; });
    document.body.classList.toggle('sim-active', name === 'quiz');
    const top = root.getBoundingClientRect().top + window.scrollY - 110;
    if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  /* ---------- Tiempo ---------- */
  const fmt = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };
  const tick = () => { $('[data-timer]', root).textContent = fmt(Date.now() - S.start); };

  /* ---------- Inicio ---------- */
  const start = () => {
    const mode = ($('input[name="sim-mode"]:checked', root) || {}).value || 'practica';
    S = { mode, qs: buildExam(), idx: 0, start: Date.now(), end: null, done: false };
    root.dataset.mode = mode;
    $('[data-live-score]', root).hidden = mode !== 'practica';
    buildMap();
    renderQuestion();
    show('quiz');
    clearInterval(timerId);
    timerId = setInterval(tick, 1000);
    tick();
    setTimeout(() => { const f = $('.q-opt', root); f && f.focus({ preventScroll: true }); }, 350);
  };

  /* ---------- Mapa de preguntas ---------- */
  const buildMap = () => {
    $('[data-map]', root).innerHTML = S.qs.map((q, i) =>
      `<li><button type="button" data-goto="${i}" aria-label="Ir a la pregunta ${i + 1}">${i + 1}</button></li>`).join('');
  };
  const updateMap = () => {
    $$('[data-goto]', root).forEach((b, i) => {
      const q = S.qs[i];
      b.className = '';
      if (q.chosen !== null) {
        if (S.mode === 'practica') b.classList.add(q.chosen === q.c ? 'is-ok' : 'is-bad');
        else b.classList.add('is-done');
      }
      if (i === S.idx) { b.classList.add('is-current'); b.setAttribute('aria-current', 'step'); }
      else b.removeAttribute('aria-current');
    });
  };

  /* ---------- Pregunta ---------- */
  const card = $('[data-q-card]', root);
  const answered = () => S.qs.filter((q) => q.chosen !== null).length;
  const correctSoFar = () => S.qs.filter((q) => q.chosen !== null && q.chosen === q.c).length;

  const renderQuestion = (dir = 0) => {
    const q = S.qs[S.idx];
    const locked = S.mode === 'practica' && q.chosen !== null;
    const sign = renderSign(q.sign);
    const isTF = q.o.length === 2 && /^verdadero$/i.test(q.o[0]) && /^falso$/i.test(q.o[1]);

    card.innerHTML = `
      <div class="q-card__top">
        <span class="q-chip">${esc(q.cat)}</span>
        ${q.fixed ? '<span class="q-chip q-chip--fixed" title="Esta pregunta sale en todos los simulacros">Pregunta fija</span>' : ''}
        ${isTF ? '<span class="q-chip q-chip--soft">Verdadero o falso</span>' : ''}
      </div>
      <div class="q-card__body${sign ? ' has-sign' : ''}">
        ${sign ? `<figure class="q-sign">${sign}</figure>` : ''}
        <h2 class="q-text" id="q-text"><span class="q-text__n">${S.idx + 1}.</span> ${esc(q.q)}</h2>
      </div>
      <ul class="q-options${isTF ? ' q-options--tf' : ''}" role="radiogroup" aria-labelledby="q-text">
        ${q.o.map((opt, i) => {
          let cls = 'q-opt';
          if (q.chosen === i) cls += ' is-chosen';
          if (locked) {
            if (i === q.c) cls += ' is-correct';
            else if (i === q.chosen) cls += ' is-wrong';
          }
          return `<li><button type="button" class="${cls}" role="radio" aria-checked="${q.chosen === i}" data-opt="${i}" ${locked ? 'aria-disabled="true"' : ''}>
            <span class="q-opt__letter">${LETTERS[i]}</span>
            <span class="q-opt__text">${esc(opt)}</span>
            <span class="q-opt__mark" aria-hidden="true"></span>
          </button></li>`;
        }).join('')}
      </ul>
      <div class="q-feedback" data-feedback>${locked ? feedbackHTML(q) : ''}</div>`;

    if (dir && !reduceMotion) {
      card.classList.remove('slide-l', 'slide-r');
      void card.offsetWidth;
      card.classList.add(dir > 0 ? 'slide-l' : 'slide-r');
    }

    // estado de navegación
    $('[data-q-num]', root).textContent = S.idx + 1;
    $('[data-action="prev"]', root).disabled = S.idx === 0;
    const last = S.idx === S.qs.length - 1;
    $('[data-action="next"]', root).hidden = last;
    $('[data-action="finish"]', root).hidden = !last && answered() < S.qs.length;
    const a = answered();
    $('[data-progress]', root).style.width = `${(a / S.qs.length) * 100}%`;
    $('.sim-bar__progress', root).setAttribute('aria-valuenow', a);
    const live = $('[data-live-score]', root);
    if (S.mode === 'practica') live.textContent = `${correctSoFar()} correctas`;
    updateMap();
  };

  const feedbackHTML = (q) => {
    const ok = q.chosen === q.c;
    return ok
      ? `<p class="fb fb--ok"><span><strong>¡Correcto!</strong> Muy bien, seguí así.</span></p>`
      : `<p class="fb fb--bad"><span><strong>Incorrecto.</strong> La respuesta correcta es la <b>${LETTERS[q.c]}</b>: ${esc(q.o[q.c])}</span></p>`;
  };

  const choose = (i) => {
    const q = S.qs[S.idx];
    if (S.mode === 'practica' && q.chosen !== null) return;
    q.chosen = i;
    renderQuestion();
    const btn = $(`[data-opt="${i}"]`, card);
    btn && btn.focus({ preventScroll: true });
    if (S.mode === 'practica') {
      const fb = $('[data-feedback]', card);
      fb.classList.add('is-in');
    } else if (S.idx < S.qs.length - 1) {
      // en modo examen avanzamos solos para agilizar
      setTimeout(() => { if (S && !S.done && S.qs[S.idx] === q) go(1); }, 380);
    }
  };

  const go = (d) => {
    const n = S.idx + d;
    if (n < 0 || n >= S.qs.length) return;
    S.idx = n;
    renderQuestion(d);
  };
  const goto = (i) => { const d = i - S.idx; S.idx = i; renderQuestion(d); toggleMap(false); };

  /* ---------- Finalizar ---------- */
  const dialog = $('[data-dialog]', root);
  const askFinish = () => {
    const pending = S.qs.length - answered();
    if (pending > 0) {
      $('[data-dialog-text]', root).textContent = pending === 1
        ? 'Te queda 1 pregunta sin responder. Si finalizás ahora, cuenta como incorrecta.'
        : `Te quedan ${pending} preguntas sin responder. Si finalizás ahora, cuentan como incorrectas.`;
      dialog.hidden = false;
      $('[data-action="dialog-cancel"]', root).focus();
    } else finish();
  };
  const closeDialog = () => { dialog.hidden = true; };

  const TIERS = [
    { min: 0.9, tier: 'Excelente', title: '¡Estás para el examen!', msg: 'Dominás la teoría. Mantené el ritmo con algún simulacro más y concentrate en la práctica al volante.' },
    { min: 0.75, tier: 'Muy bien', title: 'Vas por muy buen camino.', msg: 'Repasá las preguntas que fallaste y los temas con menos aciertos. Un par de simulacros más y lo tenés.' },
    { min: 0.5, tier: 'A mitad de camino', title: 'Hay base, falta repaso.', msg: 'Leé con calma los capítulos de la Guía Nacional de Conducción de los temas marcados y volvé a intentarlo.' },
    { min: 0, tier: 'A seguir practicando', title: 'Todavía no, pero se aprende.', msg: 'Empezá por el manual y las señales. Hacé el simulacro en modo práctica para aprender de cada respuesta.' }
  ];

  const finish = () => {
    closeDialog();
    S.done = true;
    S.end = Date.now();
    clearInterval(timerId);

    const ok = correctSoFar();
    const empty = S.qs.length - answered();
    const bad = S.qs.length - ok - empty;
    const pct = ok / S.qs.length;
    const t = TIERS.find((x) => pct >= x.min);
    const time = fmt(S.end - S.start);

    // guardar mejor resultado
    const saved = store.get();
    const isBest = typeof saved.best !== 'number' || ok > saved.best;
    store.set({ best: isBest ? ok : saved.best, last: ok, at: new Date().toISOString() });
    showBest();

    const d = new Date();
    $('[data-result-meta]', root).textContent =
      `${S.mode === 'practica' ? 'Modo práctica' : 'Modo examen'} · ${d.toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })}${isBest && saved.best !== undefined ? ' · ¡Nuevo récord!' : ''}`;
    $('[data-result-tier]', root).textContent = t.tier;
    $('[data-result-title]', root).textContent = t.title;
    $('[data-result-msg]', root).textContent = t.msg;
    $('[data-stat-ok]', root).textContent = ok;
    $('[data-stat-bad]', root).textContent = bad;
    $('[data-stat-empty]', root).textContent = empty;
    $('[data-stat-time]', root).textContent = time;
    const ring = $('[data-result-ring]', root);
    ring.dataset.level = pct >= 0.75 ? 'high' : pct >= 0.5 ? 'mid' : 'low';
    const bar = $('.result-ring__bar', ring);
    bar.style.strokeDashoffset = 100;
    animateCount($('[data-result-score]', root), ok);
    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.strokeDashoffset = 100 - pct * 100; }));

    // compartir
    const share = `Hice el simulacro de examen teórico de La Curva Academia de Choferes y saqué ${ok}/${S.qs.length}. ¿Te animás?`;
    const shareUrl = location.protocol.startsWith('http') && !/claude|localhost/.test(location.hostname)
      ? ` ${location.origin}${location.pathname}` : '';
    $('[data-share]', root).href = `https://wa.me/?text=${encodeURIComponent(share + shareUrl)}`;

    renderCategories();
    renderReview('bad');
    show('result');
    $('[data-view="result"]', root).focus({ preventScroll: true });
  };

  const animateCount = (el, to) => {
    if (reduceMotion) { el.textContent = to; return; }
    const t0 = performance.now();
    const dur = 1100;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const renderCategories = () => {
    const by = new Map();
    S.qs.forEach((q) => {
      const c = by.get(q.cat) || { ok: 0, n: 0 };
      c.n++; if (q.chosen === q.c) c.ok++;
      by.set(q.cat, c);
    });
    const rows = [...by.entries()].sort((a, b) => (a[1].ok / a[1].n) - (b[1].ok / b[1].n) || b[1].n - a[1].n);
    $('[data-cat-bars]', root).innerHTML = rows.map(([cat, v]) => {
      const p = Math.round((v.ok / v.n) * 100);
      const lvl = p >= 75 ? 'high' : p >= 50 ? 'mid' : 'low';
      return `<li class="cat-bar" data-level="${lvl}">
        <div class="cat-bar__top"><span>${esc(cat)}</span><b>${v.ok}/${v.n}</b></div>
        <div class="cat-bar__track"><span style="--w:${p}%"></span></div>
      </li>`;
    }).join('');
    requestAnimationFrame(() => $$('.cat-bar', root).forEach((b) => b.classList.add('is-in')));
  };

  const renderReview = (filter) => {
    $$('[data-filter]', root).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.filter === filter)));
    const list = S.qs.filter((q) => filter === 'all' || q.chosen !== q.c);
    const box = $('[data-review]', root);
    if (!list.length) {
      box.innerHTML = '<li class="review-empty">¡No tenés errores para repasar! Respondiste todo bien. 🎉</li>';
      return;
    }
    box.innerHTML = list.map((q) => {
      const ok = q.chosen === q.c;
      const sign = renderSign(q.sign);
      const yours = q.chosen === null
        ? '<span class="rv-ans rv-ans--empty">Sin responder</span>'
        : `<span class="rv-ans ${ok ? 'rv-ans--ok' : 'rv-ans--bad'}"><b>${LETTERS[q.chosen]}</b> ${esc(q.o[q.chosen])}</span>`;
      return `<li class="review-item ${ok ? 'is-ok' : 'is-bad'}">
        <span class="review-item__n">${q.n}</span>
        <div class="review-item__body">
          <div class="review-item__q">${sign ? `<span class="review-item__sign">${sign}</span>` : ''}<p>${esc(q.q)}</p></div>
          <p class="rv-line"><span class="rv-label">Tu respuesta</span>${yours}</p>
          ${ok ? '' : `<p class="rv-line"><span class="rv-label">Correcta</span><span class="rv-ans rv-ans--ok"><b>${LETTERS[q.c]}</b> ${esc(q.o[q.c])}</span></p>`}
        </div>
      </li>`;
    }).join('');
  };

  /* ---------- Mapa desplegable ---------- */
  const mapBtn = $('[data-action="toggle-map"]', root);
  const map = $('#sim-map', root);
  const toggleMap = (force) => {
    const open = typeof force === 'boolean' ? force : map.hidden;
    map.hidden = !open;
    mapBtn.setAttribute('aria-expanded', String(open));
  };

  /* ---------- Eventos ---------- */
  root.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-opt]');
    if (opt) { choose(Number(opt.dataset.opt)); return; }
    const g = e.target.closest('[data-goto]');
    if (g) { goto(Number(g.dataset.goto)); return; }
    const f = e.target.closest('[data-filter]');
    if (f) { renderReview(f.dataset.filter); return; }
    const a = e.target.closest('[data-action]');
    if (!a) return;
    switch (a.dataset.action) {
      case 'start': start(); break;
      case 'prev': go(-1); break;
      case 'next': go(1); break;
      case 'finish': askFinish(); break;
      case 'toggle-map': toggleMap(); break;
      case 'dialog-cancel': closeDialog(); break;
      case 'dialog-ok': finish(); break;
      case 'restart': show('intro'); setTimeout(start, reduceMotion ? 0 : 250); break;
      default:
    }
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });

  document.addEventListener('keydown', (e) => {
    if (!S || S.done || $('[data-view="quiz"]', root).hidden) return;
    if (e.target.matches('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!dialog.hidden) { if (e.key === 'Escape') closeDialog(); return; }
    const k = e.key.toUpperCase();
    const q = S.qs[S.idx];
    const li = LETTERS.indexOf(k);
    const num = Number(e.key) - 1;
    if (li > -1 && li < q.o.length) { e.preventDefault(); choose(li); }
    else if (num >= 0 && num < q.o.length && /^\d$/.test(e.key)) { e.preventDefault(); choose(num); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); if (S.idx === S.qs.length - 1) askFinish(); else go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  // Avisar antes de salir con un simulacro a medias
  window.addEventListener('beforeunload', (e) => {
    if (S && !S.done && answered() > 0) { e.preventDefault(); e.returnValue = ''; }
  });
})();
