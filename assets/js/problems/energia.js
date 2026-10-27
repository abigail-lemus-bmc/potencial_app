/* ═══════════════════════════════════════════════════════════════════
   energia.js — Energía potencial de tres cargas en un triángulo
   La energía del sistema es la suma de las energías de cada par. No se
   suman tres veces las mismas cargas: cada par se cuenta una sola vez.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'q1', label: 'Carga 1', symbol: 'q₁', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'q2', label: 'Carga 2', symbol: 'q₂', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'q3', label: 'Carga 3', symbol: 'q₃', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'L', label: 'Lado del triángulo', symbol: 'L', unit: 'm', min: 0 })
    ];
  }

  function validar(v) {
    var errors = {}, warnings = {};
    if (v.q1 === 0 && v.q2 === 0 && v.q3 === 0) {
      errors.q1 = 'Si las tres cargas son cero no hay energía que calcular.';
    }
    if (v.q1 !== 0 && v.q2 !== 0 && v.q3 !== 0) {
      var total = v.q1 * v.q2 + v.q1 * v.q3 + v.q2 * v.q3;
      if (Math.abs(total) < 1e-18) {
        warnings.q3 = 'Las contribuciones se cancelan: la energía total del sistema es cero.';
      }
    }
    return { errors: errors, warnings: warnings };
  }

  function resolver(v) {
    var q1 = v.q1, q2 = v.q2, q3 = v.q3, L = v.L;
    var kL = K / L;
    var U12 = kL * q1 * q2;
    var U13 = kL * q1 * q3;
    var U23 = kL * q2 * q3;
    var total = U12 + U13 + U23;
    var pares = [
      { a: 1, b: 2, u: U12, qa: q1, qb: q2, signo: q1 * q2 > 0 ? 'se repelen' : 'se atraen' },
      { a: 1, b: 3, u: U13, qa: q1, qb: q3, signo: q1 * q3 > 0 ? 'se repelen' : 'se atraen' },
      { a: 2, b: 3, u: U23, qa: q2, qb: q3, signo: q2 * q3 > 0 ? 'se repelen' : 'se atraen' }
    ];

    function par(p) {
      return {
        letra: p.a === 1 && p.b === 2 ? 'b' : p.a === 1 ? 'c' : 'd',
        titulo: 'Energía del par (' + p.a + ',' + p.b + ')',
        bloques: [
          { t: 'text', html: 'Las cargas ' + p.a + ' y ' + p.b + ' están separadas una distancia <i>L</i> porque el triángulo es equilátero. Su energía mutua es:' },
          { t: 'eq', html: M.v('U<sub>' + p.a + p.b + '</sub>') + ' = ' + M.frac('k ' + M.v('q<sub>' + p.a + '</sub>') + M.v('q<sub>' + p.b + '</sub>'), M.v('L')) },
          { t: 'eq', html: M.v('U<sub>' + p.a + p.b + '</sub>') + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(p.qa, 3) + ')(' + N.format(p.qb, 3) + ')', N.format(L, 3)) },
          { t: 'calc', html: 'producto de cargas = ' + N.format(p.qa * p.qb, 4) + ' C<sup>2</sup>' },
          { t: 'calc', html: 'k ' + M.v('q<sub>' + p.a + '</sub>') + M.v('q<sub>' + p.b + '</sub>') + ' = ' + N.format(K * p.qa * p.qb, 4) },
          { t: 'calc', html: M.v('U<sub>' + p.a + p.b + '</sub>') + ' = ' + N.format(p.u, 4) + ' J' },
          { t: 'note', html: 'El signo negativo indica que ese par se atrae; el positivo, que se repele.' }
        ],
        resultado: { label: 'U_' + p.a + p.b, html: N.format(p.u, 3) + ' J' }
      };
    }

    var incisos = [
      {
        letra: 'a',
        titulo: 'Geometría: un solo valor de distancia',
        bloques: [
          { t: 'text', html: 'En un triángulo equilátero los tres lados miden lo mismo. Por eso las tres distancias entre pares son iguales:' },
          { t: 'eq', html: M.v('r<sub>12</sub>') + ' = ' + M.v('r<sub>13</sub>') + ' = ' + M.v('r<sub>23</sub>') + ' = ' + M.v('L') + ' = ' + N.format(L, 3) + ' m' },
          { t: 'note', html: 'Si el triángulo no fuera equilátero, cada par tendría su propia distancia y habría que calcularlas por separado. La energía total se sumaría igual.' }
        ],
        resultado: { label: 'r', html: N.format(L, 3) + ' m' }
      }
    ].concat(pares.map(par));

    incisos.push({
      letra: 'e',
      titulo: 'Energía total del sistema',
      bloques: [
        { t: 'text', html: 'La energía potencial del conjunto es la suma de las energías de los tres pares. Cada par se cuenta una vez: no se multiplica por 3.' },
        { t: 'eq', html: M.v('U<sub>total</sub>') + ' = ' + M.v('U<sub>12</sub>') + ' + ' + M.v('U<sub>13</sub>') + ' + ' + M.v('U<sub>23</sub>') },
        { t: 'calc', html: M.v('U<sub>total</sub>') + ' = (' + N.format(U12, 4) + ') + (' + N.format(U13, 4) + ') + (' + N.format(U23, 4) + ')' },
        { t: 'calc', html: M.v('U<sub>total</sub>') + ' = ' + N.format(total, 4) + ' J' },
        { t: 'note', html: total < 0
          ? 'El resultado es negativo: las atracciones pesan más que las repulsiones. El sistema está ligado y hay que entregarle energía para separar las cargas hasta el infinito.'
          : 'El resultado es positivo: las repulsiones dominan. El sistema no está ligado; las cargas tienden a separarse.' }
      ],
      resultado: { label: 'U_total', html: N.format(total, 3) + ' J' }
    });

    // Curva U(L): la energía de este mismo triángulo si se cambiara el lado.
    var Lmin = Math.max(L * 0.45, 1e-3);
    var Lmax = L * 1.8;
    var puntos = [];
    var pasos = 200;
    for (var i = 0; i <= pasos; i++) {
      var Lx = Lmin + (Lmax - Lmin) * (i / pasos);
      puntos.push({ x: Lx, y: (K / Lx) * (q1 * q2 + q1 * q3 + q2 * q3) });
    }

    return {
      principal: 'U = ' + N.texto(total, 3) + ' J',
      datos: [
        { sym: 'q₁', value: N.format(q1 * 1e6, 3) + ' µC', conv: N.format(q1, 3) + ' C' },
        { sym: 'q₂', value: N.format(q2 * 1e6, 3) + ' µC', conv: N.format(q2, 3) + ' C' },
        { sym: 'q₃', value: N.format(q3 * 1e6, 3) + ' µC', conv: N.format(q3, 3) + ' C' },
        { sym: 'L', value: N.format(L, 3) + ' m', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'lado del triángulo, L (m)', yLabel: 'U (J)', xUnit: 'm', yUnit: 'J',
        series: [{ points: puntos, color: 'var(--teal)' }],
        marker: { x: L, y: total }
      },
      cierre: 'La energía potencial del sistema de tres cargas es ' + N.format(total, 3) + ' J.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'energia',
    nombre: 'Energía de tres cargas',
    grupo: 'Cargas puntuales',
    resumen: 'Energía potencial de un sistema de tres cargas en los vértices de un triángulo equilátero.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
