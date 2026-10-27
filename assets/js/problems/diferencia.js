/* ═══════════════════════════════════════════════════════════════════
   diferencia.js — Diferencia de potencial entre dos puntos
   El potencial es escalar: V depende solo de la distancia a la carga.
   La diferencia ΔV = V_A − V_B mide cuánto cambia la energía por unidad
   de carga entre los dos puntos.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'q', label: 'Carga que crea el campo', symbol: 'q', unit: 'uC', scale: 1e-6, help: 'Está en el origen de coordenadas.' }),
      V.field({ id: 'rA', label: 'Distancia al punto A', symbol: 'r_A', unit: 'm', min: 0 }),
      V.field({ id: 'rB', label: 'Distancia al punto B', symbol: 'r_B', unit: 'm', min: 0 })
    ];
  }

  function validar(v) {
    var errors = {}, warnings = {};
    if (v.q === 0) {
      errors.q = 'Con q = 0 el potencial es cero en todos los puntos y no hay diferencia que calcular.';
    }
    if (Math.abs(v.rA - v.rB) < 1e-9) {
      warnings.rB = 'Los dos puntos están a la misma distancia: ΔV = 0.';
    }
    return { errors: errors, warnings: warnings };
  }

  function resolver(v) {
    var q = v.q, rA = v.rA, rB = v.rB;
    var kq = K * q;
    var VA = kq / rA;
    var VB = kq / rB;
    var delta = VA - VB;
    var cerca = rA < rB ? 'A' : 'B';
    var lejos = rA < rB ? 'B' : 'A';

    var incisos = [
      {
        letra: 'a',
        titulo: 'Potencial en el punto A',
        bloques: [
          { t: 'text', html: 'Como el campo lo crea una sola carga puntual y el potencial es cero en el infinito:' },
          { t: 'eq', html: M.v('V<sub>A</sub>') + ' = ' + M.frac('k' + M.v('q'), M.v('r<sub>A</sub>')) },
          { t: 'eq', html: M.v('V<sub>A</sub>') + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(q, 3) + ')', N.format(rA, 3)) },
          { t: 'calc', html: 'k' + M.v('q') + ' = ' + N.format(kq, 4) },
          { t: 'calc', html: M.v('V<sub>A</sub>') + ' = ' + M.frac(N.format(kq, 4), N.format(rA, 3)) + ' = ' + N.format(VA, 4) + ' V' }
        ],
        resultado: { label: 'V_A', html: N.format(VA, 3) + ' V' }
      },
      {
        letra: 'b',
        titulo: 'Potencial en el punto B',
        bloques: [
          { t: 'text', html: 'El mismo cálculo, con la distancia al punto B:' },
          { t: 'eq', html: M.v('V<sub>B</sub>') + ' = ' + M.frac('k' + M.v('q'), M.v('r<sub>B</sub>')) + ' = ' + M.frac(N.format(kq, 4), N.format(rB, 3)) },
          { t: 'calc', html: M.v('V<sub>B</sub>') + ' = ' + N.format(VB, 4) + ' V' },
          { t: 'note', html: 'La carga es la misma; lo único que cambia es la distancia. Por eso el potencial más alto corresponde al punto más cercano a la carga.' }
        ],
        resultado: { label: 'V_B', html: N.format(VB, 3) + ' V' }
      },
      {
        letra: 'c',
        titulo: 'Diferencia de potencial',
        bloques: [
          { t: 'text', html: 'La diferencia se define como el potencial final menos el inicial. Si se va de A a B:' },
          { t: 'eq', html: M.v('ΔV') + ' = ' + M.v('V<sub>B</sub>') + ' − ' + M.v('V<sub>A</sub>') },
          { t: 'calc', html: M.v('ΔV') + ' = ' + N.format(VB, 4) + ' − ' + N.format(VA, 4) + ' = ' + N.format(VB - VA, 4) + ' V' },
          { t: 'text', html: 'Si se pide el cambio de A hacia B en el sentido del enunciado, conviene escribir también la forma directa:' },
          { t: 'eq', html: M.v('V<sub>A</sub>') + ' − ' + M.v('V<sub>B</sub>') + ' = ' + N.format(delta, 4) + ' V' },
          { t: 'note', html: 'El signo depende del orden. La guía calcula V_A − V_B = ' + N.sciTexto(delta, 3) + ' V; el valor absoluto es el mismo y lo que cambia es la interpretación.' }
        ],
        resultado: { label: 'V_A − V_B', html: N.format(delta, 3) + ' V' }
      },
      {
        letra: 'd',
        titulo: 'Interpretación',
        bloques: [
          {
            t: 'text',
            html: 'El punto ' + cerca + ' está más cerca de la carga y tiene mayor potencial. El campo eléctrico apunta siempre hacia donde el potencial disminuye: desde ' + cerca + ' hacia ' + lejos + '.'
          },
          {
            t: 'text',
            html: 'Una carga de prueba positiva que se mueva de ' + lejos + ' a ' + cerca + ' gana energía potencial; el campo realiza trabajo negativo. Si se mueve de ' + cerca + ' a ' + lejos + ', el campo hace trabajo positivo y la energía potencial disminuye.'
          }
        ]
      }
    ];

    var rMin = Math.max(Math.min(rA, rB) * 0.45, 1e-4);
    var rMax = Math.max(rA, rB) * 1.7;
    var puntos = [];
    var pasos = 220;
    for (var i = 0; i <= pasos; i++) {
      var r = rMin + (rMax - rMin) * (i / pasos);
      puntos.push({ x: r, y: kq / r });
    }

    return {
      principal: 'ΔV = ' + N.texto(delta, 3) + ' V',
      datos: [
        { sym: 'q', value: N.format(q * 1e6, 3) + ' µC', conv: N.format(q, 3) + ' C' },
        { sym: 'r_A', value: N.format(rA, 3) + ' m', conv: '' },
        { sym: 'r_B', value: N.format(rB, 3) + ' m', conv: '' },
        { sym: 'k', value: '8.99 × 10<sup>9</sup> N·m²/C²', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'r (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
        series: [{ points: puntos, color: 'var(--teal)' }],
        markers: [
          { x: rA, y: VA, label: 'A', dy: -10 },
          { x: rB, y: VB, label: 'B', dy: -10, cls: 'p-dot' }
        ]
      },
      cierre: 'V_A = ' + N.format(VA, 3) + ' V y V_B = ' + N.format(VB, 3) + ' V; la diferencia es ' + N.format(delta, 3) + ' V.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'diferencia',
    nombre: 'Diferencia de potencial',
    grupo: 'Cargas puntuales',
    resumen: 'Potencial en dos puntos del campo de una carga puntual y diferencia entre ellos.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
