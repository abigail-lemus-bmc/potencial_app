/* ═══════════════════════════════════════════════════════════════════
   arco.js — Potencial en el centro de un arco semicircular
   Todos los elementos del arco están a la misma distancia R del centro,
   así que la integral se reduce a sumar la carga total.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'R', label: 'Radio del arco', symbol: 'R', unit: 'm', min: 0 }),
      V.field({ id: 'Q', label: 'Carga total', symbol: 'Q', unit: 'uC', scale: 1e-6 })
    ];
  }

  function validar(v) {
    return { errors: {}, warnings: {} };
  }

  function resolver(v) {
    var R = v.R, Q = v.Q;
    var L = Math.PI * R;
    var lambda = Q / L;
    var kQ = K * Q;
    var potencial = kQ / R;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Longitud del arco',
        bloques: [
          { t: 'text', html: 'Una semicircunferencia es media circunferencia completa:' },
          { t: 'eq', html: M.v('L') + ' = π' + M.v('R') },
          { t: 'calc', html: M.v('L') + ' = π(' + N.format(R, 3) + ') = ' + N.format(L, 4) + ' m' }
        ],
        resultado: { label: 'L', html: N.format(L, 3) + ' m' }
      },
      {
        letra: 'b',
        titulo: 'Densidad lineal de carga',
        bloques: [
          { t: 'eq', html: M.v('λ') + ' = ' + M.frac(M.v('Q'), M.v('L')) + ' = ' + M.frac(M.v('Q'), 'π' + M.v('R')) },
          { t: 'calc', html: M.v('λ') + ' = ' + M.frac(N.format(Q, 3), N.format(L, 4)) + ' = ' + N.format(lambda, 4) + ' C/m' }
        ],
        resultado: { label: 'λ', html: N.format(lambda, 3) + ' C/m' }
      },
      {
        letra: 'c',
        titulo: 'Elemento diferencial y distancia al centro',
        bloques: [
          { t: 'text', html: 'Se toma un elemento de longitud <i>ds</i> sobre el arco. Su carga es:' },
          { t: 'eq', html: M.v('dq') + ' = ' + M.v('λ') + ' ' + M.v('ds') },
          { t: 'text', html: 'Todos los elementos del arco están a la misma distancia del centro:' },
          { t: 'eq', html: M.v('r') + ' = ' + M.v('R') + ' = ' + N.format(R, 3) + ' m' }
        ]
      },
      {
        letra: 'd',
        titulo: 'Planteo e integración',
        bloques: [
          { t: 'eq', html: M.v('dV') + ' = ' + M.frac('k ' + M.v('dq'), M.v('R')) },
          { t: 'text', html: 'Como <i>R</i> es constante, sale de la integral:' },
          { t: 'eq', html: M.v('V') + ' = ∫' + M.v('dV') + ' = ' + M.frac('k', M.v('R')) + ' ∫' + M.v('dq') + ' = ' + M.frac('k', M.v('R')) + M.v('Q') },
          { t: 'eq', html: M.v('V') + ' = ' + M.frac('k' + M.v('Q'), M.v('R')) }
        ]
      },
      {
        letra: 'e',
        titulo: 'Cálculo numérico',
        bloques: [
          { t: 'eq', html: M.v('V') + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(Q, 3) + ')', N.format(R, 3)) },
          { t: 'calc', html: '(8.99 × 10<sup>9</sup>)(' + N.format(Q, 3) + ') = ' + N.format(kQ, 4) },
          { t: 'calc', html: M.v('V') + ' = ' + M.frac(N.format(kQ, 4), N.format(R, 3)) + ' = ' + N.format(potencial, 4) + ' V' }
        ],
        resultado: { label: 'V', html: N.format(potencial, 3) + ' V' }
      },
      {
        letra: 'f',
        titulo: 'Por qué la forma del arco no aparece',
        bloques: [
          { t: 'text', html: 'La expresión final no contiene el ángulo ni π. No es un error: el potencial es escalar y todos los elementos del arco están a la misma distancia <i>R</i> del centro, así que la contribución total depende solo de la carga, no de cómo se reparta a lo largo del arco.' },
          { t: 'note', html: 'Cuidado: <b>V = kQ/R</b> no significa que el campo eléctrico sea el de una carga puntual. El campo es vectorial; en el centro del arco, por simetría, solo sobrevive la componente sobre el eje de simetría y su magnitud es distinta a la de una carga puntual.' }
        ]
      }
    ];

    var rMin = R / 3, rMax = R * 3;
    var puntos = [];
    var pasos = 180;
    for (var i = 0; i <= pasos; i++) {
      var ri = rMin + (rMax - rMin) * (i / pasos);
      puntos.push({ x: ri, y: kQ / ri });
    }

    return {
      principal: 'V = ' + N.texto(potencial, 3) + ' V',
      datos: [
        { sym: 'R', value: N.format(R, 3) + ' m', conv: '' },
        { sym: 'Q', value: N.format(Q * 1e6, 3) + ' µC', conv: N.format(Q, 3) + ' C' },
        { sym: 'k', value: '8.99 × 10<sup>9</sup> N·m²/C²', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'R (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
        series: [{ points: puntos, color: 'var(--teal)' }],
        marker: { x: R, y: potencial }
      },
      cierre: 'En el centro del arco, V = ' + N.format(potencial, 3) + ' V. Si se duplica el radio conservando la carga, el potencial se reduce a la mitad.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'arco',
    nombre: 'Arco semicircular',
    grupo: 'Distribuciones continuas',
    resumen: 'Potencial en el centro de curvatura de un arco semicircular con carga Q.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
