/* ═══════════════════════════════════════════════════════════════════
   plot.js — Motor de gráficas SVG
   Dibuja series de puntos sobre ejes con escala agradable, marcas,
   líneas guía y lectura al pasar el dedo. Sin librerías.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num;

  function el(name, attrs, text) {
    var node = document.createElementNS('http://www.w3.org/2000/svg', name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    }
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function clear(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  }

  // Paso "bonito": 1, 2, 2.5, 5 × 10ⁿ
  function niceStep(raw) {
    if (!isFinite(raw) || raw <= 0) return 1;
    var exp = Math.floor(Math.log10(raw));
    var base = Math.pow(10, exp);
    var f = raw / base;
    var mult = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return mult * base;
  }

  function decimalsFor(step) {
    if (step >= 1) return 0;
    return Math.min(4, Math.max(0, Math.ceil(-Math.log10(step))));
  }

  function tickLabel(value, step) {
    if (value === 0) return '0';
    var abs = Math.abs(value);
    if (abs >= 1e4 || abs < 1e-3) {
      var p = N.parts(value, 2);
      return p.mantissa + '×10' + N.superscript(String(p.exp));
    }
    return value.toFixed(decimalsFor(step));
  }

  function linePath(points, sx, sy) {
    var d = '';
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      if (!isFinite(p.y)) continue;
      d += (d ? 'L' : 'M') + sx(p.x).toFixed(2) + ' ' + sy(p.y).toFixed(2);
    }
    return d;
  }

  function render(svg, cfg) {
    clear(svg);
    var series = (cfg.series || []).filter(function (s) { return s.points && s.points.length; });
    if (!series.length) return;

    // Se dibuja a escala 1:1 con los píxeles reales, así el texto nunca
    // queda diminuto en el teléfono ni gigante en el escritorio.
    var W = Math.max(300, Math.round(svg.clientWidth || 720));
    var H = W < 560 ? 290 : 370;

    var all = [];
    series.forEach(function (s) { all = all.concat(s.points); });
    if (cfg.marker) all.push(cfg.marker);
    if (cfg.markers) all = all.concat(cfg.markers);

    var xMin = cfg.xMin !== undefined ? cfg.xMin : Math.min.apply(null, all.map(function (p) { return p.x; }));
    var xMax = cfg.xMax !== undefined ? cfg.xMax : Math.max.apply(null, all.map(function (p) { return p.x; }));
    var yRaw = all.map(function (p) { return p.y; }).filter(isFinite);
    var yMin = cfg.clipY ? cfg.clipY[0] : Math.min.apply(null, yRaw);
    var yMax = cfg.clipY ? cfg.clipY[1] : Math.max.apply(null, yRaw);

    if (xMax - xMin < 1e-12) xMax = xMin + 1;
    if (yMax - yMin < 1e-12) { yMax = yMin + Math.abs(yMin || 1) * 0.2; }

    var angosto = W < 560;
    var M = { top: angosto ? 34 : 32, right: 16, bottom: angosto ? 56 : 54, left: angosto ? 60 : 74 };
    var PW = W - M.left - M.right;
    var PH = H - M.top - M.bottom;

    function sx(x) { return M.left + ((x - xMin) / (xMax - xMin)) * PW; }
    function sy(y) { return M.top + PH - ((y - yMin) / (yMax - yMin)) * PH; }

    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('role', 'img');

    // rejilla
    // El eje vertical se ajusta a los múltiplos del paso para que siempre
    // quede rotulado de arriba abajo, también cuando hay valores negativos.
    var yStep = niceStep((yMax - yMin) / (angosto ? 4 : 5));
    if (!cfg.clipY) {
      yMin = Math.floor(yMin / yStep - 1e-9) * yStep;
      yMax = Math.ceil(yMax / yStep + 1e-9) * yStep;
    }
    var yT = [];
    for (var vy = yMin; vy <= yMax + yStep * 1e-6; vy += yStep) {
      yT.push(parseFloat(vy.toPrecision(12)));
    }

    // El eje horizontal conserva el rango exacto de la serie.
    var xStep = niceStep((xMax - xMin) / (angosto ? 3 : 5));
    var xT = [];
    for (var intento = 0; intento < 4; intento++) {
      xT = [];
      for (var vx = Math.ceil(xMin / xStep - 1e-9) * xStep; vx <= xMax + xStep * 1e-6; vx += xStep) {
        xT.push(parseFloat(vx.toPrecision(12)));
      }
      if (xT.length >= 2) break;
      xStep /= 2;
    }

    yT.forEach(function (t) {
      svg.appendChild(el('line', {
        x1: M.left, x2: M.left + PW, y1: sy(t), y2: sy(t),
        class: t === 0 ? 'p-axis' : 'p-grid'
      }));
    });
    xT.forEach(function (t) {
      svg.appendChild(el('line', {
        x1: sx(t), x2: sx(t), y1: M.top, y2: M.top + PH,
        class: t === 0 ? 'p-axis' : 'p-grid'
      }));
    });

    // series
    series.forEach(function (s) {
      svg.appendChild(el('path', {
        d: linePath(s.points, sx, sy),
        class: 'p-line',
        stroke: s.color || 'var(--teal)',
        'stroke-dasharray': s.dash || 'none'
      }));
    });

    // marcas sobre los ejes
    yT.forEach(function (t) {
      svg.appendChild(el('text', {
        x: M.left - 12, y: sy(t) + 4, 'text-anchor': 'end', class: 'p-tick'
      }, tickLabel(t, yStep)));
    });
    xT.forEach(function (t) {
      svg.appendChild(el('text', {
        x: sx(t), y: M.top + PH + 22, 'text-anchor': 'middle', class: 'p-tick'
      }, tickLabel(t, xStep)));
    });

    // rótulos de ejes
    svg.appendChild(el('text', {
      x: M.left - 12, y: M.top - 20, 'text-anchor': 'end', class: 'p-label'
    }, cfg.yLabel || ''));
    svg.appendChild(el('text', {
      x: M.left + PW, y: M.top + PH + 44, 'text-anchor': 'end', class: 'p-label'
    }, cfg.xLabel || ''));

    // valor buscado
    if (cfg.marker) {
      var mx = sx(cfg.marker.x), my = sy(cfg.marker.y);
      svg.appendChild(el('line', {
        x1: mx, x2: mx, y1: my, y2: M.top + PH, class: 'p-guide'
      }));
      svg.appendChild(el('line', {
        x1: M.left, x2: mx, y1: my, y2: my, class: 'p-guide'
      }));
      svg.appendChild(el('circle', { cx: mx, cy: my, r: 5.5, class: 'p-dot' }));
    }

    // Varios puntos señalados: sirve para comparar dos posiciones o dos
    // cargas sin llenar la figura de guías.
    if (cfg.markers) {
      cfg.markers.forEach(function (m, i) {
        var px = sx(m.x), py = sy(m.y);
        svg.appendChild(el('circle', {
          cx: px, cy: py, r: i === 0 ? 5.5 : 4.5,
          class: 'p-dot' + (i === 0 ? '' : ' p-dot--alt')
        }));
        if (m.label) {
          svg.appendChild(el('text', {
            x: px + (m.dx === undefined ? 9 : m.dx),
            y: py + (m.dy === undefined ? -9 : m.dy),
            class: 'p-mark',
            'text-anchor': 'start'
          }, m.label));
        }
      });
    }

    // lectura al pasar el dedo
    attachReadout(svg, {
      series: series[0], sx: sx, sy: sy,
      xUnit: cfg.xUnit || '', yUnit: cfg.yUnit || '',
      box: { left: M.left, top: M.top, w: PW, h: PH }
    });
  }

  function attachReadout(svg, ctx) {
    var readout = svg.parentNode.querySelector('.plot__readout');
    if (!readout) return;
    var active = null;

    function place(evt) {
      var rect = svg.getBoundingClientRect();
      var scale = W / rect.width;
      var x = (evt.clientX - rect.left) * scale;
      var y = (evt.clientY - rect.top) * scale;
      if (x < ctx.box.left || x > ctx.box.left + ctx.box.w ||
          y < ctx.box.top || y > ctx.box.top + ctx.box.h) return hide();

      var pts = ctx.series.points;
      var best = null, bestD = Infinity;
      for (var i = 0; i < pts.length; i++) {
        var d = Math.abs(ctx.sx(pts[i].x) - x);
        if (d < bestD) { bestD = d; best = pts[i]; }
      }
      if (!best) return hide();

      if (!active) {
        active = {
          v: appendLine(svg),
          h: appendLine(svg),
          dot: svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'circle'))
        };
        active.dot.setAttribute('r', 4.5);
        active.dot.setAttribute('class', 'p-dot p-dot--hover');
      }
      var px = ctx.sx(best.x), py = ctx.sy(best.y);
      active.v.setAttribute('x1', px); active.v.setAttribute('x2', px);
      active.v.setAttribute('y1', py); active.v.setAttribute('y2', ctx.box.top + ctx.box.h);
      active.h.setAttribute('x1', ctx.box.left); active.h.setAttribute('x2', px);
      active.h.setAttribute('y1', py); active.h.setAttribute('y2', py);
      active.dot.setAttribute('cx', px); active.dot.setAttribute('cy', py);

      readout.innerHTML = '<b>' + N.format(best.x, 3) + '</b> ' + (ctx.xUnit || '') +
        ' → <b>' + N.format(best.y, 3) + '</b> ' + (ctx.yUnit || '');
      readout.hidden = false;
    }

    function appendLine(svgNode) {
      return svgNode.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
    }

    function hide() {
      if (!active) return;
      active.v.remove(); active.h.remove(); active.dot.remove();
      active = null;
      readout.hidden = true;
    }

    svg.addEventListener('pointermove', place);
    svg.addEventListener('pointerdown', place);
    svg.addEventListener('pointerleave', hide);
  }

  global.Plot = { render: render };
})(window);
