/* ═══════════════════════════════════════════════════════════════════
   diagram.js — Motor de esquemas geométricos
   Dibuja la figura del enunciado en un SVG y, cuando aporta algo,
   anima el elemento de carga recorriendo la distribución.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var contador = 0;

  var reducido = false;
  try {
    reducido = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { reducido = false; }

  function el(name, attrs, text) {
    var node = document.createElementNS(NS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
      });
    }
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  // Lienzo con utilidades de dibujo. Todo dibujo pasa por aquí para que
  // los esquemas se lean igual entre sí.
  function lienzo(svg, W, H) {
    var id = 'esq' + (++contador);
    var defs = el('defs');

    function marcador(nombre, relleno) {
      var m = el('marker', {
        id: id + '-' + nombre,
        viewBox: '0 0 10 10',
        refX: '9', refY: '5',
        markerWidth: '7', markerHeight: '7',
        orient: 'auto-start-reverse'
      });
      m.appendChild(el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: relleno }));
      return m;
    }

    defs.appendChild(marcador('flecha', 'var(--esq-trazo)'));
    defs.appendChild(marcador('flecha-brass', 'var(--brass)'));
    svg.appendChild(defs);

    function line(x1, y1, x2, y2, cls, extra) {
      var attrs = { x1: x1, y1: y1, x2: x2, y2: y2, class: cls || 'es-linea' };
      if (extra) Object.keys(extra).forEach(function (k) { attrs[k] = extra[k]; });
      return svg.appendChild(el('line', attrs));
    }

    function path(d, cls, extra) {
      var attrs = { d: d, class: cls || 'es-linea' };
      if (extra) Object.keys(extra).forEach(function (k) { attrs[k] = extra[k]; });
      return svg.appendChild(el('path', attrs));
    }

    function circle(cx, cy, r, cls, extra) {
      var attrs = { cx: cx, cy: cy, r: r, class: cls || 'es-punto' };
      if (extra) Object.keys(extra).forEach(function (k) { attrs[k] = extra[k]; });
      return svg.appendChild(el('circle', attrs));
    }

    function ellipse(cx, cy, rx, ry, cls, extra) {
      var attrs = { cx: cx, cy: cy, rx: rx, ry: ry, class: cls || 'es-disco' };
      if (extra) Object.keys(extra).forEach(function (k) { attrs[k] = extra[k]; });
      return svg.appendChild(el('ellipse', attrs));
    }

    function text(x, y, str, cls, anchor, extra) {
      var attrs = { x: x, y: y, class: cls || 'es-texto', 'text-anchor': anchor || 'middle' };
      if (extra) Object.keys(extra).forEach(function (k) { attrs[k] = extra[k]; });
      return svg.appendChild(el('text', attrs, str));
    }

    // Línea con punta de flecha.
    function flecha(x1, y1, x2, y2, cls, brass) {
      line(x1, y1, x2, y2, cls, {
        'marker-end': 'url(#' + id + '-' + (brass ? 'flecha-brass' : 'flecha') + ')'
      });
    }

    // Cota horizontal con topes, como en un plano.
    function cota(x1, x2, y, etiqueta) {
      line(x1, y, x2, y, 'es-cota');
      line(x1, y - 6, x1, y + 6, 'es-cota');
      line(x2, y - 6, x2, y + 6, 'es-cota');
      text((x1 + x2) / 2, y - 10, etiqueta, 'es-cota-texto');
    }

    // Carga con su signo dentro.
    function carga(cx, cy, r, signo, etiqueta, dy) {
      circle(cx, cy, r, 'es-carga');
      text(cx, cy + 6, signo, 'es-signo');
      if (etiqueta) text(cx, cy + r + 20 + (dy || 0), etiqueta, 'es-etiqueta');
    }

    return {
      id: id,
      svg: svg,
      W: W,
      H: H,
      el: el,
      line: line,
      path: path,
      circle: circle,
      ellipse: ellipse,
      text: text,
      flecha: flecha,
      cota: cota,
      carga: carga
    };
  }

  function render(svg, esquema, datos, conAnimacion) {
    detener(svg);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Medidas reales: así el texto del esquema no se encoge en el teléfono.
    var W = Math.max(280, Math.round(svg.clientWidth || 520));
    var H = Math.round(W * (esquema.alto || 0.46));

    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');
    svg.classList.add('esquema-svg');

    var c = lienzo(svg, W, H);
    var api = esquema(c, datos) || {};

    if (api.tick && conAnimacion !== false && !reducido) {
      var inicio = 0;
      function paso(now) {
        if (!inicio) inicio = now;
        api.tick((now - inicio) / 1000);
        svg.__anim = global.requestAnimationFrame(paso);
      }
      svg.__anim = global.requestAnimationFrame(paso);
    } else if (api.tick) {
      api.tick(0.35);
    }
    if (api.pintar) api.pintar();
    return api;
  }

  function detener(svg) {
    if (svg && svg.__anim) {
      global.cancelAnimationFrame(svg.__anim);
      svg.__anim = null;
    }
  }

  global.Diagram = {
    render: render,
    detener: detener,
    NS: NS
  };
})(window);
