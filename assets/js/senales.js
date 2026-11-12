/* La Curva · Señales de tránsito en SVG (estilo de la señalización uruguaya)
   Cada función devuelve un <svg> listo para insertar. viewBox 0 0 200 200. */
(function (global) {
  'use strict';

  const RED = '#c8102e';
  const YEL = '#ffcc00';
  const BLK = '#111';
  const FONT = "font-family='Archivo, Arial, Helvetica, sans-serif' font-weight='800'";

  const wrap = (body, label) =>
    `<svg class="sign" viewBox="0 0 200 200" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

  /* Base: preventiva (rombo amarillo con borde negro) */
  const diamond = (inner) => `
    <polygon points="100,3 197,100 100,197 3,100" fill="${BLK}"/>
    <polygon points="100,10 190,100 100,190 10,100" fill="${YEL}"/>
    <polygon points="100,18 182,100 100,182 18,100" fill="none" stroke="${BLK}" stroke-width="3"/>
    ${inner}`;

  /* Base: reglamentaria (círculo blanco con anillo rojo) */
  const ring = (inner, slash) => `
    <circle cx="100" cy="100" r="96" fill="${RED}"/>
    <circle cx="100" cy="100" r="76" fill="#fff"/>
    ${inner}
    ${slash ? `<line x1="46" y1="46" x2="154" y2="154" stroke="${RED}" stroke-width="16"/>` : ''}`;

  const car = (x, y, s, fill) => `
    <g transform="translate(${x} ${y}) scale(${s})" fill="${fill}">
      <path d="M-26 4 L-20 -14 Q-18 -20 -11 -20 H11 Q18 -20 20 -14 L26 4 Q30 5 30 10 V22 H-30 V10 Q-30 5 -26 4Z"/>
      <rect x="-27" y="20" width="12" height="9" rx="2"/><rect x="15" y="20" width="12" height="9" rx="2"/>
      <path d="M-17 2 L-13 -12 H13 L17 2Z" fill="#fff"/>
      <circle cx="-19" cy="12" r="4" fill="#fff"/><circle cx="19" cy="12" r="4" fill="#fff"/>
    </g>`;

  const S = {
    pare: () => wrap(`
      <polygon points="60.6,4 139.4,4 196,60.6 196,139.4 139.4,196 60.6,196 4,139.4 4,60.6" fill="${RED}"/>
      <polygon points="63.5,12 136.5,12 188,63.5 188,136.5 136.5,188 63.5,188 12,136.5 12,63.5" fill="none" stroke="#fff" stroke-width="5"/>
      <text x="100" y="119" text-anchor="middle" fill="#fff" font-size="52" ${FONT} textLength="142" lengthAdjust="spacingAndGlyphs">PARE</text>`, 'Señal PARE'),

    ceda: () => wrap(`
      <polygon points="6,22 194,22 100,188" fill="${RED}" stroke="${RED}" stroke-width="6" stroke-linejoin="round"/>
      <polygon points="38,40 162,40 100,150" fill="#fff"/>
      <rect x="62" y="48" width="76" height="40" rx="3" fill="#fff" stroke="${BLK}" stroke-width="2.5"/>
      <text x="100" y="65" text-anchor="middle" fill="${BLK}" font-size="15" ${FONT}>CEDA EL</text>
      <text x="100" y="82" text-anchor="middle" fill="${BLK}" font-size="15" ${FONT}>PASO</text>`, 'Señal CEDA EL PASO'),

    contramano: () => wrap(`
      <circle cx="100" cy="100" r="96" fill="${RED}"/>
      <rect x="34" y="84" width="132" height="32" rx="3" fill="#fff"/>`, 'Señal contramano'),

    prohibidoAdelantar: () => wrap(ring(`${car(70, 96, 1.2, BLK)}${car(130, 96, 1.2, RED)}`, true), 'Señal prohibido adelantar'),

    prohibidoEstacionar: () => wrap(ring(`<text x="100" y="128" text-anchor="middle" fill="${BLK}" font-size="84" ${FONT}>E</text>`, true), 'Señal prohibido estacionar'),

    velocidad60: () => wrap(ring(`<text x="100" y="125" text-anchor="middle" fill="${BLK}" font-size="72" ${FONT} letter-spacing="-2">60</text>`), 'Señal velocidad máxima 60 km/h'),

    anchoMaximo: () => wrap(ring(`
      <text x="100" y="112" text-anchor="middle" fill="${BLK}" font-size="50" ${FONT}>2,4</text>
      <text x="100" y="146" text-anchor="middle" fill="${BLK}" font-size="26" ${FONT}>m</text>
      <polygon points="30,80 30,120 52,100" fill="${BLK}"/>
      <polygon points="170,80 170,120 148,100" fill="${BLK}"/>`), 'Señal ancho máximo permitido 2,4 metros'),

    curvaIzquierda: () => wrap(diamond(`
      <path d="M116 150 V104 Q116 76 88 76 H76" fill="none" stroke="${BLK}" stroke-width="17" stroke-linejoin="round"/>
      <polygon points="50,76 80,50 80,102" fill="${BLK}"/>`), 'Señal preventiva de curva a la izquierda'),

    pasoNivelBarrera: () => wrap(diamond(`
      <g stroke="${BLK}" stroke-width="6" stroke-linecap="square" fill="none">
        <line x1="50" y1="88" x2="150" y2="88"/><line x1="50" y1="112" x2="150" y2="112"/>
        <line x1="56" y1="78" x2="56" y2="122"/><line x1="81" y1="78" x2="81" y2="122"/>
        <line x1="106" y1="78" x2="106" y2="122"/><line x1="131" y1="78" x2="131" y2="122"/>
        <line x1="150" y1="78" x2="150" y2="122"/>
      </g>
      <g stroke="${BLK}" stroke-width="3.5">
        <line x1="62" y1="91" x2="75" y2="109"/><line x1="75" y1="91" x2="62" y2="109"/>
        <line x1="87" y1="91" x2="100" y2="109"/><line x1="100" y1="91" x2="87" y2="109"/>
        <line x1="112" y1="91" x2="125" y2="109"/><line x1="125" y1="91" x2="112" y2="109"/>
        <line x1="136" y1="91" x2="145" y2="109"/><line x1="145" y1="91" x2="136" y2="109"/>
      </g>`), 'Señal preventiva de paso a nivel con barreras'),

    calzadaResbaladiza: () => wrap(diamond(`
      <g transform="rotate(-14 100 70)">${car(100, 66, 1.05, BLK)}</g>
      <path d="M84 98 C 66 112, 100 124, 82 140 S 92 160, 80 168" fill="none" stroke="${BLK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M118 98 C 100 112, 134 124, 116 140 S 126 160, 114 168" fill="none" stroke="${BLK}" stroke-width="7" stroke-linecap="round"/>`), 'Señal preventiva de calzada resbaladiza'),

    crucePeatones: () => wrap(diamond(`
      <g fill="${BLK}" stroke="${BLK}" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="104" cy="52" r="11" stroke="none"/>
        <path d="M100 68 L92 108" stroke-width="15" fill="none"/>
        <path d="M98 74 L80 90 L72 108" stroke-width="8" fill="none"/>
        <path d="M100 76 L114 92 L128 96" stroke-width="8" fill="none"/>
        <path d="M92 106 L108 128 L110 152" stroke-width="10" fill="none"/>
        <path d="M92 106 L82 130 L66 146" stroke-width="10" fill="none"/>
      </g>`), 'Señal preventiva de cruce de peatones'),

    proximidadSemaforo: () => wrap(diamond(`
      <rect x="80" y="44" width="40" height="112" rx="9" fill="${BLK}"/>
      <circle cx="100" cy="66" r="12" fill="#e2231a"/>
      <circle cx="100" cy="100" r="12" fill="#ffb000"/>
      <circle cx="100" cy="134" r="12" fill="#14a44d"/>`), 'Señal preventiva de proximidad de semáforo'),

    /* Semáforos: estado = rojo | amarillo | verde | apagado ; blink = intermitente */
    semaforo: (estado, blink) => {
      const lamps = { rojo: ['#ff2a2a', 52], amarillo: ['#ffb300', 100], verde: ['#18c25a', 148] };
      const off = '#2c2c30';
      const lamp = (key) => {
        const [col, cy] = lamps[key];
        const on = estado === key;
        return `${on ? `<circle class="${blink ? 'sign-blink' : ''}" cx="100" cy="${cy}" r="27" fill="${col}" opacity=".35"/>` : ''}
          <circle class="${on && blink ? 'sign-blink' : ''}" cx="100" cy="${cy}" r="19" fill="${on ? col : off}"/>`;
      };
      const txt = estado === 'apagado' ? 'apagado' : `en ${estado}${blink ? ' intermitente' : ''}`;
      return wrap(`
        <rect x="94" y="172" width="12" height="26" fill="#3a3a40"/>
        <rect x="64" y="20" width="72" height="160" rx="16" fill="#18181c"/>
        <rect x="64" y="20" width="72" height="160" rx="16" fill="none" stroke="#3a3a40" stroke-width="3"/>
        ${lamp('rojo')}${lamp('amarillo')}${lamp('verde')}`, `Semáforo ${txt}`);
    }
  };

  global.LaCurvaSenales = S;
})(window);
