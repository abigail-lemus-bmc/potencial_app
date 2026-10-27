/* Genera assets/js/core/fonts.js incrustando las tipografías en base64.
   Así el PNG exportado se dibuja con las mismas letras en cualquier
   teléfono, aunque no tenga Consolas ni las fuentes instaladas.
   Uso: node tools/fonts.js */
'use strict';

const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');

const FUENTES = [
  { familia: 'Plex Mono', archivo: 'plex-mono-400.woff2', peso: 400, estilo: 'normal' },
  { familia: 'Plex Sans', archivo: 'plex-sans-400.woff2', peso: 400, estilo: 'normal' },
  { familia: 'Plex Sans', archivo: 'plex-sans-600.woff2', peso: 600, estilo: 'normal' },
  { familia: 'Spectral', archivo: 'spectral-400.woff2', peso: 400, estilo: 'italic' }
];

const trozos = FUENTES.map((f) => {
  const ruta = path.join(raiz, 'assets', 'fonts', f.archivo);
  const datos = fs.readFileSync(ruta).toString('base64');
  return (
    "@font-face{font-family:'" + f.familia + "';font-style:" + f.estilo +
    ";font-weight:" + f.peso + ";font-display:block;src:url(data:font/woff2;base64," +
    datos + ") format('woff2')}"
  );
});

const salida = [
  '/* Archivo generado por tools/fonts.js — no editar a mano.',
  '   Tipografías incrustadas para que la figura exportada se dibuje igual',
  '   en cualquier dispositivo. */',
  '(function (global) {',
  "  'use strict';",
  '  global.FUENTES_SVG = ' + JSON.stringify(trozos.join('\n')) + ';',
  '})(window);',
  ''
].join('\n');

fs.writeFileSync(path.join(raiz, 'assets', 'js', 'core', 'fonts.js'), salida, 'utf8');

const kb = (Buffer.byteLength(salida) / 1024).toFixed(0);
console.log('fonts.js generado (' + kb + ' KB, ' + FUENTES.length + ' fuentes)');
