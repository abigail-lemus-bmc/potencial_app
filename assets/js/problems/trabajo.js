/* ═══════════════════════════════════════════════════════════════════
   trabajo.js — Potencial, energía y trabajo en un campo de tres cargas
   El potencial en P es la suma escalar de los aportes de cada carga.
   La energía de una carga de prueba es q₀V y el trabajo del campo para
   llevarla al infinito es −ΔU.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'q1', label: 'Carga en el origen', symbol: 'q₁', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'q2', label: 'Carga sobre el eje x', symbol: 'q₂', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'q3', label: 'Carga sobre el eje y', symbol: 'q₃', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'q0', label: 'Carga de prueba en P', symbol: 'q₀', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'a', label: 'Distancia horizontal', symbol: 'a', unit: 'm', min: 0 }),
      V.field({ id: 'b', label: 'Distancia vertical', symbol: 'b', unit: 'm', min: 0 })
    ];
  }

  function validar(v) {
    var errors = {}, warnings = {};
    if (v.q1 === 0 && v.q2 === 0 && v.q3 === 0) {
      errors.q1 = 'Las tres cargas fijas están en cero: no hay potencial en P.';
    }
    if (v.q0 === 0) {
      warnings.q0 = 'Con q₀ = 0 la energía y el trabajo son cero.';
    }
    if (Math.abs(v.a - v.b) < 1e-9) {
      warnings.b = 'Con a = b el punto P queda sobre la diagonal; el cálculo sigue siendo válido.';
    }
    return { errors: errors, warnings: warnings };
  }

  function resolver(v) {
    var q1 = v.q1, q2 = v.q2, q3 = v.q3, q0 = v.q0, a = v.a, b = v.b;
    var r1 = Math.sqrt(a * a + b * b);
    var r2 = b;
    var r3 = a;
    var V1 = K * q1 / r1;
    var V2 = K * q2 / r2;
    var V3 = K * q3 / r3;
    var potencial = V1 + V2 + V3;
    var energia = q0 * potencial;
    var trabajo = energia;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Distancias de cada carga al punto P',
        bloques: [
          { t: 'text', html: 'Las cargas están en los vértices de un rectángulo: <i>q</i>₁ en (0, 0), <i>q</i>₂ en (<i>a</i>, 0) y <i>q</i>₃ en (0, <i>b</i>). El punto <i>P</i> está en (<i>a</i>, <i>b</i>).' },
          { t: 'calc', html: M.v('r<sub>1</sub>') + ' = ' + M.sqrt(N.format(a, 3) + '<sup>2</sup> + ' + N.format(b, 3) + '<sup>2</sup>') + ' = ' + N.format(r1, 4) + ' m' },
          { t: 'calc', html: M.v('r<sub>2</sub>') + ' = ' + N.format(b, 3) + ' m (misma vertical que P)' },
          { t: 'calc', html: M.v('r<sub>3</sub>') + ' = ' + N.format(a, 3) + ' m (misma horizontal que P)' },
          { t: 'note', html: 'La distancia a cada carga se mide por separado. No se puede usar una sola distancia para las tres.' }
        ],
        resultado: { label: 'r₁, r₂, r₃', html: N.format(r1, 3) + ', ' + N.format(r2, 3) + ' y ' + N.format(r3, 3) + ' m' }
      },
      {
        letra: 'b',
        titulo: 'Potencial de cada carga en P',
        bloques: [
          { t: 'eq', html: M.v('V<sub>1</sub>') + ' = ' + M.frac('k' + M.v('q<sub>1</sub>'), M.v('r<sub>1</sub>')) + ' = ' + N.format(V1, 4) + ' V' },
          { t: 'eq', html: M.v('V<sub>2</sub>') + ' = ' + M.frac('k' + M.v('q<sub>2</sub>'), M.v('r<sub>2</sub>')) + ' = ' + N.format(V2, 4) + ' V' },
          { t: 'eq', html: M.v('V<sub>3</sub>') + ' = ' + M.frac('k' + M.v('q<sub>3</sub>'), M.v('r<sub>3</sub>')) + ' = ' + N.format(V3, 4) + ' V' },
          { t: 'text', html: 'Cada aporte lleva el signo de su carga. Las cargas negativas restan.' }
        ]
      },
      {
        letra: 'c',
        titulo: 'Potencial total en P',
        bloques: [
          { t: 'text', html: 'El potencial es escalar: se suman los tres aportes sin vectores ni componentes.' },
          { t: 'eq', html: M.v('V(P)') + ' = ' + M.v('V<sub>1</sub>') + ' + ' + M.v('V<sub>2</sub>') + ' + ' + M.v('V<sub>3</sub>') },
          { t: 'calc', html: M.v('V(P)') + ' = ' + N.format(V1, 4) + ' + (' + N.format(V2, 4) + ') + ' + N.format(V3, 4) },
          { t: 'calc', html: M.v('V(P)') + ' = ' + N.format(potencial, 4) + ' V' }
        ],
        resultado: { label: 'V(P)', html: N.format(potencial, 3) + ' V' }
      },
      {
        letra: 'd',
        titulo: 'Energía potencial de la carga de prueba',
        bloques: [
          { t: 'eq', html: M.v('U') + ' = ' + M.v('q<sub>0</sub>') + ' ' + M.v('V(P)') },
          { t: 'eq', html: M.v('U') + ' = (' + N.format(q0, 3) + ')(' + N.format(potencial, 4) + ') = ' + N.format(energia, 4) + ' J' },
          { t: 'note', html: energia >= 0
            ? 'La energía es positiva: hay que hacer trabajo externo para traer q₀ desde el infinito hasta P.'
            : 'La energía es negativa: el campo atrae a q₀ y el sistema gana energía al acercarla.' }
        ],
        resultado: { label: 'U', html: N.format(energia, 3) + ' J' }
      },
      {
        letra: 'e',
        titulo: 'Trabajo del campo al llevar q₀ al infinito',
        bloques: [
          { t: 'text', html: 'En el infinito la energía potencial es cero. El cambio de energía al ir de P al infinito es:' },
          { t: 'eq', html: M.v('ΔU') + ' = ' + M.v('U<sub>∞</sub>') + ' − ' + M.v('U<sub>P</sub>') + ' = 0 − (' + N.format(energia, 4) + ') = ' + N.format(-energia, 4) + ' J' },
          { t: 'text', html: 'El trabajo del campo es menos ese cambio:' },
          { t: 'eq', html: M.v('W<sub>campo</sub>') + ' = −' + M.v('ΔU') + ' = ' + N.format(trabajo, 4) + ' J' },
          { t: 'text', html: 'Si el trabajo sale positivo, el campo empuja la carga hacia el infinito. Si sale negativo, hay que sostenerla o empujarla.' }
        ],
        resultado: { label: 'W', html: N.format(trabajo, 3) + ' J' }
      }
    ];

    // Energía de q₀ mientras se aleja de P en la dirección de la diagonal.
    var puntos = [];
    var pasos = 220;
    for (var i = 0; i <= pasos; i++) {
      var t = 3 * (i / pasos);
      var k = 1 + t;
      var d1 = r1 * k;
      var d2 = Math.sqrt(a * a * t * t + b * b * k * k);
      var d3 = Math.sqrt(a * a * k * k + b * b * t * t);
      var s = t * r1;
      puntos.push({ x: s, y: q0 * K * (q1 / d1 + q2 / d2 + q3 / d3) });
    }

    return {
      principal: 'V(P) = ' + N.texto(potencial, 3) + ' V',
      datos: [
        { sym: 'q₁', value: N.format(q1 * 1e6, 3) + ' µC', conv: N.format(q1, 3) + ' C' },
        { sym: 'q₂', value: N.format(q2 * 1e6, 3) + ' µC', conv: N.format(q2, 3) + ' C' },
        { sym: 'q₃', value: N.format(q3 * 1e6, 3) + ' µC', conv: N.format(q3, 3) + ' C' },
        { sym: 'q₀', value: N.format(q0 * 1e6, 3) + ' µC', conv: N.format(q0, 3) + ' C' },
        { sym: 'a', value: N.format(a, 3) + ' m', conv: '' },
        { sym: 'b', value: N.format(b, 3) + ' m', conv: '' },
        { sym: 'V(P)', value: N.format(potencial, 3) + ' V', conv: '' },
        { sym: 'U', value: N.format(energia, 3) + ' J', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'distancia recorrida desde P (m)', yLabel: 'U (J)', xUnit: 'm', yUnit: 'J',
        series: [{ points: puntos, color: 'var(--teal)' }],
        marker: { x: 0, y: energia }
      },
      cierre: 'En P, V = ' + N.format(potencial, 3) + ' V; la carga q₀ tiene U = ' + N.format(energia, 3) + ' J y el campo realiza ' + N.format(trabajo, 3) + ' J al llevarla al infinito.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'trabajo',
    nombre: 'Potencial, energía y trabajo',
    grupo: 'Cargas puntuales',
    resumen: 'Potencial en un punto debido a tres cargas, energía de una carga de prueba y trabajo para llevarla al infinito.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
