/* ═══════════════════════════════════════════════════════════════════
   puntual.js — Potencial de una carga puntual
   Sigue el procedimiento de la guía: definición, deducción, sustitución
   por pasos e interpretación del signo.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'q', label: 'Carga', symbol: 'q', unit: 'uC', scale: 1e-6, help: 'Puede ser positiva o negativa.' }),
      V.field({ id: 'r', label: 'Distancia al punto', symbol: 'r', unit: 'm', min: 0, help: 'En r = 0 el potencial no está definido.' })
    ];
  }

  function validar(v) {
    var errors = {};
    if (v.q === 0) {
      errors.q = 'Con q = 0 no hay campo ni potencial: el resultado sería 0 V.';
    }
    return { errors: errors, warnings: {} };
  }

  function resolver(v) {
    var q = v.q, r = v.r;
    var kq = K * q;
    var potencial = kq / r;
    var signo = q > 0 ? 'positivo' : 'negativo';

    var incisos = [
      {
        letra: 'a',
        titulo: 'Deducción de la fórmula',
        bloques: [
          { t: 'text', html: 'El potencial es la energía potencial por unidad de carga de prueba:' },
          { t: 'eq', html: M.v('V') + ' = ' + M.frac(M.v('U'), M.v('q<sub>0</sub>')) },
          { t: 'text', html: 'La energía potencial de dos cargas puntuales separadas una distancia <i>r</i> es:' },
          { t: 'eq', html: M.v('U') + ' = ' + M.frac('k' + M.v('q') + M.v('q<sub>0</sub>'), M.v('r')) },
          { t: 'text', html: 'Al sustituir en la definición, la carga de prueba se cancela:' },
          { t: 'eq', html: M.v('V') + ' = ' + M.frac('k' + M.v('q') + M.v('q<sub>0</sub>') + ' / ' + M.v('r'), M.v('q<sub>0</sub>')) + ' = ' + M.frac('k' + M.v('q'), M.v('r')) },
          { t: 'note', html: 'Esta expresión toma <i>V</i> = 0 en el infinito. Solo depende de la carga que crea el campo y de la distancia al punto.' }
        ]
      },
      {
        letra: 'b',
        titulo: 'Cálculo del potencial',
        bloques: [
          { t: 'text', html: 'Paso 1. Sustituir los datos en la fórmula.' },
          { t: 'eq', html: M.v('V') + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(q, 3) + ')', N.format(r, 3)) },
          { t: 'text', html: 'Paso 2. Multiplicar <i>k</i> por <i>q</i>.' },
          { t: 'calc', html: '(8.99 × 10<sup>9</sup>)(' + N.format(q, 3) + ') = ' + N.format(kq, 4) },
          { t: 'text', html: 'Paso 3. Dividir entre la distancia.' },
          { t: 'calc', html: M.v('V') + ' = ' + M.frac(N.format(kq, 4), N.format(r, 3)) + ' = ' + N.format(potencial, 4) + ' V' },
          { t: 'text', html: 'Paso 4. Expresar con tres cifras significativas.' }
        ],
        resultado: { label: 'V', html: N.format(potencial, 3) + ' V' }
      },
      {
        letra: 'c',
        titulo: 'Interpretación del signo',
        bloques: [
          {
            t: 'text',
            html: q > 0
              ? 'Como la carga es positiva, el potencial también lo es: <b>V &gt; 0</b>. El punto está a mayor potencial que el infinito, así que una carga de prueba positiva colocada ahí tendría energía potencial positiva y sería repelida hacia el infinito.'
              : 'Como la carga es negativa, el potencial es negativo: <b>V &lt; 0</b>. El punto está a menor potencial que el infinito, así que una carga de prueba positiva colocada ahí tendría energía potencial negativa y caería hacia la carga.'
          }
        ]
      }
    ];

    var rMin = r / 4, rMax = r * 4;
    var puntos = [];
    var pasos = 160;
    for (var i = 0; i <= pasos; i++) {
      var x = rMin + (rMax - rMin) * (i / pasos);
      puntos.push({ x: x, y: K * q / x });
    }

    return {
      principal: 'V = ' + N.texto(potencial, 3) + ' V',
      datos: [
        { sym: 'q', value: N.format(q * 1e6, 3) + ' µC', conv: N.format(q, 3) + ' C' },
        { sym: 'r', value: N.format(r, 3) + ' m', conv: '' },
        { sym: 'k', value: '8.99 × 10<sup>9</sup> N·m²/C²', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'r (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
        series: [{ points: puntos, color: 'var(--teal)', label: '' }],
        marker: { x: r, y: potencial }
      },
      cierre: 'Resultado: el potencial en el punto es ' + N.format(potencial, 3) + ' V, de signo ' + signo + '.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'puntual',
    nombre: 'Carga puntual',
    grupo: 'Cargas puntuales',
    resumen: 'Potencial en un punto del espacio a distancia r de una carga q.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
