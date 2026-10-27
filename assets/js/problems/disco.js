/* ═══════════════════════════════════════════════════════════════════
   disco.js — Potencial de un disco cargado sobre su eje
   Se divide el disco en anillos concéntricos: cada anillo equidista de
   P, pero esa distancia cambia de un anillo a otro. De ahí la integral.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'R', label: 'Radio del disco', symbol: 'R', unit: 'm', min: 0 }),
      V.field({ id: 'Q', label: 'Carga total', symbol: 'Q', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'x', label: 'Distancia sobre el eje', symbol: 'x', unit: 'm', min: 0, exclusiveMin: false })
    ];
  }

  function validar(v) {
    var warnings = {};
    if (v.Q === 0) {
      warnings.Q = 'Con Q = 0 no hay potencial: revisa la carga del disco.';
    }
    if (v.x === 0) {
      warnings.x = 'En el centro del disco el potencial es finito: V = 2kQ/R.';
    }
    return { errors: {}, warnings: warnings };
  }

  function resolver(v) {
    var R = v.R, Q = v.Q, x = v.x;
    var area = Math.PI * R * R;
    var sigma = Q / area;
    var x2 = x * x, R2 = R * R;
    var suma = x2 + R2;
    var s = Math.sqrt(suma);
    var resta = s - x;
    var coef = 2 * Math.PI * K * sigma;
    var potencial = coef * resta;
    var enCentro = 2 * K * Q / R;
    var puntual = x > 0 ? K * Q / x : Infinity;
    var dif = x > 0 && potencial !== 0 ? Math.abs(potencial - puntual) / Math.abs(potencial) * 100 : 0;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Densidad superficial de carga',
        bloques: [
          { t: 'text', html: 'La carga se reparte por igual en la superficie del disco, de área <i>A</i> = π<i>R</i><sup>2</sup>:' },
          { t: 'eq', html: M.v('σ') + ' = ' + M.frac(M.v('Q'), 'π' + M.v('R<sup>2</sup>')) },
          { t: 'calc', html: '(' + N.format(R, 3) + ')<sup>2</sup> = ' + N.format(R2, 4) },
          { t: 'calc', html: 'π(' + N.format(R2, 4) + ') = ' + N.format(area, 4) + ' m<sup>2</sup>' },
          { t: 'calc', html: M.v('σ') + ' = ' + M.frac(N.format(Q, 3), N.format(area, 4)) + ' = ' + N.format(sigma, 3) + ' C/m<sup>2</sup>' }
        ],
        resultado: { label: 'σ', html: N.format(sigma, 3) + ' C/m²' }
      },
      {
        letra: 'b',
        titulo: 'El disco como anillos concéntricos',
        bloques: [
          { t: 'text', html: 'Un anillo de radio <i>r</i> y espesor <i>dr</i> tiene área <i>dA</i> = 2π<i>r</i> <i>dr</i>, así que su carga es:' },
          { t: 'eq', html: M.v('dq') + ' = ' + M.v('σ') + ' ' + M.v('dA') + ' = 2π' + M.v('σ') + ' ' + M.v('r') + ' ' + M.v('dr') },
          { t: 'text', html: 'Todos los puntos de ese anillo están a la misma distancia del punto <i>P</i> del eje:' },
          { t: 'eq', html: M.v('s') + ' = ' + M.sqrt(M.v('x<sup>2</sup>') + ' + ' + M.v('r<sup>2</sup>')) },
          { t: 'note', html: 'Aquí está la diferencia con el anillo único: <i>s</i> ya no es constante, depende de <i>r</i>. Por eso hay que integrar de 0 a <i>R</i>.' }
        ]
      },
      {
        letra: 'c',
        titulo: 'Planteo e integración',
        bloques: [
          { t: 'eq', html: M.v('dV') + ' = ' + M.frac('k ' + M.v('dq'), M.v('s')) + ' = ' + M.frac('2πk' + M.v('σ') + ' ' + M.v('r') + ' ' + M.v('dr'), M.sqrt(M.v('x<sup>2</sup>') + ' + ' + M.v('r<sup>2</sup>'))) },
          { t: 'eq', html: M.v('V') + ' = 2πk' + M.v('σ') + ' ∫<sub>0</sub><sup>' + M.v('R') + '</sup> ' + M.frac(M.v('r') + ' ' + M.v('dr'), M.sqrt(M.v('x<sup>2</sup>') + ' + ' + M.v('r<sup>2</sup>'))) },
          { t: 'text', html: 'La integral es directa, porque el numerador es la derivada de lo que está dentro de la raíz:' },
          { t: 'eq', html: '∫ ' + M.frac(M.v('r') + ' ' + M.v('dr'), M.sqrt(M.v('x<sup>2</sup>') + ' + ' + M.v('r<sup>2</sup>'))) + ' = ' + M.sqrt(M.v('x<sup>2</sup>') + ' + ' + M.v('r<sup>2</sup>')) },
          { t: 'eq', html: M.v('V') + ' = 2πk' + M.v('σ') + ' [' + M.sqrt(M.v('x<sup>2</sup>') + ' + ' + M.v('r<sup>2</sup>')) + ']<sub>0</sub><sup>' + M.v('R') + '</sup>' },
          { t: 'eq', html: M.v('V') + ' = 2πk' + M.v('σ') + ' (' + M.sqrt(M.v('x<sup>2</sup>') + ' + ' + M.v('R<sup>2</sup>')) + ' − ' + M.v('x') + ')' },
          { t: 'text', html: 'Sustituyendo <i>σ</i> = <i>Q</i>/π<i>R</i><sup>2</sup> queda la forma con la carga total:' },
          { t: 'eq', html: M.v('V') + ' = ' + M.frac('2k' + M.v('Q'), M.v('R<sup>2</sup>')) + ' (' + M.sqrt(M.v('x<sup>2</sup>') + ' + ' + M.v('R<sup>2</sup>')) + ' − ' + M.v('x') + ')' }
        ]
      },
      {
        letra: 'd',
        titulo: 'Cálculo numérico',
        bloques: [
          { t: 'eq', html: M.v('V') + ' = 2π(8.99 × 10<sup>9</sup>)(' + N.format(sigma, 3) + ')(' + M.sqrt(N.format(x, 3) + '<sup>2</sup> + ' + N.format(R, 3) + '<sup>2</sup>') + ' − ' + N.format(x, 3) + ')' },
          { t: 'text', html: 'Cuadrados y suma dentro de la raíz:' },
          { t: 'calc', html: '(' + N.format(x, 3) + ')<sup>2</sup> = ' + N.format(x2, 4) + ', (' + N.format(R, 3) + ')<sup>2</sup> = ' + N.format(R2, 4) },
          { t: 'calc', html: N.format(x2, 4) + ' + ' + N.format(R2, 4) + ' = ' + N.format(suma, 4) },
          { t: 'calc', html: M.sqrt(N.format(suma, 4)) + ' = ' + N.format(s, 4) + ' m' },
          { t: 'calc', html: N.format(s, 4) + ' − ' + N.format(x, 3) + ' = ' + N.format(resta, 4) + ' m' },
          { t: 'text', html: 'El factor que multiplica al paréntesis:' },
          { t: 'calc', html: '2π(8.99 × 10<sup>9</sup>) = ' + N.format(2 * Math.PI * K, 4) },
          { t: 'calc', html: '(' + N.format(2 * Math.PI * K, 4) + ')(' + N.format(sigma, 3) + ') = ' + N.format(coef, 4) },
          { t: 'calc', html: M.v('V') + ' = (' + N.format(coef, 4) + ')(' + N.format(resta, 4) + ') = ' + N.format(potencial, 4) + ' V' }
        ],
        resultado: { label: 'V', html: N.format(potencial, 3) + ' V' }
      },
      {
        letra: 'e',
        titulo: 'Centro del disco y límite lejano',
        bloques: [
          { t: 'text', html: 'En el centro (<i>x</i> = 0) la raíz vale <i>R</i> y el potencial no diverge:' },
          { t: 'eq', html: M.v('V(0)') + ' = 2πk' + M.v('σ') + M.v('R') + ' = ' + M.frac('2k' + M.v('Q'), M.v('R')) + ' = ' + N.format(enCentro, 3) + ' V' },
          { t: 'text', html: (x > 0
            ? 'Para <i>x</i> ≫ <i>R</i> la raíz se aproxima a <i>x</i> + <i>R</i><sup>2</sup>/2<i>x</i>, y <i>V</i> → <i>kQ</i>/<i>x</i>. En este caso, a <i>x</i> = ' + N.format(x, 3) + ' m, la carga puntual daría ' + N.format(puntual, 3) + ' V: un ' + N.format(dif, 2) + ' % ' + (puntual < potencial ? 'menos' : 'más') + '.'
            : 'En el centro el disco no se comporta como una carga puntual: el potencial es finito aunque la distancia sea cero.') },
          { t: 'text', html: 'Sobre el eje el potencial siempre disminuye al alejarse del disco, y es positivo si la carga es positiva. La gráfica lo muestra junto a la curva de la carga puntual.' }
        ]
      }
    ];

    var xMax = Math.max(2 * R, 1.6 * x, R * 1.2);
    var puntos = [];
    var ref = [];
    var pasos = 220;
    for (var i = 0; i <= pasos; i++) {
      var xi = xMax * (i / pasos);
      puntos.push({ x: xi, y: (2 * K * Q / R2) * (Math.sqrt(xi * xi + R2) - xi) });
    }
    for (var j = 1; j <= pasos; j++) {
      var xr = xMax * (j / pasos);
      if (xr < 0.3 * R) continue;
      ref.push({ x: xr, y: K * Q / xr });
    }

    var tope = Math.abs(enCentro) * 1.12;
    var grafica = {
      xLabel: 'x (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
      series: [
        { points: puntos, color: 'var(--teal)', label: 'disco' },
        { points: ref, color: 'var(--muted)', dash: '5 5', label: 'carga puntual' }
      ],
      marker: { x: x, y: potencial }
    };
    if (tope > 1e-9) grafica.clipY = Q >= 0 ? [0, tope] : [-tope, 0];

    return {
      principal: 'V = ' + N.texto(potencial, 3) + ' V',
      datos: [
        { sym: 'R', value: N.format(R, 3) + ' m', conv: '' },
        { sym: 'Q', value: N.format(Q * 1e6, 3) + ' µC', conv: N.format(Q, 3) + ' C' },
        { sym: 'x', value: N.format(x, 3) + ' m', conv: '' },
        { sym: 'σ', value: N.format(sigma, 3) + ' C/m²', conv: '' },
        { sym: 'k', value: '8.99 × 10<sup>9</sup> N·m²/C²', conv: '' }
      ],
      incisos: incisos,
      grafica: grafica,
      cierre: 'Sobre el eje, a ' + N.format(x, 3) + ' m del centro, V = ' + N.format(potencial, 3) + ' V.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'disco',
    nombre: 'Disco cargado',
    grupo: 'Distribuciones continuas',
    resumen: 'Potencial en un punto del eje de un disco de radio R con carga Q uniforme.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
