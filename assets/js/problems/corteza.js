/* ═══════════════════════════════════════════════════════════════════
   corteza.js — Potencial de una corteza esférica delgada
   Toda la carga está en la superficie. Dentro el campo es cero, así que
   el potencial es constante e igual al de la superficie; fuera decae
   como el de una carga puntual.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'R', label: 'Radio de la corteza', symbol: 'R', unit: 'm', min: 0 }),
      V.field({ id: 'Q', label: 'Carga total', symbol: 'Q', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'r', label: 'Distancia al centro', symbol: 'r', unit: 'm', min: 0, exclusiveMin: false })
    ];
  }

  function validar(v) {
    var warnings = {};
    if (v.Q === 0) warnings.Q = 'Con Q = 0 el potencial es cero en todo el espacio.';
    if (Math.abs(v.r - v.R) < 1e-9) {
      warnings.r = 'El punto está justo en la superficie: V = kQ/R.';
    }
    return { errors: {}, warnings: warnings };
  }

  function resolver(v) {
    var R = v.R, Q = v.Q, r = v.r;
    var kQ = K * Q;
    var superficie = kQ / R;
    var dentro = r < R;
    var potencial = dentro ? superficie : kQ / r;
    var campo = dentro ? 0 : kQ / (r * r);

    var incisos = [
      {
        letra: 'a',
        titulo: 'Potencial uniforme en el interior',
        bloques: [
          { t: 'text', html: 'Dentro de una corteza delgada el campo eléctrico es cero: las cargas de la superficie se cancelan por simetría. Si <i>E</i> = 0, el potencial no cambia al moverse por dentro.' },
          { t: 'eq', html: M.v('V<sub>int</sub>') + ' = ' + M.frac('k' + M.v('Q'), M.v('R')) },
          { t: 'calc', html: M.v('V<sub>int</sub>') + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(Q, 3) + ')', N.format(R, 3)) },
          { t: 'calc', html: 'k' + M.v('Q') + ' = ' + N.format(kQ, 4) },
          { t: 'calc', html: M.v('V<sub>int</sub>') + ' = ' + N.format(superficie, 4) + ' V' },
          { t: 'note', html: 'El potencial es constante en todo el interior, no cero. Lo que es cero es el campo.' }
        ],
        resultado: { label: 'V interior', html: N.format(superficie, 3) + ' V' }
      },
      {
        letra: 'b',
        titulo: 'Potencial en la superficie',
        bloques: [
          { t: 'text', html: 'En <i>r</i> = <i>R</i> las dos expresiones coinciden:' },
          { t: 'eq', html: M.v('V(R)') + ' = ' + M.frac('k' + M.v('Q'), M.v('R')) + ' = ' + N.format(superficie, 4) + ' V' },
          { t: 'text', html: 'La continuidad es exacta: no hay salto de potencial al cruzar la superficie.' }
        ],
        resultado: { label: 'V(R)', html: N.format(superficie, 3) + ' V' }
      },
      {
        letra: 'c',
        titulo: 'Potencial en el punto pedido',
        bloques: [
          { t: 'text', html: 'El punto está a <i>r</i> = ' + N.format(r, 3) + ' m, ' + (dentro ? 'dentro de la corteza. Ahí el potencial es el mismo que en la superficie.' : 'fuera de la corteza. Ahí la corteza se comporta como una carga puntual en el centro.') },
          { t: 'eq', html: dentro
            ? M.v('V') + ' = ' + M.frac('k' + M.v('Q'), M.v('R')) + ' = ' + N.format(superficie, 4) + ' V'
            : M.v('V') + ' = ' + M.frac('k' + M.v('Q'), M.v('r')) + ' = ' + N.format(potencial, 4) + ' V' },
          { t: 'text', html: 'El campo en ese punto es <i>E</i> = ' + N.format(campo, 3) + ' V/m' + (dentro ? ': nulo, como corresponde al interior de una corteza.' : '.') }
        ],
        resultado: { label: 'V(r)', html: N.format(potencial, 3) + ' V' }
      },
      {
        letra: 'd',
        titulo: 'Gráfica y lectura física',
        bloques: [
          { t: 'text', html: 'La gráfica tiene dos tramos: una recta horizontal en el interior (potencial constante) y una hipérbola en el exterior (1/<i>r</i>). El cambio de pendiente ocurre en <i>r</i> = <i>R</i>.' },
          { t: 'text', html: 'La pendiente del potencial es el campo cambiado de signo. Por eso la pendiente es cero dentro y deja de serlo justo al salir: el campo pasa de 0 a kQ/R² de golpe.' },
          { t: 'text', html: 'Este salto del campo es la diferencia con la esfera maciza, donde el campo crece poco a poco desde el centro. El potencial, en cambio, es continuo en los dos casos.' }
        ]
      }
    ];

    var rMax = Math.max(2.2 * R, r * 1.5, 1e-3);
    var puntos = [];
    var pasos = 240;
    for (var i = 0; i <= pasos; i++) {
      var x = rMax * (i / pasos);
      puntos.push({ x: x, y: x < R ? superficie : kQ / x });
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
        markers: [{ x: R, y: superficie, label: 'R', dx: 8, dy: -8 }],
        marker: { x: r, y: potencial }
      },
      cierre: 'Dentro y en la superficie, V = ' + N.format(superficie, 3) + ' V; a ' + N.format(r, 3) + ' m del centro, ' + N.format(potencial, 3) + ' V.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'corteza',
    nombre: 'Corteza esférica',
    grupo: 'Distribuciones continuas',
    resumen: 'Potencial dentro y fuera de una corteza esférica delgada con carga Q en su superficie.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
