/* ═══════════════════════════════════════════════════════════════════
   superposicion.js — Potencial de dos cargas puntuales en el punto medio
   El potencial es escalar: se suman los aportes de cada carga con su
   signo, sin vectores y sin componentes.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'q1', label: 'Primera carga', symbol: 'q₁', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'q2', label: 'Segunda carga', symbol: 'q₂', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'd', label: 'Separación entre cargas', symbol: 'd', unit: 'm', min: 0 })
    ];
  }

  function validar(v) {
    var errors = {};
    if (v.q1 === 0 && v.q2 === 0) {
      errors.q1 = 'Si ambas cargas son cero no existe campo eléctrico.';
    }
    if (v.d <= 0) {
      errors.d = 'La separación debe ser mayor que cero.';
    }
    return { errors: errors, warnings: {} };
  }

  // Escribe a y b con la misma potencia de diez, como en la guía.
  function mismaPotencia(a, b) {
    var ref = Math.max(Math.abs(a), Math.abs(b));
    if (ref === 0) return { a: '0', b: '0', exp: 0 };
    var exp = Math.floor(Math.log10(ref));
    return {
      a: (a / Math.pow(10, exp)).toFixed(4),
      b: (b / Math.pow(10, exp)).toFixed(4),
      exp: exp
    };
  }

  function resolver(v) {
    var q1 = v.q1, q2 = v.q2, d = v.d;
    var r = d / 2;
    var v1 = K * q1 / r;
    var v2 = K * q2 / r;
    var total = v1 + v2;

    var p = mismaPotencia(v1, v2);
    var suma = (parseFloat(p.a) + parseFloat(p.b)).toFixed(4);

    var interpretacion;
    if (Math.abs(total) < Math.abs(v1) * 1e-12) {
      interpretacion = 'Las dos contribuciones tienen el mismo valor absoluto y signo opuesto, así que se cancelan por completo: el punto medio queda a potencial cero.';
    } else if (total > 0) {
      interpretacion = 'La carga positiva domina la suma, por eso el potencial total resulta positivo (' + N.format(total, 3) + ' V).';
    } else {
      interpretacion = 'La carga negativa domina la suma, por eso el potencial total resulta negativo (' + N.format(total, 3) + ' V).';
    }

    var incisos = [
      {
        letra: 'a',
        titulo: 'Distancia desde cada carga al punto medio',
        bloques: [
          { t: 'text', html: 'El punto medio está exactamente a la mitad de la separación:' },
          { t: 'eq', html: M.v('r<sub>1</sub>') + ' = ' + M.v('r<sub>2</sub>') + ' = ' + M.frac(M.v('d'), '2') + ' = ' + M.frac(N.format(d, 3), '2') + ' = ' + N.format(r, 3) + ' m' }
        ],
        resultado: { label: 'r₁ = r₂', html: N.format(r, 3) + ' m' }
      },
      {
        letra: 'b',
        titulo: 'Potencial debido a q₁',
        bloques: [
          { t: 'eq', html: M.v('V<sub>1</sub>') + ' = ' + M.frac('k' + M.v('q<sub>1</sub>'), M.v('r<sub>1</sub>')) },
          { t: 'text', html: 'Sustituyendo:' },
          { t: 'eq', html: M.v('V<sub>1</sub>') + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(q1, 3) + ')', N.format(r, 3)) },
          { t: 'text', html: 'Multiplicamos:' },
          { t: 'calc', html: '(8.99 × 10<sup>9</sup>)(' + N.format(q1, 3) + ') = ' + N.format(K * q1, 4) },
          { t: 'text', html: 'Dividimos:' },
          { t: 'calc', html: M.v('V<sub>1</sub>') + ' = ' + M.frac(N.format(K * q1, 4), N.format(r, 3)) + ' = ' + N.format(v1, 4) + ' V' }
        ],
        resultado: { label: 'V₁', html: N.format(v1, 3) + ' V' }
      },
      {
        letra: 'c',
        titulo: 'Potencial debido a q₂',
        bloques: [
          { t: 'eq', html: M.v('V<sub>2</sub>') + ' = ' + M.frac('k' + M.v('q<sub>2</sub>'), M.v('r<sub>2</sub>')) },
          { t: 'text', html: 'Sustituyendo:' },
          { t: 'eq', html: M.v('V<sub>2</sub>') + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(q2, 3) + ')', N.format(r, 3)) },
          { t: 'text', html: 'Multiplicamos:' },
          { t: 'calc', html: '(8.99 × 10<sup>9</sup>)(' + N.format(q2, 3) + ') = ' + N.format(K * q2, 4) },
          { t: 'text', html: 'Dividimos:' },
          { t: 'calc', html: M.v('V<sub>2</sub>') + ' = ' + M.frac(N.format(K * q2, 4), N.format(r, 3)) + ' = ' + N.format(v2, 4) + ' V' }
        ],
        resultado: { label: 'V₂', html: N.format(v2, 3) + ' V' }
      },
      {
        letra: 'd',
        titulo: 'Potencial total',
        bloques: [
          { t: 'text', html: 'El potencial es una magnitud escalar, así que los aportes se suman algebraicamente:' },
          { t: 'eq', html: M.v('V') + ' = ' + M.v('V<sub>1</sub>') + ' + ' + M.v('V<sub>2</sub>') },
          { t: 'eq', html: M.v('V') + ' = ' + N.format(v1, 4) + ' + (' + N.format(v2, 4) + ')' },
          { t: 'text', html: 'Expresamos con la misma potencia de diez:' },
          { t: 'calc', html: M.v('V') + ' = ' + p.a + ' × 10<sup>' + p.exp + '</sup> ' + (parseFloat(p.b) < 0 ? '− ' : '+ ') + Math.abs(parseFloat(p.b)).toFixed(4) + ' × 10<sup>' + p.exp + '</sup>' },
          { t: 'calc', html: M.v('V') + ' = (' + p.a + (parseFloat(p.b) < 0 ? ' − ' : ' + ') + Math.abs(parseFloat(p.b)).toFixed(4) + ') × 10<sup>' + p.exp + '</sup> = ' + suma + ' × 10<sup>' + p.exp + '</sup>' }
        ],
        resultado: { label: 'V', html: N.format(total, 3) + ' V' }
      },
      {
        letra: 'e',
        titulo: 'Interpretación',
        bloques: [{ t: 'text', html: interpretacion }]
      }
    ];

    // Curva del potencial a lo largo de la recta que une las cargas.
    var puntos = [];
    var ini = 0.08 * d, fin = 0.92 * d, pasos = 200;
    for (var i = 0; i <= pasos; i++) {
      var x = ini + (fin - ini) * (i / pasos);
      puntos.push({ x: x, y: K * q1 / x + K * q2 / (d - x) });
    }

    return {
      principal: 'V = ' + N.texto(total, 3) + ' V',
      datos: [
        { sym: 'q₁', value: N.format(q1 * 1e6, 3) + ' µC', conv: N.format(q1, 3) + ' C' },
        { sym: 'q₂', value: N.format(q2 * 1e6, 3) + ' µC', conv: N.format(q2, 3) + ' C' },
        { sym: 'd', value: N.format(d, 3) + ' m', conv: '' },
        { sym: 'k', value: '8.99 × 10<sup>9</sup> N·m²/C²', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'posición sobre la recta (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
        series: [{ points: puntos, color: 'var(--teal)' }],
        marker: { x: r, y: total }
      },
      cierre: 'En el punto medio, V = ' + N.format(total, 3) + ' V.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'superposicion',
    nombre: 'Dos cargas puntuales',
    grupo: 'Cargas puntuales',
    resumen: 'Potencial en el punto medio entre dos cargas separadas una distancia d.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
