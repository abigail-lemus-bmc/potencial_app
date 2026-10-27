/* ═══════════════════════════════════════════════════════════════════
   varilla-eje.js — Potencial de una varilla finita sobre su eje
   La varilla va de 0 a L y el punto P está en x = L + d. Cada elemento
   dq está a una distancia distinta de P, así que la integral no se
   reduce a kQ/r: aparece un logaritmo.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'L', label: 'Longitud de la varilla', symbol: 'L', unit: 'm', min: 0 }),
      V.field({ id: 'Q', label: 'Carga total de la varilla', symbol: 'Q', unit: 'uC', scale: 1e-6 }),
      V.field({
        id: 'd', label: 'Distancia del extremo a P', symbol: 'd', unit: 'm', min: 0,
        help: 'Desde el extremo más cercano, sobre el mismo eje.'
      })
    ];
  }

  function validar(v) {
    var warnings = {};
    if (v.Q === 0) {
      warnings.Q = 'Con Q = 0 no hay potencial: revisa la carga de la varilla.';
    }
    if (v.d < v.L * 0.02) {
      warnings.d = 'Con d tan pequeño el punto está casi sobre el extremo: el potencial crece sin límite.';
    }
    return { errors: {}, warnings: warnings };
  }

  function resolver(v) {
    var L = v.L, Q = v.Q, d = v.d;
    var lambda = Q / L;
    var kLambda = K * lambda;
    var razon = (L + d) / d;
    var ln = Math.log(razon);
    var potencial = kLambda * ln;

    // Comparación con una carga puntual colocada en el centro de la varilla.
    var centro = d + L / 2;
    var puntual = K * Q / centro;
    var dif = potencial !== 0 ? Math.abs(potencial - puntual) / Math.abs(potencial) * 100 : 0;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Densidad lineal de carga',
        bloques: [
          { t: 'text', html: 'La carga está repartida de forma uniforme a lo largo de la varilla, así que la densidad lineal es constante:' },
          { t: 'eq', html: M.v('λ') + ' = ' + M.frac(M.v('Q'), M.v('L')) },
          { t: 'calc', html: M.v('λ') + ' = ' + M.frac(N.format(Q, 3) + ' C', N.format(L, 3) + ' m') + ' = ' + N.format(lambda, 3) + ' C/m' }
        ],
        resultado: { label: 'λ', html: N.format(lambda, 3) + ' C/m' }
      },
      {
        letra: 'b',
        titulo: 'Elemento de carga y distancia a P',
        bloques: [
          { t: 'text', html: 'Colocamos el eje <i>x</i> sobre la varilla, con el origen en el extremo más cercano a <i>P</i>. La varilla ocupa 0 ≤ <i>x</i> ≤ <i>L</i> y el punto queda en <i>x</i> = <i>L</i> + <i>d</i>.' },
          { t: 'eq', html: M.v('dq') + ' = ' + M.v('λ') + ' ' + M.v('dx') },
          { t: 'text', html: 'Un elemento situado en <i>x</i> dista de <i>P</i>:' },
          { t: 'eq', html: M.v('r') + ' = (' + M.v('L') + ' + ' + M.v('d') + ') − ' + M.v('x') },
          { t: 'calc', html: 'en el extremo cercano (<i>x</i> = ' + N.format(L, 3) + ' m): <i>r</i> = ' + N.format(d, 3) + ' m' },
          { t: 'calc', html: 'en el extremo lejano (<i>x</i> = 0): <i>r</i> = ' + N.format(L + d, 3) + ' m' }
        ],
        resultado: { label: 'r', html: 'de ' + N.format(d, 3) + ' a ' + N.format(L + d, 3) + ' m' }
      },
      {
        letra: 'c',
        titulo: 'Planteo e integración',
        bloques: [
          { t: 'text', html: 'Cada elemento aporta un potencial pequeño, y como <i>r</i> cambia de un elemento a otro no puede salir de la integral:' },
          { t: 'eq', html: M.v('dV') + ' = ' + M.frac('k ' + M.v('dq'), M.v('r')) + ' = ' + M.frac('k ' + M.v('λ') + ' ' + M.v('dx'), M.v('L') + ' + ' + M.v('d') + ' − ' + M.v('x')) },
          { t: 'eq', html: M.v('V') + ' = k' + M.v('λ') + ' ∫<sub>0</sub><sup>' + M.v('L') + '</sup> ' + M.frac(M.v('dx'), M.v('L') + ' + ' + M.v('d') + ' − ' + M.v('x')) },
          { t: 'text', html: 'La integral es inmediata: con el cambio <i>u</i> = <i>L</i> + <i>d</i> − <i>x</i>, <i>du</i> = −<i>dx</i>.' },
          { t: 'eq', html: M.v('V') + ' = k' + M.v('λ') + ' [−ln(' + M.v('L') + ' + ' + M.v('d') + ' − ' + M.v('x') + ')]<sub>0</sub><sup>' + M.v('L') + '</sup>' },
          { t: 'eq', html: M.v('V') + ' = k' + M.v('λ') + ' (ln(' + M.v('L') + ' + ' + M.v('d') + ') − ln ' + M.v('d') + ')' },
          { t: 'eq', html: M.v('V') + ' = ' + M.frac('k' + M.v('Q'), M.v('L')) + ' ln ' + M.frac(M.v('L') + ' + ' + M.v('d'), M.v('d')) },
          { t: 'note', html: 'El logaritmo aparece porque la distancia no es una sola: la carga está repartida a lo largo de una línea. En la carga puntual todos los elementos estarían a la misma distancia y la integral daría <i>kQ</i>/<i>r</i>.' }
        ]
      },
      {
        letra: 'd',
        titulo: 'Cálculo numérico',
        bloques: [
          { t: 'eq', html: M.v('V') + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(Q, 3) + ')', N.format(L, 3)) + ' ln ' + M.frac(N.format(L + d, 3), N.format(d, 3)) },
          { t: 'text', html: 'Multiplicamos <i>k</i> por la densidad lineal:' },
          { t: 'calc', html: '(8.99 × 10<sup>9</sup>)(' + N.format(lambda, 3) + ') = ' + N.format(kLambda, 4) },
          { t: 'text', html: 'Resolvemos el cociente del logaritmo y su logaritmo natural:' },
          { t: 'calc', html: M.frac(N.format(L + d, 3), N.format(d, 3)) + ' = ' + N.format(razon, 4) },
          { t: 'calc', html: 'ln(' + N.format(razon, 4) + ') = ' + N.format(ln, 4) },
          { t: 'text', html: 'Multiplicamos:' },
          { t: 'calc', html: M.v('V') + ' = (' + N.format(kLambda, 4) + ')(' + N.format(ln, 4) + ') = ' + N.format(potencial, 4) + ' V' }
        ],
        resultado: { label: 'V', html: N.format(potencial, 3) + ' V' }
      },
      {
        letra: 'e',
        titulo: 'Interpretación y límite',
        bloques: [
          {
            t: 'text',
            html: (potencial >= 0
              ? 'La carga es positiva, así que el potencial también lo es: el punto está por encima del nivel cero del infinito.'
              : 'La carga es negativa, así que el potencial también lo es: el punto está por debajo del nivel cero del infinito.')
          },
          {
            t: 'text',
            html: 'Si se reemplazara la varilla por una carga puntual de la misma <i>Q</i> en su centro (' + N.format(centro, 3) + ' m de <i>P</i>), se obtendría ' + N.format(puntual, 3) + ' V, un ' + N.format(dif, 2) + ' % ' + (puntual < potencial ? 'menos' : 'más') + '. La diferencia mide cuánto pesa el tamaño de la varilla.'
          },
          {
            t: 'text',
            html: 'Cuando <i>d</i> ≫ <i>L</i>, ln(1 + <i>L</i>/<i>d</i>) ≈ <i>L</i>/<i>d</i> y entonces <i>V</i> → <i>kQ</i>/<i>d</i>: la varilla se comporta como una carga puntual, como debe ser.'
          }
        ]
      }
    ];

    // Curva V(d) para puntos sobre el eje, más allá del extremo.
    var xMin = Math.min(0.12 * L, 0.6 * d);
    var xMax = Math.max(1.8 * d, 2 * L, 1.2 * d);
    var puntos = [];
    var pasos = 240;
    for (var i = 0; i <= pasos; i++) {
      var xi = xMin + (xMax - xMin) * (i / pasos);
      puntos.push({ x: xi, y: kLambda * Math.log((L + xi) / xi) });
    }

    var tope = Math.abs(potencial) * 1.6;
    var grafica = {
      xLabel: 'distancia al extremo, d (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
      series: [{ points: puntos, color: 'var(--teal)' }],
      marker: { x: d, y: potencial }
    };
    if (tope > 1e-9) grafica.clipY = potencial >= 0 ? [0, tope] : [-tope, 0];

    return {
      principal: 'V = ' + N.texto(potencial, 3) + ' V',
      datos: [
        { sym: 'L', value: N.format(L, 3) + ' m', conv: '' },
        { sym: 'Q', value: N.format(Q * 1e6, 3) + ' µC', conv: N.format(Q, 3) + ' C' },
        { sym: 'd', value: N.format(d, 3) + ' m', conv: '' },
        { sym: 'λ', value: N.format(lambda, 3) + ' C/m', conv: '' },
        { sym: 'k', value: '8.99 × 10<sup>9</sup> N·m²/C²', conv: '' }
      ],
      incisos: incisos,
      grafica: grafica,
      cierre: 'A ' + N.format(d, 3) + ' m del extremo, sobre el eje, V = ' + N.format(potencial, 3) + ' V.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'varillaEje',
    nombre: 'Varilla sobre el eje',
    grupo: 'Distribuciones continuas',
    resumen: 'Potencial de una varilla finita con carga uniforme en un punto de su eje, fuera de ella.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
