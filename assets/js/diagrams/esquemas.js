/* ═══════════════════════════════════════════════════════════════════
   esquemas.js — Figuras de los enunciados
   Cada esquema se dibuja con medidas proporcionales al ancho real del
   lienzo, para que el texto se lea igual en el teléfono que en pantalla
   grande. Solo se anima lo que enseña algo: el elemento dq recorriendo
   la distribución.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num;

  // Etiqueta con el valor tal como lo escribió el estudiante; si el campo
  // está vacío se cae al valor ya convertido.
  function val(v, campo, sufijo, alterno) {
    var raw = v && v.__raw ? v.__raw[campo] : null;
    if (raw === undefined || raw === null || String(raw).trim() === '') return alterno;
    return String(raw).trim() + ' ' + sufijo;
  }

  function corto(valor) { return N.formatPlain(valor, 3); }

  // Cota vertical: la horizontal no sirve para distancias sobre el eje y.
  function vcota(c, x, y1, y2, etiqueta, anchor) {
    c.line(x, y1, x, y2, 'es-cota');
    c.line(x - 6, y1, x + 6, y1, 'es-cota');
    c.line(x - 6, y2, x + 6, y2, 'es-cota');
    c.text(x + (anchor === 'end' ? -10 : 10), (y1 + y2) / 2 + 4, etiqueta, 'es-cota-texto', anchor || 'start');
  }

  /* ── carga puntual ───────────────────────────────────────────── */

  function puntual(c, v) {
    var W = c.W, H = c.H;
    var y = Math.round(H * 0.56);
    var xq = Math.round(W * 0.17);
    var xp = Math.round(W * 0.84);
    var r = Math.max(10, Math.round(W * 0.031));

    c.line(W * 0.04, y, W * 0.98, y, 'es-eje');

    // línea de cota con topes, de la carga al punto
    c.line(xq + r + 4, y, xp - 6, y, 'es-guia');
    c.line(xq + r + 4, y - 5, xq + r + 4, y + 5, 'es-cota');
    c.line(xp - 6, y - 5, xp - 6, y + 5, 'es-cota');

    c.carga(xq, y, r, v.q >= 0 ? '+' : '−', null);
    c.text(xq, y - r - 14, 'q = ' + val(v, 'q', 'µC', N.formatPlain(v.q * 1e6, 3) + ' µC'), 'es-dato');

    var medio = (xq + r + xp) / 2;
    c.text(medio, y - 9, 'r', 'es-simbolo');
    c.text(medio, y + 22, val(v, 'r', 'm', corto(v.r) + ' m'), 'es-dato');

    c.circle(xp, y, 4, 'es-punto');
    c.text(xp, y - 14, 'P', 'es-nodo');

    return {
      pie: 'La carga q y el punto P, a la distancia r. El potencial depende solo de esa distancia.'
    };
  }

  /* ── dos cargas puntuales ────────────────────────────────────── */

  function superposicion(c, v) {
    var W = c.W, H = c.H;
    var y = Math.round(H * 0.58);
    var x1 = Math.round(W * 0.15);
    var x2 = Math.round(W * 0.85);
    var xm = Math.round((x1 + x2) / 2);
    var r = Math.max(10, Math.round(W * 0.031));

    c.line(W * 0.04, y, W * 0.98, y, 'es-eje');

    c.carga(x1, y, r, v.q1 >= 0 ? '+' : '−', null);
    c.carga(x2, y, r, v.q2 >= 0 ? '+' : '−', null);

    c.text(x1, y - r - 14, val(v, 'q1', 'µC', N.formatPlain(v.q1 * 1e6, 3) + ' µC'), 'es-dato');
    c.text(x2, y - r - 14, val(v, 'q2', 'µC', N.formatPlain(v.q2 * 1e6, 3) + ' µC'), 'es-dato');

    c.circle(xm, y, 4, 'es-punto');
    c.text(xm, y - 13, 'P', 'es-nodo');

    c.cota(x1, x2, Math.round(H * 0.16), val(v, 'd', 'm', corto(v.d) + ' m'));
    c.cota(x1, xm, Math.round(H * 0.9), 'd/2');
    c.cota(xm, x2, Math.round(H * 0.9), 'd/2');

    return {
      pie: 'Dos cargas separadas d. Al ser P el punto medio, cada una queda a d/2.'
    };
  }

  /* ── anillo ──────────────────────────────────────────────────── */

  function anillo(c, v) {
    var W = c.W, H = c.H;
    var oy = Math.round(H * 0.5);
    var ox = Math.round(W * 0.27);
    var rx = Math.round(W * 0.21);
    var ry = Math.round(rx * 0.34);

    // eje del anillo
    c.line(W * 0.04, oy, W * 0.93, oy, 'es-eje');
    c.flecha(W * 0.93, oy, W * 0.99, oy, 'es-eje');
    c.text(W * 0.99, oy + 17, 'x', 'es-eje-texto', 'end');

    // mitad trasera (arriba) y delantera (abajo)
    c.path(
      'M ' + (ox - rx) + ' ' + oy + ' A ' + rx + ' ' + ry + ' 0 0 1 ' + (ox + rx) + ' ' + oy,
      'es-anillo-atras'
    );
    c.path(
      'M ' + (ox - rx) + ' ' + oy + ' A ' + rx + ' ' + ry + ' 0 0 0 ' + (ox + rx) + ' ' + oy,
      'es-anillo-frente'
    );

    c.circle(ox, oy, 2.5, 'es-centro');
    c.text(ox - 9, oy + 5, 'O', 'es-nodo', 'end');

    // posición de P: proporcional a x/R, con tope para que no se salga
    var proporcion = v.R > 0 ? v.x / v.R : 0;
    var dx = Math.min(W * 0.52, Math.max(rx * 0.3, rx * proporcion));
    var px = Math.round(ox + dx);

    var yCota = Math.round(oy + ry + 30);
    c.cota(ox, px, yCota, 'x = ' + val(v, 'x', 'm', corto(v.x) + ' m'));

    c.circle(px, oy, 4, 'es-punto');
    c.text(px, oy - 12, 'P', 'es-nodo');

    // elemento dq y sus líneas
    var a0 = -Math.PI / 2;
    var ex = ox + rx * Math.cos(a0);
    var ey = oy + ry * Math.sin(a0);

    var radio = c.line(ox, oy, ex, ey, 'es-guia');
    var guia = c.line(ex, ey, px, oy, 'es-guia');
    var punto = c.circle(ex, ey, 4.5, 'es-elemento');
    var etqDq = c.text(ex + 11, ey - 8, 'dq', 'es-simbolo', 'start');
    var etqS = c.text((ex + px) / 2, (ey + oy) / 2 - 8, 's', 'es-simbolo');
    var etqR = c.text(ox + (ex - ox) * 0.5 + 10, oy + (ey - oy) * 0.5 + 4, 'R', 'es-simbolo', 'start');

    c.text(W * 0.04, Math.round(H * 0.13), 'R = ' + val(v, 'R', 'm', corto(v.R) + ' m'), 'es-dato', 'start');

    function tick(t) {
      var a = t * 1.1 + a0;
      var x2 = ox + rx * Math.cos(a);
      var y2 = oy + ry * Math.sin(a);
      punto.setAttribute('cx', x2);
      punto.setAttribute('cy', y2);
      radio.setAttribute('x2', x2);
      radio.setAttribute('y2', y2);
      guia.setAttribute('x1', x2);
      guia.setAttribute('y1', y2);

      var arriba = y2 < oy;
      etqDq.setAttribute('x', x2 + 12);
      etqDq.setAttribute('y', y2 + (arriba ? -7 : 15));

      var ddx = px - x2;
      var ddy = oy - y2;
      var mod = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
      etqS.setAttribute('x', x2 + ddx * 0.62 + (ddy / mod) * 11);
      etqS.setAttribute('y', y2 + ddy * 0.62 - (ddx / mod) * 11 + 4);
      etqS.setAttribute('opacity', arriba ? '1' : '0');

      etqR.setAttribute('x', ox + (x2 - ox) * 0.5 + 10);
      etqR.setAttribute('y', oy + (y2 - oy) * 0.5 + 4);
    }
    tick(0);

    return {
      tick: tick,
      pie: 'Cualquier elemento dq está a la misma distancia s de P: por eso s sale de la integral.'
    };
  }

  /* ── arco semicircular ───────────────────────────────────────── */

  function arco(c, v) {
    var W = c.W, H = c.H;
    var ox = Math.round(W * 0.5);
    var oy = Math.round(H * 0.76);
    var R = Math.round(Math.min(W * 0.3, H * 0.52));

    c.line(W * 0.05, oy, W * 0.95, oy, 'es-eje');

    c.path(
      'M ' + (ox - R) + ' ' + oy + ' A ' + R + ' ' + R + ' 0 0 1 ' + (ox + R) + ' ' + oy,
      'es-arco'
    );

    c.circle(ox, oy, 2.5, 'es-centro');
    c.text(ox - 9, oy + 17, 'O', 'es-nodo', 'end');

    c.line(ox - R, oy - 6, ox - R, oy + 6, 'es-cota');
    c.line(ox + R, oy - 6, ox + R, oy + 6, 'es-cota');

    var a0 = 0.62;
    var ex = ox + R * Math.cos(a0);
    var ey = oy - R * Math.sin(a0);

    var radio = c.line(ox, oy, ex, ey, 'es-guia');
    var etqR = c.text(ox + R * 0.55 * Math.cos(a0) + 8, oy - R * 0.55 * Math.sin(a0) - 5, 'R', 'es-simbolo', 'start');
    var punto = c.circle(ex, ey, 4.5, 'es-elemento');
    var marca = c.path('', 'es-angulo');
    var etqTheta = c.text(0, 0, 'θ', 'es-simbolo');

    c.text(ox, oy - R - 14, 'dq = λ ds', 'es-dato');
    c.text(W * 0.04, Math.round(H * 0.13), 'R = ' + val(v, 'R', 'm', corto(v.R) + ' m'), 'es-dato', 'start');

    function tick(t) {
      var ciclo = (Math.sin(t * 0.7) + 1) / 2;
      var a = 0.22 + ciclo * (Math.PI - 0.44);
      var x2 = ox + R * Math.cos(a);
      var y2 = oy - R * Math.sin(a);
      punto.setAttribute('cx', x2);
      punto.setAttribute('cy', y2);
      radio.setAttribute('x2', x2);
      radio.setAttribute('y2', y2);
      etqR.setAttribute('x', ox + R * 0.55 * Math.cos(a) + 8);
      etqR.setAttribute('y', oy - R * 0.55 * Math.sin(a) - 5);

      var ar = Math.min(R * 0.32, 30);
      marca.setAttribute('d',
        'M ' + (ox + ar) + ' ' + oy +
        ' A ' + ar + ' ' + ar + ' 0 0 0 ' + (ox + ar * Math.cos(a)) + ' ' + (oy - ar * Math.sin(a)));
      etqTheta.setAttribute('x', ox + (ar + 10) * Math.cos(a / 2));
      etqTheta.setAttribute('y', oy - (ar + 10) * Math.sin(a / 2) + 4);
    }
    tick(0);

    return {
      tick: tick,
      pie: 'Todo el arco equidista R del centro, y P también: r = R para cada elemento dq.'
    };
  }

  // Altura relativa al ancho. El esquema de una sola carga no necesita
  // tanto aire como el del anillo.
  puntual.alto = 0.3;

  /* ── varilla sobre el eje ────────────────────────────────────── */

  function varillaEje(c, v) {
    var W = c.W, H = c.H;
    var y = Math.round(H * 0.56);
    var x0 = Math.round(W * 0.10);
    var fin = Math.round(W * 0.90);
    var span = fin - x0;

    // La varilla ocupa una parte del ancho proporcional a L/(L+d), con
    // topes para que las dos cotas quepan en el teléfono.
    var f = v.L / (v.L + v.d);
    f = Math.min(0.70, Math.max(0.24, f));
    var xL = Math.round(x0 + span * f);

    c.line(W * 0.04, y, W * 0.95, y, 'es-eje');
    c.flecha(W * 0.95, y, W * 0.99, y, 'es-eje');
    c.text(W * 0.99, y + 17, 'x', 'es-eje-texto', 'end');

    c.line(x0, y, xL, y, 'es-varilla');
    c.line(x0, y - 6, x0, y + 6, 'es-cota');
    c.line(xL, y - 6, xL, y + 6, 'es-cota');

    c.cota(x0, xL, y - 56, 'L = ' + val(v, 'L', 'm', corto(v.L) + ' m'));
    c.cota(xL, fin, y - 30, 'd = ' + val(v, 'd', 'm', corto(v.d) + ' m'));

    c.circle(fin, y, 4, 'es-punto');
    c.text(fin, y - 12, 'P', 'es-nodo');

    var ix = x0 + 8;
    var punto = c.circle(ix, y, 4.5, 'es-elemento');
    var etq = c.text(ix, y - 12, 'dq', 'es-simbolo');

    // La distancia r se acota por debajo del eje: va del elemento a P.
    var yr = y + 30;
    var e1 = c.line(ix, y + 6, ix, yr + 5, 'es-cota');
    var e2 = c.line(fin, y + 6, fin, yr + 5, 'es-cota');
    var linea = c.line(ix, yr, fin, yr, 'es-cota');
    var etqR = c.text((ix + fin) / 2, yr + 15, 'r', 'es-simbolo');

    function tick(t) {
      var u = (1 - Math.cos(t * 0.9)) / 2;
      var x = x0 + 8 + (xL - x0 - 8) * u;
      punto.setAttribute('cx', x);
      etq.setAttribute('x', x);
      e1.setAttribute('x1', x);
      e1.setAttribute('x2', x);
      linea.setAttribute('x1', x);
      etqR.setAttribute('x', (x + fin) / 2);
      etqR.setAttribute('opacity', fin - x < 30 ? '0' : '1');
    }
    tick(0);

    return {
      tick: tick,
      pie: 'El elemento dq recorre la varilla: su distancia a P, r, cambia con la posición x. Por eso hay que integrar.'
    };
  }
  varillaEje.alto = 0.44;

  /* ── varilla sobre la mediatriz ──────────────────────────────── */

  function varillaMediatriz(c, v) {
    var W = c.W, H = c.H;
    var oy = Math.round(H * 0.5);
    var ox = Math.round(W * 0.27);
    var media = Math.round(Math.min(H * 0.3, W * 0.21));

    c.line(W * 0.04, oy, W * 0.95, oy, 'es-eje');
    c.flecha(W * 0.95, oy, W * 0.99, oy, 'es-eje');
    c.text(W * 0.99, oy + 17, 'x', 'es-eje-texto', 'end');

    c.line(ox, oy - media, ox, oy + media, 'es-varilla');
    c.line(ox - 6, oy - media, ox + 6, oy - media, 'es-cota');
    c.line(ox - 6, oy + media, ox + 6, oy + media, 'es-cota');
    c.circle(ox, oy, 2.5, 'es-centro');

    var dx = Math.min(W * 0.62, Math.max(W * 0.26, W * 0.55 * (v.d / (v.d + v.L / 2))));
    var px = Math.round(ox + dx);

    // La cota de d va por debajo de la varilla, para no chocar con dq.
    var yBase = oy + media + 18;
    c.line(ox, oy + media, ox, yBase + 5, 'es-cota');
    c.line(px, oy + 5, px, yBase + 5, 'es-cota');
    c.cota(ox, px, yBase, 'd = ' + val(v, 'd', 'm', corto(v.d) + ' m'));

    c.circle(px, oy, 4, 'es-punto');
    c.text(px, oy - 12, 'P', 'es-nodo');

    c.text(ox, oy - media - 12, 'L = ' + val(v, 'L', 'm', corto(v.L) + ' m'), 'es-dato');

    var ey = oy - media * 0.6;
    var punto = c.circle(ox, ey, 4.5, 'es-elemento');
    var guia = c.line(ox, ey, px, oy, 'es-guia');
    var etq = c.text(ox - 9, ey + 4, 'dq', 'es-simbolo', 'end');
    var etqR = c.text(0, 0, 'r', 'es-simbolo');

    function tick(t) {
      var u = (1 - Math.cos(t * 0.8)) / 2;
      var y = oy + media * (0.9 - 1.8 * u);
      punto.setAttribute('cy', y);
      guia.setAttribute('y1', y);

      etq.setAttribute('y', y + 4);

      var mx = (ox + px) / 2, my = (y + oy) / 2;
      var vx = px - ox, vy = oy - y;
      var mod = Math.sqrt(vx * vx + vy * vy) || 1;
      etqR.setAttribute('x', mx + (vy / mod) * 11);
      etqR.setAttribute('y', my - (vx / mod) * 11 + 4);
    }
    tick(0);

    return {
      tick: tick,
      pie: 'El elemento dq sube por la varilla; cada posición tiene su propia distancia r a P, y por eso se integra.'
    };
  }
  varillaMediatriz.alto = 0.54;

  /* ── disco ───────────────────────────────────────────────────── */

  function disco(c, v) {
    var W = c.W, H = c.H;
    var oy = Math.round(H * 0.46);
    var ox = Math.round(W * 0.26);
    var rx = Math.round(W * 0.2);
    var ry = Math.round(rx * 0.36);

    c.line(W * 0.04, oy, W * 0.93, oy, 'es-eje');
    c.flecha(W * 0.93, oy, W * 0.99, oy, 'es-eje');
    c.text(W * 0.99, oy + 17, 'x', 'es-eje-texto', 'end');

    c.ellipse(ox, oy, rx, ry, 'es-disco');
    c.circle(ox, oy, 2.5, 'es-centro');
    c.text(ox - 9, oy + 5, 'O', 'es-nodo', 'end');

    // R se acota sobre el radio izquierdo; el anillo móvil no llega ahí.
    c.line(ox, oy, ox - rx, oy, 'es-guia');
    c.text(ox - rx * 0.78, oy - 9, 'R', 'es-simbolo');

    // P se coloca siempre fuera del disco: la cota x lleva el valor real.
    var px = Math.round(W * 0.74);
    c.cota(ox, px, Math.round(oy + ry + 34), 'x = ' + val(v, 'x', 'm', corto(v.x) + ' m'));
    c.circle(px, oy, 4, 'es-punto');
    c.text(px, oy - 13, 'P', 'es-nodo');

    c.text(W * 0.04, Math.round(H * 0.12), 'R = ' + val(v, 'R', 'm', corto(v.R) + ' m'), 'es-dato', 'start');

    var anillo = c.ellipse(ox, oy, 2, 2, 'es-anillo-movil');
    var punto = c.circle(ox, oy - 6, 4.5, 'es-elemento');
    var radio = c.line(ox, oy, ox, oy - 6, 'es-guia');
    var guia = c.line(ox, oy - 6, px, oy, 'es-guia');
    var etqDq = c.text(ox + 11, oy - 14, 'dq', 'es-simbolo', 'start');
    var etqS = c.text(0, 0, 's', 'es-simbolo');
    var etqR = c.text(0, 0, 'r', 'es-simbolo');

    function tick(t) {
      // El anillo crece de 0 a R y vuelve: es la variable de integración.
      var rho = 0.18 + 0.82 * ((Math.sin(t * 0.75) + 1) / 2);
      var rrx = rx * rho, rry = ry * rho;
      anillo.setAttribute('rx', rrx);
      anillo.setAttribute('ry', rry);

      var a = t * 1.05 - Math.PI / 2;
      var ex = ox + rrx * Math.cos(a);
      var ey = oy + rry * Math.sin(a);
      punto.setAttribute('cx', ex);
      punto.setAttribute('cy', ey);
      radio.setAttribute('x2', ex);
      radio.setAttribute('y2', ey);
      guia.setAttribute('x1', ex);
      guia.setAttribute('y1', ey);

      var arriba = ey < oy;
      etqDq.setAttribute('x', ex + 11);
      etqDq.setAttribute('y', ey + (arriba ? -6 : 15));

      etqS.setAttribute('x', ex + (px - ex) * 0.62);
      etqS.setAttribute('y', ey + (oy - ey) * 0.62 + 4);
      etqS.setAttribute('opacity', arriba ? '1' : '0');

      etqR.setAttribute('x', ox + (ex - ox) * 0.5 + 8);
      etqR.setAttribute('y', oy + (ey - oy) * 0.5 + 4);
    }
    tick(0);

    return {
      tick: tick,
      pie: 'El anillo de radio r crece de 0 a R. Cada anillo equidista de P, pero s cambia con r: de ahí la integral.'
    };
  }
  disco.alto = 0.54;

  /* ── dipolo ──────────────────────────────────────────────────── */

  function dipolo(c, v) {
    var W = c.W, H = c.H;
    var y = Math.round(H * 0.68);
    var c0 = Math.round(W * 0.34);
    var ratio = v.a > 0 ? v.x / v.a : 10;
    var step = Math.min((W * 0.88 - c0) / Math.max(ratio, 0.5), W * 0.17);
    step = Math.max(step, 9);

    var xn = Math.round(c0 - step);
    var xq = Math.round(c0 + step);
    var px = Math.round(Math.min(c0 + step * ratio, W * 0.92));
    var r = Math.max(6, Math.min(9, Math.round(step * 0.42)));

    c.line(W * 0.04, y, W * 0.95, y, 'es-eje');
    c.flecha(W * 0.95, y, W * 0.99, y, 'es-eje');
    c.text(W * 0.99, y + 17, 'x', 'es-eje-texto', 'end');

    c.carga(xn, y, r, '−', null);
    c.carga(xq, y, r, '+', null);
    c.text(xn, y - r - 12, '−q', 'es-etiqueta');
    c.text(xq, y - r - 12, '+q', 'es-etiqueta');

    c.circle(px, y, 4, 'es-punto');
    c.text(px, y - 12, 'P', 'es-nodo');

    c.cota(xq, px, y - 34, 'r₊ = ' + corto(v.x - v.a) + ' m');
    c.cota(xn, px, y - 64, 'r₋ = ' + corto(v.x + v.a) + ' m');

    c.cota(xn, c0, y + 32, 'a');
    c.cota(c0, xq, y + 32, 'a');

    c.text(W * 0.04, Math.round(H * 0.15), 'q = ' + val(v, 'q', 'µC', corto(v.q * 1e6) + ' µC'), 'es-dato', 'start');

    return {
      pie: 'Las distancias se miden desde el centro: r₊ = x − a y r₋ = x + a. La separación total entre las cargas es 2a.'
    };
  }
  dipolo.alto = 0.54;

  /* ── diferencia de potencial ─────────────────────────────────── */

  function diferencia(c, v) {
    var W = c.W, H = c.H;
    var y = Math.round(H * 0.56);
    var xq = Math.round(W * 0.12);
    var r = Math.max(8, Math.round(W * 0.026));
    var inicio = xq + r + 10;
    var fin = W * 0.92;
    var total = Math.max(v.rA + v.rB, 1e-9);

    var xA = Math.round(inicio + (fin - inicio) * (v.rA / total));
    var xB = Math.round(inicio + (fin - inicio) * (v.rB / total));

    // Si las distancias son casi iguales, los puntos se separan un poco
    // para que las dos cotas se lean.
    if (Math.abs(xB - xA) < 26) {
      if (xA <= xB) xB = Math.min(fin, xA + 26);
      else xA = Math.min(fin, xB + 26);
    }

    c.line(W * 0.04, y, W * 0.98, y, 'es-eje');
    c.carga(xq, y, r, v.q >= 0 ? '+' : '−', null);
    c.text(xq, y - r - 14, 'q = ' + val(v, 'q', 'µC', corto(v.q * 1e6) + ' µC'), 'es-dato');

    c.circle(xA, y, 4, 'es-punto');
    c.text(xA, y - 13, 'A', 'es-nodo');
    c.circle(xB, y, 4, 'es-punto');
    c.text(xB, y - 13, 'B', 'es-nodo');

    c.cota(xq, xA, y + 26, 'r_A = ' + corto(v.rA) + ' m');
    c.cota(xq, xB, y + 58, 'r_B = ' + corto(v.rB) + ' m');

    return {
      pie: 'Los dos puntos están sobre el mismo eje. A está a r_A de la carga y B a r_B; el potencial de cada uno depende solo de su distancia.'
    };
  }
  diferencia.alto = 0.52;

  /* ── energía de tres cargas ──────────────────────────────────── */

  function energia(c, v) {
    var W = c.W, H = c.H;
    var s = Math.min(W * 0.58, H * 0.62);
    var h = s * Math.sqrt(3) / 2;
    var cx = W * 0.5;
    var cy = H * 0.62;
    var arriba = { x: cx, y: cy - h * 0.66 };
    var izq = { x: cx - s / 2, y: cy + h * 0.34 };
    var der = { x: cx + s / 2, y: cy + h * 0.34 };
    var r = Math.max(7, Math.round(W * 0.024));

    c.path('M ' + izq.x + ' ' + izq.y + ' L ' + arriba.x + ' ' + arriba.y +
      ' L ' + der.x + ' ' + der.y + ' Z', 'es-linea');

    c.carga(izq.x, izq.y, r, v.q1 >= 0 ? '+' : '−', null);
    c.carga(der.x, der.y, r, v.q2 >= 0 ? '+' : '−', null);
    c.carga(arriba.x, arriba.y, r, v.q3 >= 0 ? '+' : '−', null);

    c.text(izq.x - r - 8, izq.y + 5, 'q₁', 'es-etiqueta', 'end');
    c.text(der.x + r + 8, der.y + 5, 'q₂', 'es-etiqueta', 'start');
    c.text(arriba.x, arriba.y - r - 10, 'q₃', 'es-etiqueta');

    c.cota(izq.x, der.x, der.y + 30, 'L = ' + corto(v.L) + ' m');

    return {
      pie: 'En un triángulo equilátero los tres pares de cargas están separados la misma distancia L. La energía total suma los tres pares una sola vez.'
    };
  }
  energia.alto = 0.58;

  /* ── potencial, energía y trabajo ────────────────────────────── */

  function trabajo(c, v) {
    var W = c.W, H = c.H;
    var ox = Math.round(W * 0.30);
    var oy = Math.round(H * 0.76);
    var ax = Math.round(W * 0.74);
    var by = Math.round(H * 0.26);
    var r = Math.max(6, Math.round(W * 0.022));

    // Patas a y b del rectángulo: sólidas, son las distancias del enunciado.
    c.line(ox, oy, ax, oy, 'es-linea');
    c.line(ox, oy, ox, by, 'es-linea');

    // Distancias de cada carga hasta P: discontinuas para no confundirlas
    // con las patas del rectángulo.
    c.line(ox, oy, ax, by, 'es-guia');
    c.line(ax, oy, ax, by, 'es-guia');
    c.line(ox, by, ax, by, 'es-guia');

    c.carga(ox, oy, r, v.q1 >= 0 ? '+' : '−', null);
    c.carga(ax, oy, r, v.q2 >= 0 ? '+' : '−', null);
    c.carga(ox, by, r, v.q3 >= 0 ? '+' : '−', null);
    c.carga(ax, by, r, v.q0 >= 0 ? '+' : '−', null);

    c.text(ox - r - 14, oy + 5, 'q₁', 'es-etiqueta', 'end');
    c.text(ax + r + 8, oy + 5, 'q₂', 'es-etiqueta', 'start');
    c.text(ox - r - 14, by + 5, 'q₃', 'es-etiqueta', 'end');
    c.text(ax + r + 8, by - 8, 'q₀', 'es-etiqueta', 'start');

    c.text((ox + ax) / 2, oy + 24, 'a = ' + corto(v.a) + ' m', 'es-cota-texto');
    vcota(c, ox - 14, oy, by, 'b = ' + corto(v.b) + ' m', 'end');

    c.text((ox + ax) / 2 + 12, (oy + by) / 2 - 6, 'r₁', 'es-simbolo');
    c.text(ax + 12, (oy + by) / 2, 'r₂', 'es-simbolo', 'start');
    c.text((ox + ax) / 2, by - 10, 'r₃', 'es-simbolo');

    c.text(W * 0.04, Math.round(H * 0.1), 'P = (' + corto(v.a) + ', ' + corto(v.b) + ') m', 'es-dato', 'start');

    return {
      pie: 'Las tres cargas fijas forman un rectángulo y P ocupa el cuarto vértice. Cada distancia r₁, r₂, r₃ se mide por separado.'
    };
  }
  trabajo.alto = 0.58;

  /* ── línea infinita ──────────────────────────────────────────── */

  function linea(c, v) {
    var W = c.W, H = c.H;
    var yL = Math.round(H * 0.66);
    var xP = Math.round(W * 0.58);
    var unit = (H * 0.42) / Math.max(v.r, v.r0, 1e-9);
    var yP = yL - Math.max(10, v.r * unit);
    var yRef = yL - Math.max(4, v.r0 * unit);

    c.line(W * 0.05, yL, W * 0.95, yL, 'es-varilla');
    c.text(W * 0.035, yL + 4, '∞', 'es-eje-texto', 'end');
    c.text(W * 0.965, yL + 4, '∞', 'es-eje-texto', 'start');

    c.line(W * 0.1, yRef, W * 0.9, yRef, 'es-guia');
    c.text(W * 0.9, yRef - 8, 'V = 0 en r₀ = ' + corto(v.r0) + ' m', 'es-dato', 'end');

    c.circle(xP, yP, 4, 'es-punto');
    c.text(xP + 10, yP - 6, 'P', 'es-nodo', 'start');

    c.line(xP, yP, xP, yL, 'es-guia');
    c.text(xP + 14, (yP + yL) / 2 + 4, 'r = ' + corto(v.r) + ' m', 'es-cota-texto', 'start');

    c.text(W * 0.05, Math.round(H * 0.16), 'λ = ' + corto(v.lambda * 1e6) + ' µC/m', 'es-dato', 'start');

    return {
      pie: 'La línea se extiende hasta el infinito. P está a la distancia r y el nivel cero se fija en r₀, no en el infinito.'
    };
  }
  linea.alto = 0.5;

  /* ── esfera aislante ─────────────────────────────────────────── */

  function esfera(c, v) {
    var W = c.W, H = c.H;
    var cx = Math.round(W * 0.36);
    var cy = Math.round(H * 0.40);
    var R = Math.round(Math.min(W * 0.22, H * 0.24));
    var r = Math.max(2.5, Math.round(W * 0.008));

    c.circle(cx, cy, R, 'es-disco');

    // Carga repartida en el volumen: puntos fijos, sin animación.
    var puntos = [
      [-0.55, -0.35], [-0.2, -0.62], [0.25, -0.5], [0.6, -0.2],
      [-0.62, 0.1], [-0.3, -0.12], [0.08, 0.08], [0.48, 0.25],
      [-0.35, 0.45], [0.1, 0.55], [0.35, -0.05], [-0.1, 0.35]
    ];
    puntos.forEach(function (p) {
      c.circle(cx + p[0] * R, cy + p[1] * R, r, 'es-centro');
    });

    c.circle(cx, cy, 2.5, 'es-centro');
    c.text(cx - 9, cy + 5, 'O', 'es-nodo', 'end');

    var razon = v.R > 0 ? v.r / v.R : 0;
    var dx = Math.min(W * 0.56, Math.max(0, R * razon));
    var px = Math.round(cx + dx);
    c.circle(px, cy, 4, 'es-punto');
    c.text(px, cy - 11, 'P', 'es-nodo');

    c.cota(cx, cx + R, cy + R + 26, 'R = ' + corto(v.R) + ' m');

    // La cota de r lleva la etiqueta debajo de la línea: centrada arriba
    // chocaría con el tope de la cota de R.
    var yr = cy + R + 50;
    c.line(cx, yr, px, yr, 'es-cota');
    c.line(cx, yr - 6, cx, yr + 6, 'es-cota');
    c.line(px, yr - 6, px, yr + 6, 'es-cota');
    c.text((cx + px) / 2, yr + 16, 'r = ' + corto(v.r) + ' m', 'es-cota-texto');

    c.text(W * 0.04, Math.round(H * 0.07), 'Q = ' + corto(v.Q * 1e6) + ' µC', 'es-dato', 'start');

    return {
      pie: 'La esfera tiene la carga repartida en todo el volumen. P puede quedar dentro o fuera; el potencial cambia de fórmula al cruzar la superficie.'
    };
  }
  esfera.alto = 0.74;

  /* ── corteza esférica ────────────────────────────────────────── */

  function corteza(c, v) {
    var W = c.W, H = c.H;
    var cx = Math.round(W * 0.36);
    var cy = Math.round(H * 0.40);
    var R = Math.round(Math.min(W * 0.22, H * 0.24));

    c.circle(cx, cy, R, 'es-anillo-frente');

    // Cargas sobre la superficie.
    for (var i = 0; i < 10; i++) {
      var a = (i / 10) * Math.PI * 2;
      c.circle(cx + R * Math.cos(a), cy + R * Math.sin(a), 2.6, 'es-carga');
    }

    c.circle(cx, cy, 2.5, 'es-centro');
    c.text(cx - 9, cy + 5, 'O', 'es-nodo', 'end');

    var razon = v.R > 0 ? v.r / v.R : 0;
    var dx = Math.min(W * 0.56, Math.max(0, R * razon));
    var px = Math.round(cx + dx);
    c.circle(px, cy, 4, 'es-punto');
    c.text(px, cy - 11, 'P', 'es-nodo');

    c.cota(cx, cx + R, cy + R + 26, 'R = ' + corto(v.R) + ' m');

    var yr = cy + R + 50;
    c.line(cx, yr, px, yr, 'es-cota');
    c.line(cx, yr - 6, cx, yr + 6, 'es-cota');
    c.line(px, yr - 6, px, yr + 6, 'es-cota');
    c.text((cx + px) / 2, yr + 16, 'r = ' + corto(v.r) + ' m', 'es-cota-texto');

    c.text(W * 0.04, Math.round(H * 0.07), 'Q = ' + corto(v.Q * 1e6) + ' µC en la superficie', 'es-dato', 'start');

    return {
      pie: 'Toda la carga está en la superficie. En el interior no hay campo, pero el potencial es constante e igual al de la superficie.'
    };
  }
  corteza.alto = 0.74;

  /* ── placas paralelas ────────────────────────────────────────── */

  function placas(c, v) {
    var W = c.W, H = c.H;
    var xa = Math.round(W * 0.28);
    var xb = Math.round(W * 0.72);
    var y0 = Math.round(H * 0.22);
    var y1 = Math.round(H * 0.70);
    var alta = v.VA >= v.VB;

    c.line(xa, y0, xa, y1, 'es-varilla');
    c.line(xb, y0, xb, y1, 'es-varilla');

    c.text(xa, y0 - 12, alta ? '+' : '−', 'es-nodo');
    c.text(xb, y0 - 12, alta ? '−' : '+', 'es-nodo');
    c.text(xa, y1 + 20, 'V_A = ' + corto(v.VA) + ' V', 'es-dato');
    c.text(xb, y1 + 20, 'V_B = ' + corto(v.VB) + ' V', 'es-dato');

    for (var i = 0; i < 4; i++) {
      var yy = y0 + (y1 - y0) * ((i + 0.5) / 4);
      if (alta) c.flecha(xa + 6, yy, xb - 6, yy, 'es-aporte', true);
      else c.flecha(xb - 6, yy, xa + 6, yy, 'es-aporte', true);
    }

    c.text((xa + xb) / 2, y0 - 12, 'E', 'es-simbolo');
    c.cota(xa, xb, y1 + 46, 'd = ' + corto(v.d) + ' m');

    var px = Math.round((xa + xb) / 2);
    var py = Math.round((y0 + y1) / 2);
    c.carga(px, py, 6, v.q >= 0 ? '+' : '−', null);
    c.text(px - 12, py + 4, 'q', 'es-etiqueta', 'end');

    return {
      pie: 'El campo va de la placa de mayor potencial a la de menor y es uniforme. La separación d fija cuánto cae el potencial por metro.'
    };
  }
  placas.alto = 0.64;

  /* ── gradiente ───────────────────────────────────────────────── */

  function gradiente(c, v) {
    var W = c.W, H = c.H;
    var cx = Math.round(W * 0.36);
    var cy = Math.round(H * 0.54);
    var base = Math.min(W * 0.1, H * 0.16);
    var r2 = base * 1.7;
    var ang = Math.atan2(v.y0, v.x0);
    var px = cx + r2 * Math.cos(ang);
    var py = cy - r2 * Math.sin(ang);
    var largo = base * 1.35;

    [1, 1.7, 2.4].forEach(function (k) {
      c.circle(cx, cy, base * k, 'es-equipo');
    });

    c.line(W * 0.06, cy, W * 0.92, cy, 'es-eje');
    c.flecha(W * 0.92, cy, W * 0.96, cy, 'es-eje');
    c.text(W * 0.96, cy + 16, 'x', 'es-eje-texto', 'end');
    c.line(cx, H * 0.14, cx, H * 0.92, 'es-eje');
    c.flecha(cx, H * 0.92, cx, H * 0.96, 'es-eje');
    c.text(cx + 8, H * 0.14, 'y', 'es-eje-texto', 'start');

    c.circle(px, py, 4.5, 'es-punto');
    c.text(px + 10, py + 18, 'P', 'es-nodo', 'start');

    c.flecha(px, py, px + largo * Math.cos(ang), py - largo * Math.sin(ang), 'es-aporte', true);
    c.text(px + largo * Math.cos(ang) + 8, py - largo * Math.sin(ang) + 4, '∇f', 'es-simbolo', 'start');

    return {
      pie: 'Las circunferencias son curvas de nivel de f = x² + y². El gradiente sale de P en dirección radial, perpendicular a la curva de nivel.'
    };
  }
  gradiente.alto = 0.54;

  /* ── equipotenciales ─────────────────────────────────────────── */

  function equipotenciales(c, v) {
    var W = c.W, H = c.H;
    var cx = Math.round(W * 0.36);
    var cy = Math.round(H * 0.54);
    var resto = Math.max(50 - v.V0, 1e-6);
    var a = Math.sqrt(resto / 4);
    var b = Math.sqrt(resto / 9);
    var rx = Math.min(W * 0.26, (H * 0.34) * (a / b));
    var ry = rx * (b / a);

    c.line(W * 0.05, cy, W * 0.92, cy, 'es-eje');
    c.flecha(W * 0.92, cy, W * 0.96, cy, 'es-eje');
    c.text(W * 0.96, cy + 16, 'x', 'es-eje-texto', 'end');
    c.line(cx, H * 0.12, cx, H * 0.94, 'es-eje');
    c.flecha(cx, H * 0.94, cx, H * 0.98, 'es-eje');
    c.text(cx + 8, H * 0.12, 'y', 'es-eje-texto', 'start');

    c.ellipse(cx, cy, rx, ry, 'es-anillo-frente');

    // Si P no cae sobre la equipotencial pedida, se dibuja de trazos la
    // curva de nivel que sí pasa por P: así se ve que E es perpendicular.
    var nivelP = 50 - 4 * v.x0 * v.x0 - 9 * v.y0 * v.y0;
    if (Math.abs(nivelP - v.V0) > 0.01 && nivelP > 0) {
      var k = Math.sqrt((50 - nivelP) / resto);
      if (k > 0.05 && k < 3) c.ellipse(cx, cy, rx * k, ry * k, 'es-disco-anillo');
    }

    var px = cx + rx * (v.x0 / a);
    var py = cy - ry * (v.y0 / b);
    c.circle(px, py, 4.5, 'es-punto');
    c.text(px - 10, py + 20, 'P', 'es-nodo', 'end');

    var Ex = 8 * v.x0, Ey = 18 * v.y0;
    var mod = Math.sqrt(Ex * Ex + Ey * Ey) || 1;
    var largo = Math.min(W * 0.16, H * 0.24);
    c.flecha(px, py, px + largo * Ex / mod, py - largo * Ey / mod, 'es-aporte', true);
    c.text(px + largo * Ex / mod + 8, py - largo * Ey / mod + 4, 'E', 'es-simbolo', 'start');

    c.text(cx + rx + 6, cy - 7, 'a', 'es-simbolo', 'start');
    c.text(cx + 10, cy - ry + 16, 'b', 'es-simbolo', 'start');

    return {
      pie: 'La elipse de trazo continuo es la equipotencial V = V₀; la de trazos pasa por P. El campo E sale perpendicular a esa curva, hacia donde el potencial disminuye.'
    };
  }
  equipotenciales.alto = 0.54;

  global.Esquemas = {
    puntual: puntual,
    superposicion: superposicion,
    anillo: anillo,
    arco: arco,
    varillaEje: varillaEje,
    varillaMediatriz: varillaMediatriz,
    disco: disco,
    dipolo: dipolo,
    diferencia: diferencia,
    energia: energia,
    trabajo: trabajo,
    linea: linea,
    esfera: esfera,
    corteza: corteza,
    placas: placas,
    gradiente: gradiente,
    equipotenciales: equipotenciales
  };
})(window);
