/* ═══════════════════════════════════════════════════════════════════
   equipotenciales.js — Superficies equipotenciales y campo eléctrico
   Con V(x, y) = 50 − 4x² − 9y², cada valor de V dibuja una elipse. El
   campo es E = −∇V y por eso resulta perpendicular a la equipotencial.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var V0REF = 50;   // constante de la expresión de la guía
  var A2 = 4;       // coeficiente de x²
  var B2 = 9;       // coeficiente de y²

  function campos() {
    return [
      V.field({ id: 'V0', label: 'Potencial de la equipotencial', symbol: 'V₀', unit: 'V', help: 'Debe ser menor que 50 V para que la curva exista.' }),
      V.field({ id: 'x0', label: 'Coordenada x del punto P', symbol: 'x₀', unit: 'm' }),
      V.field({ id: 'y0', label: 'Coordenada y del punto P', symbol: 'y₀', unit: 'm' })
    ];
  }

  function validar(v) {
    var errors = {}, warnings = {};
    var resto = V0REF - v.V0;
    if (resto <= 0) {
      errors.V0 = 'Con V₀ ≥ 50 V la ecuación no tiene solución real: la equipotencial no existe.';
    }
    var enP = V0REF - A2 * v.x0 * v.x0 - B2 * v.y0 * v.y0;
    if (Math.abs(enP - v.V0) > 0.01) {
      warnings.y0 = 'P no está sobre la equipotencial V = ' + N.format(v.V0, 3) + ' V (ahí V = ' + N.format(enP, 3) + ' V). El campo se calcula igual, pero el dibujo marca la curva del nivel pedido.';
    }
    return { errors: errors, warnings: warnings };
  }

  function resolver(v) {
    var V0 = v.V0, x0 = v.x0, y0 = v.y0;
    var resto = V0REF - V0;
    var a = Math.sqrt(resto / A2);
    var b = Math.sqrt(resto / B2);
    var Ex = 2 * A2 * x0;
    var Ey = 2 * B2 * y0;
    var modulo = Math.sqrt(Ex * Ex + Ey * Ey);
    var angulo = Math.atan2(Ey, Ex) * 180 / Math.PI;
    if (angulo < 0) angulo += 360;
    var potencialP = V0REF - A2 * x0 * x0 - B2 * y0 * y0;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Ecuación de la equipotencial',
        bloques: [
          { t: 'text', html: 'La equipotencial se obtiene fijando <i>V</i>(<i>x</i>, <i>y</i>) = ' + N.format(V0, 3) + ' V:' },
          { t: 'eq', html: '50 − 4' + M.v('x<sup>2</sup>') + ' − 9' + M.v('y<sup>2</sup>') + ' = ' + N.format(V0, 3) },
          { t: 'eq', html: '4' + M.v('x<sup>2</sup>') + ' + 9' + M.v('y<sup>2</sup>') + ' = ' + N.format(resto, 3) },
          { t: 'eq', html: M.frac(M.v('x<sup>2</sup>'), N.format(a * a, 3)) + ' + ' + M.frac(M.v('y<sup>2</sup>'), N.format(b * b, 3)) + ' = 1' }
        ],
        resultado: { label: 'curva', html: 'x²/' + N.format(a * a, 3) + ' + y²/' + N.format(b * b, 3) + ' = 1' }
      },
      {
        letra: 'b',
        titulo: 'Identificación geométrica',
        bloques: [
          { t: 'text', html: 'La ecuación tiene la forma de una elipse centrada en el origen, con semiejes:' },
          { t: 'calc', html: M.v('a') + ' = ' + M.sqrt(N.format(resto, 3) + ' / ' + A2) + ' = ' + N.format(a, 4) + ' m' },
          { t: 'calc', html: M.v('b') + ' = ' + M.sqrt(N.format(resto, 3) + ' / ' + B2) + ' = ' + N.format(b, 4) + ' m' },
          { t: 'text', html: 'El semieje mayor está sobre el eje <i>x</i> porque el coeficiente de <i>x</i>² es menor. Cuanto menor es <i>V</i>₀, más grande es la elipse: las equipotenciales se separan al alejarse del centro.' }
        ],
        resultado: { label: 'a, b', html: N.format(a, 3) + ' m y ' + N.format(b, 3) + ' m' }
      },
      {
        letra: 'c',
        titulo: 'Campo eléctrico',
        bloques: [
          { t: 'text', html: 'El campo es el gradiente del potencial cambiado de signo:' },
          { t: 'eq', html: M.v('E') + ' = −∇' + M.v('V') + ' = −(' + M.frac('∂' + M.v('V'), '∂' + M.v('x')) + M.v('i') + ' + ' + M.frac('∂' + M.v('V'), '∂' + M.v('y')) + M.v('j') + ')' },
          { t: 'calc', html: M.frac('∂' + M.v('V'), '∂' + M.v('x')) + ' = −8' + M.v('x') + ',   ' + M.frac('∂' + M.v('V'), '∂' + M.v('y')) + ' = −18' + M.v('y') },
          { t: 'eq', html: M.v('E') + ' = 8' + M.v('x') + ' ' + M.v('i') + ' + 18' + M.v('y') + ' ' + M.v('j') },
          { t: 'text', html: 'En <i>P</i> (' + N.format(x0, 3) + ', ' + N.format(y0, 3) + '):' },
          { t: 'eq', html: M.v('E(P)') + ' = ' + N.format(Ex, 3) + ' ' + M.v('i') + ' + ' + N.format(Ey, 3) + ' ' + M.v('j') + ' V/m' }
        ],
        resultado: { label: 'E(P)', html: N.format(Ex, 3) + ' i + ' + N.format(Ey, 3) + ' j' }
      },
      {
        letra: 'd',
        titulo: 'Módulo y dirección del campo',
        bloques: [
          { t: 'eq', html: '|' + M.v('E') + '| = ' + M.sqrt('(' + N.format(Ex, 3) + ')<sup>2</sup> + (' + N.format(Ey, 3) + ')<sup>2</sup>') + ' = ' + N.format(modulo, 4) + ' V/m' },
          { t: 'eq', html: 'θ = tan<sup>−1</sup> ' + M.frac(M.v('E<sub>y</sub>'), M.v('E<sub>x</sub>')) + ' = ' + N.format(angulo, 4) + '°' },
          { t: 'note', html: 'El campo apunta hacia donde el potencial disminuye, es decir, hacia el exterior de la elipse. Por eso es perpendicular a la curva de nivel y no tangente a ella.' }
        ],
        resultado: { label: '|E|, θ', html: N.format(modulo, 3) + ' V/m, ' + N.format(angulo, 3) + '°' }
      },
      {
        letra: 'e',
        titulo: 'Trabajo sobre una equipotencial',
        bloques: [
          { t: 'text', html: 'Si una carga se mueve sobre la misma curva equipotencial, su potencial no cambia: Δ<i>V</i> = 0.' },
          { t: 'eq', html: M.v('W<sub>campo</sub>') + ' = −' + M.v('q') + ' ' + M.v('ΔV') + ' = 0' },
          { t: 'text', html: 'El campo no realiza trabajo sobre una carga que se desplaza por una equipotencial, porque la fuerza es perpendicular al desplazamiento en cada punto.' },
          { t: 'text', html: 'En <i>P</i> el potencial vale ' + N.format(potencialP, 3) + ' V. ' + (Math.abs(potencialP - V0) < 0.01
            ? 'Coincide con el nivel pedido: P está sobre la equipotencial.'
            : 'No coincide con el nivel pedido: P está sobre otra equipotencial.') }
        ]
      }
    ];

    var xMax = a * 1.35;
    var puntos = [];
    var pasos = 220;
    for (var i = 0; i <= pasos; i++) {
      var x = -xMax + 2 * xMax * (i / pasos);
      puntos.push({ x: x, y: V0REF - A2 * x * x });
    }
    var nivel = [
      { x: -xMax, y: V0 },
      { x: xMax, y: V0 }
    ];

    return {
      principal: 'V₀ = ' + N.texto(V0, 3) + ' V',
      datos: [
        { sym: 'V₀', value: N.format(V0, 3) + ' V', conv: '' },
        { sym: 'a', value: N.format(a, 3) + ' m', conv: '' },
        { sym: 'b', value: N.format(b, 3) + ' m', conv: '' },
        { sym: 'P', value: '(' + N.format(x0, 3) + ', ' + N.format(y0, 3) + ') m', conv: '' },
        { sym: 'E(P)', value: N.format(modulo, 3) + ' V/m', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'x (m), corte en y = 0', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
        series: [
          { points: puntos, color: 'var(--teal)', label: 'V(x, 0)' },
          { points: nivel, color: 'var(--muted)', dash: '5 5', label: 'nivel V₀' }
        ],
        markers: [
          { x: -a, y: V0, label: '−a', dx: -24, dy: -8 },
          { x: a, y: V0, label: 'a', dx: 8, dy: -8 }
        ]
      },
      cierre: 'La equipotencial V = ' + N.format(V0, 3) + ' V es una elipse de semiejes ' + N.format(a, 3) + ' m y ' + N.format(b, 3) + ' m; en P el campo vale ' + N.format(modulo, 3) + ' V/m.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'equipotenciales',
    nombre: 'Equipotenciales',
    grupo: 'Campo y potencial',
    resumen: 'Curvas equipotenciales de V = 50 − 4x² − 9y², campo eléctrico y trabajo sobre una equipotencial.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
