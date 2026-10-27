/* ═══════════════════════════════════════════════════════════════════
   anillo.js — Potencial de un anillo cargado sobre su eje
   Todos los elementos del anillo equidistan del punto P: la distancia
   sale de la integral y el resultado solo depende de Q.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'R', label: 'Radio del anillo', symbol: 'R', unit: 'm', min: 0 }),
      V.field({ id: 'Q', label: 'Carga total', symbol: 'Q', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'x', label: 'Distancia sobre el eje', symbol: 'x', unit: 'm', min: 0, exclusiveMin: false })
    ];
  }

  function validar(v) {
    return { errors: {}, warnings: {} };
  }

  function resolver(v) {
    var R = v.R, Q = v.Q, x = v.x;
    var x2 = x * x, R2 = R * R;
    var suma = x2 + R2;
    var s = Math.sqrt(suma);
    var kQ = K * Q;
    var potencial = kQ / s;
    var campo = kQ * x / (s * s * s);
    var vLejos = x > 0 ? kQ / x : Infinity;
    var eLejos = x > 0 ? kQ / (x * x) : Infinity;
    var lejano = x > 8 * R;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Distancia de cada elemento al punto P',
        bloques: [
          { t: 'text', html: 'Cada elemento <i>dq</i> del anillo está a la misma distancia <i>s</i> del punto <i>P</i>. Por Pitágoras:' },
          { t: 'eq', html: M.v('s<sup>2</sup>') + ' = ' + M.v('x<sup>2</sup>') + ' + ' + M.v('R<sup>2</sup>') },
          { t: 'calc', html: '(' + N.format(x, 3) + ')<sup>2</sup> = ' + N.format(x2, 3) + ', (' + N.format(R, 3) + ')<sup>2</sup> = ' + N.format(R2, 3) },
          { t: 'calc', html: N.format(x2, 3) + ' + ' + N.format(R2, 3) + ' = ' + N.format(suma, 4) },
          { t: 'eq', html: M.v('s') + ' = ' + M.sqrt(N.format(suma, 4)) + ' = ' + N.format(s, 4) + ' m' }
        ],
        resultado: { label: 's', html: N.format(s, 3) + ' m' }
      },
      {
        letra: 'b',
        titulo: 'Deducción de la expresión del potencial',
        bloques: [
          { t: 'text', html: 'El potencial de un elemento de carga es:' },
          { t: 'eq', html: M.v('dV') + ' = ' + M.frac('k ' + M.v('dq'), M.v('s')) },
          { t: 'text', html: 'Como <i>s</i> es igual para todos los elementos, sale de la integral:' },
          { t: 'eq', html: M.v('V') + ' = ' + '∫' + M.v('dV') + ' = ' + M.frac('k', M.v('s')) + ' ∫' + M.v('dq') },
          { t: 'text', html: 'La integral de <i>dq</i> sobre todo el anillo es la carga total <i>Q</i>:' },
          { t: 'eq', html: M.v('V') + ' = ' + M.frac('k' + M.v('Q'), M.sqrt(M.v('x<sup>2</sup>') + ' + ' + M.v('R<sup>2</sup>'))) },
          { t: 'note', html: 'La forma del anillo no aparece en el resultado, solo la carga total. Eso ocurre porque todos los elementos están a la misma distancia del punto.' }
        ]
      },
      {
        letra: 'c',
        titulo: 'Cálculo numérico',
        bloques: [
          { t: 'eq', html: M.v('V') + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(Q, 3) + ')', N.format(s, 4)) },
          { t: 'text', html: 'Multiplicamos <i>k</i> por <i>Q</i>:' },
          { t: 'calc', html: '(8.99 × 10<sup>9</sup>)(' + N.format(Q, 3) + ') = ' + N.format(kQ, 4) },
          { t: 'text', html: 'Dividimos entre la distancia:' },
          { t: 'calc', html: M.v('V') + ' = ' + M.frac(N.format(kQ, 4), N.format(s, 4)) + ' = ' + N.format(potencial, 4) + ' V' }
        ],
        resultado: { label: 'V', html: N.format(potencial, 3) + ' V' }
      },
      {
        letra: 'd',
        titulo: 'Campo eléctrico en el eje',
        bloques: [
          { t: 'text', html: 'Por simetría, el campo en un punto del eje solo tiene componente <i>x</i>: las componentes perpendiculares de los elementos del anillo se cancelan. El resultado es:' },
          { t: 'eq', html: M.v('E<sub>x</sub>') + ' = ' + M.frac('k' + M.v('Q') + M.v('x'), '(' + M.v('x<sup>2</sup>') + ' + ' + M.v('R<sup>2</sup>') + ')<sup>3/2</sup>') },
          { t: 'calc', html: 'k' + M.v('Q') + M.v('x') + ' = ' + N.format(kQ * x, 4) },
          { t: 'calc', html: '(' + N.format(suma, 4) + ')<sup>3/2</sup> = ' + N.format(s * suma, 4) },
          { t: 'calc', html: M.v('E<sub>x</sub>') + ' = ' + N.format(campo, 4) + ' V/m' },
          { t: 'note', html: 'El campo es cero en el centro (<i>x</i> = 0) y también muy lejos. Entre esos dos extremos pasa por un máximo.' }
        ],
        resultado: { label: 'E', html: N.format(campo, 3) + ' V/m' }
      },
      {
        letra: 'e',
        titulo: 'Aproximación para x ≫ R',
        bloques: [
          { t: 'text', html: 'Cuando el punto está muy lejos del anillo, <i>x</i> ≫ <i>R</i> y se puede despreciar <i>R</i> frente a <i>x</i>:' },
          { t: 'eq', html: M.v('V') + ' ≈ ' + M.frac('k' + M.v('Q'), M.v('x')) + ',   ' + M.v('E') + ' ≈ ' + M.frac('k' + M.v('Q'), M.v('x<sup>2</sup>')) },
          { t: 'calc', html: 'V ≈ ' + N.format(vLejos, 4) + ' V' },
          { t: 'calc', html: 'E ≈ ' + N.format(eLejos, 4) + ' V/m' },
          { t: 'text', html: 'El anillo se comporta como una carga puntual con toda la carga <i>Q</i> en su centro. La diferencia entre la curva del anillo y la de la carga puntual desaparece cuando <i>x</i> es mucho mayor que <i>R</i>.' }
        ],
        resultado: { label: 'V, E lejanos', html: N.format(vLejos, 3) + ' V, ' + N.format(eLejos, 3) + ' V/m' }
      },
      {
        letra: 'f',
        titulo: 'Lectura de la gráfica',
        bloques: [
          {
            t: 'text',
            html: lejano
              ? 'Con x = ' + N.format(x, 3) + ' m frente a R = ' + N.format(R, 3) + ' m, el punto está lejos del anillo: la curva coincide prácticamente con la de una carga puntual.'
              : 'Cerca del anillo, el potencial es mayor que el de una carga puntual con la misma Q, porque hay elementos de carga más cercanos al punto. A distancias grandes (x ≫ R) las curvas se juntan.'
          },
          { t: 'text', html: 'La curva de referencia (a trazos) es <i>kQ</i>/<i>x</i>. La separación entre las dos curvas mide cuánto pesa el tamaño del anillo.' }
        ]
      }
    ];

    var xMax = Math.max(2 * R, 1.4 * x);
    var puntos = [];
    var ref = [];
    var pasos = 200;
    for (var i = 0; i <= pasos; i++) {
      var xi = xMax * (i / pasos);
      puntos.push({ x: xi, y: kQ / Math.sqrt(xi * xi + R2) });
    }
    for (var j = 1; j <= pasos; j++) {
      var xr = xMax * (j / pasos);
      if (xr < 0.25 * R) continue;
      ref.push({ x: xr, y: kQ / xr });
    }

    var tope = Math.abs(kQ / R) * 1.25;

    return {
      principal: 'V = ' + N.texto(potencial, 3) + ' V',
      datos: [
        { sym: 'R', value: N.format(R, 3) + ' m', conv: '' },
        { sym: 'Q', value: N.format(Q * 1e6, 3) + ' µC', conv: N.format(Q, 3) + ' C' },
        { sym: 'x', value: N.format(x, 3) + ' m', conv: '' },
        { sym: 'E', value: N.format(campo, 3) + ' V/m', conv: '' },
        { sym: 'k', value: '8.99 × 10<sup>9</sup> N·m²/C²', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'x (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
        series: [
          { points: puntos, color: 'var(--teal)', label: 'anillo' },
          { points: ref, color: 'var(--muted)', dash: '5 5', label: 'carga puntual' }
        ],
        marker: { x: x, y: potencial },
        clipY: Q >= 0 ? [0, tope] : [-tope, 0]
      },
      cierre: 'En el eje, a ' + N.format(x, 3) + ' m del centro, V = ' + N.format(potencial, 3) + ' V y E = ' + N.format(campo, 3) + ' V/m.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'anillo',
    nombre: 'Anillo cargado',
    grupo: 'Distribuciones continuas',
    resumen: 'Potencial y campo en el eje de un anillo de radio R con carga Q uniforme, con la aproximación lejana.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
