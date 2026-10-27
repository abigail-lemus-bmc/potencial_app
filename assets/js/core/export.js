/* ═══════════════════════════════════════════════════════════════════
   export.js — Figura en PNG
   Compone el esquema, la gráfica y el resultado en una sola imagen
   lista para pegar en el informe. Se rasteriza a doble densidad.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  // Los estilos viajan dentro del SVG: al convertirlo en imagen, la hoja
  // de la aplicación ya no está disponible. Las tipografías van incrustadas
  // para que el PNG salga igual en cualquier dispositivo.
  var ESTILOS = (global.FUENTES_SVG || '') + '\n' + [
    'svg{',
    '  --brass:#e7a94e; --brass-bright:#f2c078; --teal:#5fc9be;',
    '  --muted:#93a99e; --text:#e9f0ea; --text-soft:#c3d3c9;',
    '  --esq-trazo:rgba(214,235,225,0.6);',
    '  font-family:"Plex Sans","Segoe UI",system-ui,sans-serif;',
    '}',
    '.p-grid{stroke:rgba(214,235,225,0.07);stroke-width:1}',
    '.p-axis{stroke:rgba(214,235,225,0.3);stroke-width:1}',
    '.p-line{fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.p-guide{stroke:rgba(231,169,78,0.5);stroke-width:1;stroke-dasharray:3 3}',
    '.p-dot{fill:#e7a94e}',
    '.p-dot--alt{fill:#5fc9be}',
    '.p-mark{fill:#c3d3c9;font-family:"Plex Mono",Consolas,monospace;font-size:10.5px}',
    '.p-tick{fill:#93a99e;font-family:"Plex Mono",Consolas,monospace;font-size:11px}',
    '.p-label{fill:#93a99e;font-family:"Plex Mono",Consolas,monospace;font-size:10.5px}',

    '.es-eje{stroke:rgba(214,235,225,0.22);stroke-width:1;fill:none}',
    '.es-eje-texto{fill:#93a99e;font-family:"Plex Mono",Consolas,monospace;font-size:11px;font-style:italic}',
    '.es-linea{stroke:rgba(214,235,225,0.5);stroke-width:1;fill:none}',
    '.es-cota{stroke:rgba(214,235,225,0.3);stroke-width:1;fill:none}',
    '.es-cota-texto{fill:#93a99e;font-family:"Plex Mono",Consolas,monospace;font-size:11px}',
    '.es-guia{stroke:rgba(95,201,190,0.75);stroke-width:1.4;stroke-dasharray:5 4;fill:none}',
    '.es-aporte{stroke:rgba(231,169,78,0.7);stroke-width:1.2;fill:none}',
    '.es-carga{fill:#e7a94e;stroke:none}',
    '.es-signo{fill:#1a1206;font-family:"Plex Sans",system-ui,sans-serif;font-size:15px;font-weight:600}',
    '.es-punto{fill:#5fc9be}',
    '.es-centro{fill:rgba(214,235,225,0.6)}',
    '.es-elemento{fill:#f2c078;stroke:#08110f;stroke-width:1.5}',
    '.es-anillo-frente{fill:none;stroke:rgba(95,201,190,0.85);stroke-width:2.4}',
    '.es-anillo-atras{fill:none;stroke:rgba(95,201,190,0.28);stroke-width:1.6;stroke-dasharray:4 4}',
    '.es-arco{fill:none;stroke:rgba(95,201,190,0.85);stroke-width:2.6;stroke-linecap:round}',
    '.es-angulo{fill:none;stroke:rgba(231,169,78,0.7);stroke-width:1;stroke-dasharray:3 3}',
    '.es-equipo{fill:none;stroke:rgba(95,201,190,0.16);stroke-width:1;stroke-dasharray:3 5}',
    '.es-texto{fill:#c3d3c9;font-size:12.5px}',
    '.es-etiqueta{fill:#c3d3c9;font-size:12.5px}',
    '.es-nodo{fill:#e9f0ea;font-size:12.5px;font-weight:600}',
    '.es-simbolo{fill:#f2c078;font-size:13px;font-style:italic;font-family:"Spectral",Georgia,serif}',
    '.es-dato{fill:#93a99e;font-family:"Plex Mono",Consolas,monospace;font-size:11px}',
    '.es-varilla{stroke:rgba(95,201,190,0.85);stroke-width:3;fill:none;stroke-linecap:round}',
    '.es-disco{fill:rgba(95,201,190,0.1);stroke:rgba(95,201,190,0.7);stroke-width:1.6}',
    '.es-disco-anillo{fill:none;stroke:rgba(95,201,190,0.22);stroke-width:1;stroke-dasharray:4 4}',
    '.es-anillo-movil{fill:none;stroke:rgba(231,169,78,0.8);stroke-width:1.6}'
  ].join('\n');

  function aImagen(svg, anchoDestino) {
    return new Promise(function (resolve, reject) {
      if (!svg) { reject(new Error('No hay figura para exportar.')); return; }

      var vb = (svg.getAttribute('viewBox') || '0 0 520 250').split(/[\s,]+/).map(Number);
      var ratio = vb[3] / vb[2];

      var clone = svg.cloneNode(true);
      clone.setAttribute('xmlns', NS);
      clone.setAttribute('width', anchoDestino);
      clone.setAttribute('height', Math.round(anchoDestino * ratio));

      var style = document.createElementNS(NS, 'style');
      style.textContent = ESTILOS;
      clone.insertBefore(style, clone.firstChild);

      var texto = new XMLSerializer().serializeToString(clone);
      var img = new Image();

      img.onload = function () {
        resolve({ img: img, w: anchoDestino, h: Math.round(anchoDestino * ratio) });
      };
      img.onerror = function () { reject(new Error('No se pudo convertir la figura.')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(texto);
    });
  }

  function redondear(ctx, x, y, w, h, r) {    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Parte un texto en líneas de ancho aproximado. Suficiente para una
  // leyenda de una o dos líneas.
  function envolver(texto, ancho, tam) {
    if (!texto) return [];
    var porLinea = Math.max(24, Math.floor(ancho / (tam * 0.5)));
    var palabras = texto.split(/\s+/);
    var lineas = [];
    var actual = '';

    palabras.forEach(function (p) {
      var prueba = actual ? actual + ' ' + p : p;
      if (prueba.length > porLinea && actual) {
        lineas.push(actual);
        actual = p;
      } else {
        actual = prueba;
      }
    });
    if (actual) lineas.push(actual);
    return lineas;
  }

  function figura(opciones) {
    var ancho = 900;
    var pad = 44;
    var util = ancho - pad * 2;
    var dpr = Math.min(3, global.devicePixelRatio || 2);

    return Promise.all([
      aImagen(opciones.esquema, util * dpr),
      opciones.grafica ? aImagen(opciones.grafica, util * dpr) : Promise.resolve(null)
    ]).then(function (piezas) {
      var diagrama = piezas[0];
      var grafica = piezas[1];

      var hTitulo = 96;
      var hDiag = diagrama.h / dpr;
      var hGraf = grafica ? grafica.h / dpr : 0;
      var hPie = 108;
      var hueco = 26;

      // Leyenda del esquema, partida en líneas.
      var lineas = envolver(opciones.pie || '', util, 13);
      var hLeyenda = lineas.length ? lineas.length * 18 + 12 : 0;

      var alto = hTitulo + hDiag + hLeyenda + hueco + (grafica ? hGraf + hueco : 0) + hPie;

      var canvas = document.createElement('canvas');
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // fondo
      ctx.fillStyle = '#0b1512';
      ctx.fillRect(0, 0, ancho, alto);

      // encabezado
      ctx.fillStyle = '#e7a94e';
      ctx.font = '600 12px "Plex Mono", Consolas, monospace';
      ctx.fillText(opciones.etiqueta || 'FÍSICA II · POTENCIAL ELÉCTRICO', pad, 46);

      ctx.fillStyle = '#e9f0ea';
      ctx.font = '500 26px "Spectral", Georgia, serif';
      ctx.fillText(opciones.titulo || '', pad, 78);

      if (opciones.subtitulo) {
        ctx.fillStyle = '#93a99e';
        ctx.font = '13px "Plex Sans", system-ui, sans-serif';
        ctx.fillText(opciones.subtitulo, pad, 96);
      }

      ctx.strokeStyle = 'rgba(214,235,225,0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, hTitulo - 12);
      ctx.lineTo(ancho - pad, hTitulo - 12);
      ctx.stroke();

      // esquema
      ctx.drawImage(diagrama.img, pad, hTitulo, util, hDiag);

      // leyenda del esquema
      if (lineas.length) {
        ctx.fillStyle = '#8fa79b';
        ctx.font = 'italic 13px "Plex Sans", system-ui, sans-serif';
        lineas.forEach(function (linea, i) {
          ctx.fillText(linea, pad, hTitulo + hDiag + 20 + i * 18);
        });
      }

      // gráfica
      var y = hTitulo + hDiag + hLeyenda + hueco;
      if (grafica) {
        ctx.drawImage(grafica.img, pad, y, util, hGraf);
        y += hGraf + hueco;
      }

      // resultado
      ctx.strokeStyle = 'rgba(214,235,225,0.14)';
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(ancho - pad, y);
      ctx.stroke();

      ctx.fillStyle = '#93a99e';
      ctx.font = '600 11px "Plex Mono", Consolas, monospace';
      ctx.fillText('RESULTADO', pad, y + 30);

      ctx.fillStyle = '#f2c078';
      ctx.font = '600 30px "Plex Mono", Consolas, monospace';
      ctx.fillText(opciones.resultado || '', pad, y + 66);

      ctx.fillStyle = '#93a99e';
      ctx.font = '11px "Plex Sans", system-ui, sans-serif';
      ctx.fillText('k = 8.99 × 10⁹ N·m²/C² · tres cifras significativas', pad, y + 90);

      return canvas;
    });
  }

  function descargar(canvas, nombre) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) { reject(new Error('No se pudo generar el PNG.')); return; }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        resolve();
      }, 'image/png');
    });
  }

  global.Exportar = { figura: figura, descargar: descargar };
})(window);
