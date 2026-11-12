# La Curva · Academia de Choferes — sitio web

Sitio estático (HTML + CSS + JavaScript, sin frameworks ni compilación). Se puede subir tal cual a cualquier hosting: Netlify, Vercel, GitHub Pages, Hostinger, cPanel, etc.

## Estructura

```
index.html              Página principal (todas las secciones)
simulacro.html          Simulacro de examen teórico + señales + manual
assets/css/styles.css   Estilos y animaciones
assets/js/main.js       Interacción (menú, precios, ruta, videos, galería, formulario)
assets/js/preguntas.js  Banco de 91 preguntas del simulacro (editable)
assets/js/senales.js    Señales de tránsito dibujadas en SVG (nítidas en cualquier pantalla)
assets/js/simulacro.js  Lógica del simulacro (sorteo, corrección, resultados)
assets/css/simulacro.css Estilos del simulacro
assets/docs/            Guía Nacional de Conducción (PDF)
assets/img/             Fotos optimizadas en WebP (480 y 900 px), logo, íconos, imagen para redes
assets/video/           Videos de práctica comprimidos + portadas
assets/fonts/           Tipografías Archivo e Instrument Sans (licencia OFL, alojadas en el sitio)
site.webmanifest        Ícono y colores al guardar el sitio en el celular
robots.txt, sitemap.xml SEO (reemplazar TU-DOMINIO)
```

## Cómo editar lo más común

- **Precios y textos:** están directamente en `index.html`. Cada curso tiene tres bloques `data-mode="contado" | "mp" | "propia"`.
- **WhatsApp:** número en `CONFIG.whatsapp` al inicio de `assets/js/main.js`. Cada botón tiene su mensaje prearmado en el atributo `data-wa`.
- **Instagram y Facebook:** pegar las direcciones exactas de los perfiles en `CONFIG.instagram` y `CONFIG.facebook` (mismo archivo). Mientras estén vacías, los botones abren la búsqueda de la academia en cada red.
- **Fotos de egresados:** agregar un `<li class="gallery__item">` en la sección `#egresados` con la foto en `assets/img/`.

## Antes de publicar

1. Reemplazar `TU-DOMINIO` en `robots.txt` y `sitemap.xml`.
2. Opcional: agregar `<link rel="canonical" href="https://TU-DOMINIO/">` y cambiar `og:image` por la URL absoluta (`https://TU-DOMINIO/assets/img/og-image.jpg`) para que la vista previa en WhatsApp y Facebook sea perfecta.
3. Dar de alta el sitio en Google Search Console y crear/actualizar el perfil de Google Business con el mismo teléfono.

## Formulario

El formulario no necesita servidor: arma el mensaje con nombre, curso, zona y horario, y abre WhatsApp listo para enviar al 098 628 378. No se guarda ningún dato.

## Simulacro

- Cada simulacro tiene **30 preguntas**: las **10 fijas** (id 1 a 10, siempre primeras y en orden) y **20 sorteadas** entre las 81 restantes.
- Para cambiar cuántas son fijas o sorteadas, editá `FIXED_COUNT` y `RANDOM_COUNT` al inicio de `assets/js/simulacro.js`.
- Para agregar o corregir preguntas, editá `assets/js/preguntas.js`: `q` es la pregunta, `o` las opciones, `c` el índice de la correcta (0 = A) y `sign` la señal que se dibuja (opcional).
- El mejor resultado se guarda en el navegador de cada persona (no se envía a ningún lado).
