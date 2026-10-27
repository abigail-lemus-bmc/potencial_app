/* ═══════════════════════════════════════════════════════════════════
   gradiente.js — Gradiente de una superficie escalar
   El gradiente reúne las derivadas parciales en un vector. Apunta hacia
   donde la función crece más rápido y su módulo es esa máxima razón de
   cambio.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  function campos() {
    return [
      V.field({ id: 'x0', label: 'Coordenada x del punto P', symbol: 'x₀', unit: 'm' }),
      V.field({ id: 'y0', label: 'Coordenada y del punto P', symbol: 'y₀', unit: 'm' })
    ];
  }

  function validar(v) {
    var warnings = {};
    if (v.x0 === 0 && v.y0 === 0) {
      warnings.y0 = 'En el origen el gradiente es cero: es un punto crítico.';
    }
    return { errors: {}, warnings: warnings };
  }

  function resolver(v) {
    var x0 = v.x0, y0 = v.y0;
    var gx = 2 * x0, gy = 2 * y0;
    var modulo = Math.sqrt(gx * gx + gy * gy);
    var angulo = Math.atan2(gy, gx) * 180 / Math.PI;
    if (angulo < 0) angulo += 360;
    var f0 = x0 * x0 + y0 * y0;
    var p = Math.sqrt(f0);
    var tangente = 2 * p;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Gradiente de la función',
        bloques: [
          { t: 'text', html: 'La función es <i>f</i>(<i>x</i>, <i>y</i>) = <i>x</i><sup>2</sup> + <i>y</i><sup>2</sup>. El gradiente se forma con las derivadas parciales:' },
          { t: 'eq', html: '∇' + M.v('f') + ' = ' + M.frac('∂' + M.v('f'), '∂' + M.v('x')) + M.v('i') + ' + ' + M.frac('∂' + M.v('f'), '∂' + M.v('y')) + M.v('j') },
          { t: 'calc', html: M.frac('∂' + M.v('f'), '∂' + M.v('x')) + ' = 2' + M.v('x') + ',   ' + M.frac('∂' + M.v('f'), '∂' + M.v('y')) + ' = 2' + M.v('y') },
          { t: 'eq', html: '∇' + M.v('f') + ' = 2' + M.v('x') + ' ' + M.v('i') + ' + 2' + M.v('y') + ' ' + M.v('j') }
        ],
        resultado: { label: '∇f', html: '2x i + 2y j' }
      },
      {
        letra: 'b',
        titulo: 'Gradiente en el punto P',
        bloques: [
          { t: 'text', html: 'Se evalúa la expresión general en (<i>x</i>₀, <i>y</i>₀) = (' + N.format(x0, 3) + ', ' + N.format(y0, 3) + '):' },
          { t: 'eq', html: '∇' + M.v('f(' + N.format(x0, 3) + ', ' + N.format(y0, 3) + ')') + ' = 2(' + N.format(x0, 3) + ')' + M.v('i') + ' + 2(' + N.format(y0, 3) + ')' + M.v('j') },
          { t: 'eq', html: '∇' + M.v('f') + ' = ' + N.format(gx, 3) + ' ' + M.v('i') + ' + ' + N.format(gy, 3) + ' ' + M.v('j') },
          { t: 'text', html: 'El valor de la función en P es <i>f</i>(<i>P</i>) = ' + N.format(f0, 3) + '.' }
        ],
        resultado: { label: '∇f(P)', html: N.format(gx, 3) + ' i + ' + N.format(gy, 3) + ' j' }
      },
      {
        letra: 'c',
        titulo: 'Magnitud del gradiente',
        bloques: [
          { t: 'eq', html: '|∇' + M.v('f') + '| = ' + M.sqrt('(' + N.format(gx, 3) + ')<sup>2</sup> + (' + N.format(gy, 3) + ')<sup>2</sup>') },
          { t: 'calc', html: '(' + N.format(gx, 3) + ')<sup>2</sup> + (' + N.format(gy, 3) + ')<sup>2</sup> = ' + N.format(gx * gx + gy * gy, 4) },
          { t: 'eq', html: '|∇' + M.v('f') + '| = ' + N.format(modulo, 4) }
        ],
        resultado: { label: '|∇f|', html: N.format(modulo, 3) }
      },
      {
        letra: 'd',
        titulo: 'Dirección del gradiente',
        bloques: [
          { t: 'eq', html: 'θ = tan<sup>−1</sup> ' + M.frac(M.v('g<sub>y</sub>'), M.v('g<sub>x</sub>')) + ' = tan<sup>−1</sup> ' + M.frac(N.format(gy, 3), N.format(gx, 3)) },
          { t: 'calc', html: 'θ = ' + N.format(angulo, 4) + '°' },
          { t: 'text', html: 'El ángulo se mide desde el eje <i>x</i> positivo, en sentido antihorario.' }
        ],
        resultado: { label: 'θ', html: N.format(angulo, 3) + '°' }
      },
      {
        letra: 'e',
        titulo: 'Interpretación geométrica',
        bloques: [
          { t: 'text', html: 'Las curvas de nivel de <i>f</i> = <i>x</i><sup>2</sup> + <i>y</i><sup>2</sup> son circunferencias centradas en el origen. El gradiente en <i>P</i> es radial: sale perpendicular a la circunferencia que pasa por <i>P</i>.' },
          { t: 'text', html: 'Su módulo, ' + N.format(modulo, 3) + ', es la razón de cambio máxima de la función. La pendiente de la tangente en la gráfica es justamente ese valor: ' + N.format(tangente, 3) + ' por unidad de distancia.' },
          { t: 'text', html: 'La dirección opuesta, −∇<i>f</i>, es la de máximo descenso. En un campo eléctrico, <i>E</i> = −∇<i>V</i>: el campo apunta hacia donde el potencial baja.' }
        ]
      }
    ];

    // Corte de f en la dirección del gradiente, con la recta tangente.
    var base = Math.max(p, 1e-6);
    var sMin = -0.6 * base, sMax = 1.4 * base;
    var puntos = [];
    var pasos = 200;
    for (var i = 0; i <= pasos; i++) {
      var s = sMin + (sMax - sMin) * (i / pasos);
      var rr = base + s;
      puntos.push({ x: s, y: rr * rr });
    }
    var tanPts = [
      { x: sMin, y: f0 + tangente * sMin },
      { x: sMax, y: f0 + tangente * sMax }
    ];

    return {
      principal: '∇f = ' + N.format(gx, 3) + ' i + ' + N.format(gy, 3) + ' j',
      datos: [
        { sym: 'P', value: '(' + N.format(x0, 3) + ', ' + N.format(y0, 3) + ') m', conv: '' },
        { sym: 'f(P)', value: N.format(f0, 3), conv: '' },
        { sym: '∇f(P)', value: N.format(gx, 3) + ' i + ' + N.format(gy, 3) + ' j', conv: '' },
        { sym: '|∇f|', value: N.format(modulo, 3), conv: '' },
        { sym: 'θ', value: N.format(angulo, 3) + '°', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'distancia desde P (m)',
        yLabel: 'f', xUnit: 'm', yUnit: '',
        series: [
          { points: puntos, color: 'var(--teal)', label: 'f a lo largo del gradiente' },
          { points: tanPts, color: 'var(--muted)', dash: '5 5', label: 'tangente en P' }
        ],
        marker: { x: 0, y: f0 }
      },
      cierre: 'En P, el gradiente es ' + N.format(gx, 3) + ' i + ' + N.format(gy, 3) + ' j, con módulo ' + N.format(modulo, 3) + ' y dirección ' + N.format(angulo, 3) + '°.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'gradiente',
    nombre: 'Gradiente',
    grupo: 'Campo y potencial',
    resumen: 'Gradiente de f(x, y) = x² + y² en un punto: vector, módulo, dirección e interpretación.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
