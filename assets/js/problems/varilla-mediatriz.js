/* ═══════════════════════════════════════════════════════════════════
   varilla-mediatriz.js — Potencial de una varilla finita en un punto de
   su mediatriz. Simetría: los dos extremos aportan lo mismo, y el
   resultado vuelve a tener un logaritmo.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'L', label: 'Longitud de la varilla', symbol: 'L', unit: 'm', min: 0 }),
      V.field({ id: 'Q', label: 'Carga total de la varilla', symbol: 'Q', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'd', label: 'Distancia del centro a P', symbol: 'd', unit: 'm', min: 0 })
    ];
  }

  function validar(v) {
    var warnings = {};
    if (v.Q === 0) {
      warnings.Q = 'Con Q = 0 no hay potencial: revisa la carga de la varilla.';
    }
    if (v.d < v.L * 0.02) {
      warnings.d = 'Con P casi sobre la varilla el potencial crece sin límite: revisa la distancia.';
    }
    return { errors: {}, warnings: warnings };
  }

  function resolver(v) {
    var L = v.L, Q = v.Q, d = v.d;
    var lambda = Q / L;
    var kLambda = K * lambda;
    var mitad = L / 2;
    var raiz = Math.sqrt(d * d + mitad * mitad);
    var numerador = raiz + mitad;
    var razon = numerador / d;
    var ln = Math.log(razon);
    var potencial = 2 * kLambda * ln;

    // Carga puntual equivalente en el centro de la varilla.
    var puntual = K * Q / d;
    var dif = potencial !== 0 ? Math.abs(potencial - puntual) / Math.abs(potencial) * 100 : 0;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Densidad lineal de carga',
        bloques: [
          { t: 'text', html: 'La carga se reparte por igual en toda la longitud de la varilla:' },
          { t: 'eq', html: M.v('λ') + ' = ' + M.frac(M.v('Q'), M.v('L')) },
          { t: 'calc', html: M.v('λ') + ' = ' + M.frac(N.format(Q, 3) + ' C', N.format(L, 3) + ' m') + ' = ' + N.format(lambda, 3) + ' C/m' }
        ],
        resultado: { label: 'λ', html: N.format(lambda, 3) + ' C/m' }
      },
      {
        letra: 'b',
        titulo: 'Distancia de un elemento a P',
        bloques: [
          { t: 'text', html: 'Colocamos la varilla sobre el eje <i>y</i>, centrada en el origen, y el punto <i>P</i> sobre la mediatriz, a la distancia <i>d</i> del centro.' },
          { t: 'eq', html: M.v('dq') + ' = ' + M.v('λ') + ' ' + M.v('dy') + ',  −' + M.frac(M.v('L'), '2') + ' ≤ ' + M.v('y') + ' ≤ ' + M.frac(M.v('L'), '2') },
          { t: 'text', html: 'Por Pitágoras, todo elemento en <i>y</i> dista de <i>P</i>:' },
          { t: 'eq', html: M.v('r') + ' = ' + M.sqrt(M.v('d<sup>2</sup>') + ' + ' + M.v('y<sup>2</sup>')) },
          { t: 'calc', html: '<i>y</i> = 0 (centro): <i>r</i> = <i>d</i> = ' + N.format(d, 3) + ' m' },
          { t: 'calc', html: '<i>y</i> = ±<i>L</i>/2 = ±' + N.format(mitad, 3) + ' m: <i>r</i> = ' + N.format(raiz, 4) + ' m' }
        ],
        resultado: { label: 'r', html: 'de ' + N.format(d, 3) + ' a ' + N.format(raiz, 3) + ' m' }
      },
      {
        letra: 'c',
        titulo: 'Planteo e integración',
        bloques: [
          { t: 'eq', html: M.v('V') + ' = k' + M.v('λ') + ' ∫<sub>−L/2</sub><sup>L/2</sup> ' + M.frac(M.v('dy'), M.sqrt(M.v('d<sup>2</sup>') + ' + ' + M.v('y<sup>2</sup>'))) },
          { t: 'text', html: 'La primitiva es un logaritmo:' },
          { t: 'eq', html: '∫ ' + M.frac(M.v('dy'), M.sqrt(M.v('d<sup>2</sup>') + ' + ' + M.v('y<sup>2</sup>'))) + ' = ln(' + M.v('y') + ' + ' + M.sqrt(M.v('d<sup>2</sup>') + ' + ' + M.v('y<sup>2</sup>')) + ')' },
          { t: 'eq', html: M.v('V') + ' = k' + M.v('λ') + ' ln ' + M.frac(M.sqrt(M.v('d<sup>2</sup>') + ' + (' + M.frac(M.v('L'), '2') + ')<sup>2</sup>') + ' + ' + M.frac(M.v('L'), '2'), M.sqrt(M.v('d<sup>2</sup>') + ' + (' + M.frac(M.v('L'), '2') + ')<sup>2</sup>') + ' − ' + M.frac(M.v('L'), '2')) },
          { t: 'text', html: 'Al multiplicar numerador y denominador por el numerador, el denominador queda igual a <i>d</i><sup>2</sup>, y el logaritmo se reduce a:' },
          { t: 'eq', html: M.v('V') + ' = 2k' + M.v('λ') + ' ln ' + M.frac(M.sqrt(M.v('d<sup>2</sup>') + ' + ' + M.v('(L/2)<sup>2</sup>')) + ' + ' + M.frac(M.v('L'), '2'), M.v('d')) },
          { t: 'note', html: 'El factor 2 viene de la simetría: los elementos en +<i>y</i> y en −<i>y</i> están a la misma distancia de <i>P</i>, así que integran lo mismo. Esa es la razón de integrar solo media varilla y duplicar.' }
        ]
      },
      {
        letra: 'd',
        titulo: 'Cálculo numérico',
        bloques: [
          { t: 'eq', html: M.v('V') + ' = 2(8.99 × 10<sup>9</sup>)(' + N.format(lambda, 3) + ') ln ' + M.frac(N.format(numerador, 4), N.format(d, 3)) },
          { t: 'text', html: 'Primero la raíz y el numerador del logaritmo:' },
          { t: 'calc', html: M.sqrt(N.format(d, 3) + '<sup>2</sup> + ' + N.format(mitad, 3) + '<sup>2</sup>') + ' = ' + N.format(raiz, 4) + ' m' },
          { t: 'calc', html: N.format(raiz, 4) + ' + ' + N.format(mitad, 3) + ' = ' + N.format(numerador, 4) + ' m' },
          { t: 'text', html: 'Luego el cociente y su logaritmo:' },
          { t: 'calc', html: M.frac(N.format(numerador, 4), N.format(d, 3)) + ' = ' + N.format(razon, 4) },
          { t: 'calc', html: 'ln(' + N.format(razon, 4) + ') = ' + N.format(ln, 4) },
          { t: 'text', html: 'Finalmente:' },
          { t: 'calc', html: M.v('V') + ' = 2(' + N.format(kLambda, 4) + ')(' + N.format(ln, 4) + ') = ' + N.format(potencial, 4) + ' V' }
        ],
        resultado: { label: 'V', html: N.format(potencial, 3) + ' V' }
      },
      {
        letra: 'e',
        titulo: 'Interpretación',
        bloques: [
          {
            t: 'text',
            html: (potencial >= 0
              ? 'Con carga positiva, el potencial en <i>P</i> es positivo y máximo sobre la mediatriz cuando el punto está en el centro (<i>d</i> = 0).'
              : 'Con carga negativa, el potencial en <i>P</i> es negativo y más intenso cuanto más cerca está el punto de la varilla.')
          },
          {
            t: 'text',
            html: 'Una carga puntual de la misma <i>Q</i> en el centro daría <i>kQ</i>/<i>d</i> = ' + N.format(puntual, 3) + ' V. La varilla da ' + N.format(potencial, 3) + ' V, un ' + N.format(dif, 2) + ' % ' + (puntual < potencial ? 'menos' : 'más') + ': los extremos están más lejos y aportan menos.'
          },
          {
            t: 'text',
            html: 'Cuando <i>d</i> ≫ <i>L</i>, el logaritmo tiende a <i>L</i>/(2<i>d</i>) y <i>V</i> → <i>kQ</i>/<i>d</i>. La distribución se ve desde lejos como una carga puntual.'
          }
        ]
      }
    ];

    // Curva V(d) sobre la mediatriz.
    var xMin = Math.min(0.12 * L, 0.6 * d);
    var xMax = Math.max(2 * d, 2.5 * L, 1.2 * d);
    var puntos = [];
    var pasos = 240;
    for (var i = 0; i <= pasos; i++) {
      var x = xMin + (xMax - xMin) * (i / pasos);
      var r = Math.sqrt(x * x + mitad * mitad);
      puntos.push({ x: x, y: 2 * kLambda * Math.log((r + mitad) / x) });
    }

    var tope = Math.abs(potencial) * 1.6;
    var grafica = {
      xLabel: 'distancia sobre la mediatriz, d (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
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
      cierre: 'Sobre la mediatriz, a ' + N.format(d, 3) + ' m del centro, V = ' + N.format(potencial, 3) + ' V.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'varillaMediatriz',
    nombre: 'Varilla en la mediatriz',
    grupo: 'Distribuciones continuas',
    resumen: 'Potencial de una varilla finita con carga uniforme en un punto de su mediatriz.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
