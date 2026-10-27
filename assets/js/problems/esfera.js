/* ═══════════════════════════════════════════════════════════════════
   esfera.js — Potencial de una esfera aislante con carga uniforme
   Dentro de la esfera el campo no es el de una carga puntual: crece
   linealmente con r. Al integrarlo, el potencial interior es una
   parábola que empalma con el exterior en la superficie.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'R', label: 'Radio de la esfera', symbol: 'R', unit: 'm', min: 0 }),
      V.field({ id: 'Q', label: 'Carga total', symbol: 'Q', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'r', label: 'Distancia al centro', symbol: 'r', unit: 'm', min: 0, exclusiveMin: false })
    ];
  }

  function validar(v) {
    var warnings = {};
    if (v.Q === 0) warnings.Q = 'Con Q = 0 el potencial es cero en todo el espacio.';
    return { errors: {}, warnings: warnings };
  }

  function resolver(v) {
    var R = v.R, Q = v.Q, r = v.r;
    var kQ = K * Q;
    var centro = 1.5 * kQ / R;
    var superficie = kQ / R;
    var dentro = r < R;
    var potencial = dentro ? (kQ / (2 * R)) * (3 - (r * r) / (R * R)) : kQ / r;
    var campo = dentro ? kQ * r / (R * R * R) : kQ / (r * r);

    var incisos = [
      {
        letra: 'a',
        titulo: 'Potencial en el centro',
        bloques: [
          { t: 'text', html: 'Para una esfera aislante con carga repartida en todo el volumen, el potencial interior es:' },
          { t: 'eq', html: M.v('V(r)') + ' = ' + M.frac('k' + M.v('Q'), '2' + M.v('R')) + ' (3 − ' + M.frac(M.v('r<sup>2</sup>'), M.v('R<sup>2</sup>')) + ')' },
          { t: 'text', html: 'En el centro, <i>r</i> = 0:' },
          { t: 'eq', html: M.v('V(0)') + ' = ' + M.frac('3k' + M.v('Q'), '2' + M.v('R')) },
          { t: 'eq', html: M.v('V(0)') + ' = ' + M.frac('3(8.99 × 10<sup>9</sup>)(' + N.format(Q, 3) + ')', '2(' + N.format(R, 3) + ')') },
          { t: 'calc', html: 'k' + M.v('Q') + ' = ' + N.format(kQ, 4) },
          { t: 'calc', html: M.v('V(0)') + ' = ' + N.format(centro, 4) + ' V' },
          { t: 'note', html: 'El potencial en el centro no es infinito aunque la distancia al centro sea cero: la carga no está concentrada en un punto, está repartida.' }
        ],
        resultado: { label: 'V(0)', html: N.format(centro, 3) + ' V' }
      },
      {
        letra: 'b',
        titulo: 'Potencial en la superficie',
        bloques: [
          { t: 'text', html: 'En <i>r</i> = <i>R</i> la expresión interior se reduce a:' },
          { t: 'eq', html: M.v('V(R)') + ' = ' + M.frac('k' + M.v('Q'), '2' + M.v('R')) + '(3 − 1) = ' + M.frac('k' + M.v('Q'), M.v('R')) },
          { t: 'calc', html: M.v('V(R)') + ' = ' + M.frac(N.format(kQ, 4), N.format(R, 3)) + ' = ' + N.format(superficie, 4) + ' V' }
        ],
        resultado: { label: 'V(R)', html: N.format(superficie, 3) + ' V' }
      },
      {
        letra: 'c',
        titulo: 'Potencial en el punto pedido',
        bloques: [
          { t: 'text', html: 'El punto está a <i>r</i> = ' + N.format(r, 3) + ' m, ' + (dentro ? 'dentro de la esfera (<i>r</i> &lt; <i>R</i>)' : 'fuera de la esfera (<i>r</i> ≥ <i>R</i>)') + '.' },
          { t: 'eq', html: dentro
            ? M.v('V') + ' = ' + M.frac('k' + M.v('Q'), '2' + M.v('R')) + ' (3 − ' + M.frac(M.v('r<sup>2</sup>'), M.v('R<sup>2</sup>')) + ')'
            : M.v('V') + ' = ' + M.frac('k' + M.v('Q'), M.v('r')) },
          { t: 'calc', html: M.v('V') + ' = ' + N.format(potencial, 4) + ' V' },
          { t: 'text', html: 'El campo en ese punto vale <i>E</i> = ' + N.format(campo, 3) + ' V/m, ' + (dentro ? 'proporcional a <i>r</i>.' : 'igual al de una carga puntual.') }
        ],
        resultado: { label: 'V(r)', html: N.format(potencial, 3) + ' V' }
      },
      {
        letra: 'd',
        titulo: 'Continuidad en la superficie',
        bloques: [
          { t: 'text', html: 'Por dentro, al acercarse a la superficie:' },
          { t: 'calc', html: M.v('V<sub>int</sub>(R)') + ' = ' + M.frac('k' + M.v('Q'), M.v('R')) + ' = ' + N.format(superficie, 4) + ' V' },
          { t: 'text', html: 'Por fuera, la esfera se comporta como una carga puntual concentrada en el centro:' },
          { t: 'calc', html: M.v('V<sub>ext</sub>(R)') + ' = ' + M.frac('k' + M.v('Q'), M.v('R')) + ' = ' + N.format(superficie, 4) + ' V' },
          { t: 'text', html: 'Los dos valores coinciden: el potencial es continuo en la superficie. La gráfica muestra el empalme: la parábola interior termina justo donde empieza la hipérbola exterior.' }
        ]
      },
      {
        letra: 'e',
        titulo: 'Interpretación',
        bloques: [
          { t: 'text', html: 'El potencial máximo está en el centro y vale una vez y media el de la superficie. Desde el centro hacia afuera baja como una parábola hasta <i>R</i>, y después sigue bajando como 1/<i>r</i>.' },
          { t: 'text', html: 'El campo, en cambio, es cero en el centro y máximo en la superficie. Potencial y campo no se comportan igual: el campo es la pendiente del potencial.' }
        ]
      }
    ];

    var rMax = Math.max(2.2 * R, r * 1.5, 1e-3);
    var puntos = [];
    var pasos = 240;
    for (var i = 0; i <= pasos; i++) {
      var x = rMax * (i / pasos);
      puntos.push({ x: x, y: x < R ? (kQ / (2 * R)) * (3 - (x * x) / (R * R)) : kQ / x });
    }

    return {
      principal: 'V(r) = ' + N.texto(potencial, 3) + ' V',
      datos: [
        { sym: 'R', value: N.format(R, 3) + ' m', conv: '' },
        { sym: 'Q', value: N.format(Q * 1e6, 3) + ' µC', conv: N.format(Q, 3) + ' C' },
        { sym: 'r', value: N.format(r, 3) + ' m', conv: '' },
        { sym: 'k', value: '8.99 × 10<sup>9</sup> N·m²/C²', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'r (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
        series: [{ points: puntos, color: 'var(--teal)' }],
        markers: [
          { x: 0, y: centro, label: 'centro', dx: 8, dy: -8 },
          { x: R, y: superficie, label: 'R', dx: 8, dy: -8 }
        ],
        marker: { x: r, y: potencial }
      },
      cierre: 'En el centro V = ' + N.format(centro, 3) + ' V; en la superficie, ' + N.format(superficie, 3) + ' V; a ' + N.format(r, 3) + ' m del centro, ' + N.format(potencial, 3) + ' V.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'esfera',
    nombre: 'Esfera aislante',
    grupo: 'Distribuciones continuas',
    resumen: 'Potencial dentro y fuera de una esfera sólida con carga uniforme en todo su volumen.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
