/* ═══════════════════════════════════════════════════════════════════
   linea.js — Potencial de una línea infinita de carga
   El campo de una línea infinita cae como 1/r. Al integrarlo aparece un
   logaritmo y el potencial no puede tomarse cero en el infinito: hay que
   fijar una distancia de referencia r0.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'lambda', label: 'Densidad lineal de carga', symbol: 'λ', unit: 'uC_m', scale: 1e-6 }),
      V.field({ id: 'r', label: 'Distancia a la línea', symbol: 'r', unit: 'm', min: 0 }),
      V.field({ id: 'r0', label: 'Distancia de referencia (V = 0)', symbol: 'r₀', unit: 'm', min: 0, help: 'El potencial vale cero en esta distancia.' })
    ];
  }

  function validar(v) {
    var errors = {}, warnings = {};
    if (v.lambda === 0) {
      errors.lambda = 'Con λ = 0 no hay campo ni potencial.';
    }
    if (Math.abs(v.r - v.r0) < 1e-9) {
      warnings.r = 'Si r = r₀ el punto es el de referencia y V = 0.';
    }
    return { errors: errors, warnings: warnings };
  }

  function resolver(v) {
    var lambda = v.lambda, r = v.r, r0 = v.r0;
    var dosKL = 2 * K * lambda;
    var cociente = r / r0;
    var ln = Math.log(cociente);
    var potencial = -dosKL * ln;
    var campo = dosKL / r;
    var campo0 = dosKL / r0;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Campo eléctrico de la línea',
        bloques: [
          { t: 'text', html: 'Por la ley de Gauss, una línea infinita con densidad uniforme produce un campo radial que solo depende de la distancia:' },
          { t: 'eq', html: M.v('E') + ' = ' + M.frac(M.v('λ'), '2π' + M.v('ε<sub>0</sub>') + M.v('r')) + ' = ' + M.frac('2k' + M.v('λ'), M.v('r')) },
          { t: 'calc', html: '2k' + M.v('λ') + ' = ' + N.format(dosKL, 4) + ' V' },
          { t: 'calc', html: M.v('E') + '(' + N.format(r, 3) + ' m) = ' + N.format(campo, 4) + ' V/m' },
          { t: 'note', html: 'El campo apunta hacia afuera si λ &gt; 0 y hacia la línea si λ &lt; 0.' }
        ],
        resultado: { label: 'E(r)', html: N.format(campo, 3) + ' V/m' }
      },
      {
        letra: 'b',
        titulo: 'Deducción del potencial',
        bloques: [
          { t: 'text', html: 'El potencial es menos la integral del campo. Como el campo depende de <i>r</i>, integramos desde la referencia <i>r</i>₀ hasta el punto <i>r</i>:' },
          { t: 'eq', html: M.v('V(r)') + ' − ' + M.v('V(r₀)') + ' = −∫<sub>r₀</sub><sup>r</sup> ' + M.v('E') + ' ' + M.v('dr') },
          { t: 'eq', html: M.v('V(r)') + ' − 0 = −2k' + M.v('λ') + ' ∫<sub>r₀</sub><sup>r</sup> ' + M.frac(M.v('dr'), M.v('r')) },
          { t: 'eq', html: M.v('V(r)') + ' = −2k' + M.v('λ') + ' ln ' + M.frac(M.v('r'), M.v('r₀')) },
          { t: 'note', html: 'El signo menos no es un error: si λ &gt; 0 y r &lt; r₀, el logaritmo es negativo y el potencial queda positivo. Al alejarse de una línea positiva, el potencial baja.' }
        ]
      },
      {
        letra: 'c',
        titulo: 'Cálculo numérico',
        bloques: [
          { t: 'eq', html: M.v('V') + ' = −2(8.99 × 10<sup>9</sup>)(' + N.format(lambda, 3) + ') ln ' + M.frac(N.format(r, 3), N.format(r0, 3)) },
          { t: 'calc', html: '2k' + M.v('λ') + ' = ' + N.format(dosKL, 4) + ' V' },
          { t: 'calc', html: M.frac(N.format(r, 3), N.format(r0, 3)) + ' = ' + N.format(cociente, 4) },
          { t: 'calc', html: 'ln(' + N.format(cociente, 4) + ') = ' + N.format(ln, 4) },
          { t: 'calc', html: M.v('V') + ' = −(' + N.format(dosKL, 4) + ')(' + N.format(ln, 4) + ') = ' + N.format(potencial, 4) + ' V' }
        ],
        resultado: { label: 'V(r)', html: N.format(potencial, 3) + ' V' }
      },
      {
        letra: 'd',
        titulo: 'Por qué se usa una referencia finita',
        bloques: [
          { t: 'text', html: 'Para una línea infinita el potencial diverge: al hacer <i>r</i> → ∞, ln(<i>r</i>/<i>r</i>₀) → ∞. No existe un valor finito que se pueda tomar como cero en el infinito.' },
          { t: 'text', html: 'Por eso se elige una distancia de referencia <i>r</i>₀ donde <i>V</i> = 0. Con esa elección, el potencial en cualquier otro punto queda definido y solo importan las diferencias entre puntos.' },
          { t: 'text', html: 'En este caso, a <i>r</i>₀ = ' + N.format(r0, 3) + ' m el campo vale ' + N.format(campo0, 3) + ' V/m. La elección de <i>r</i>₀ no cambia el campo: solo desplaza el nivel cero del potencial.' }
        ]
      }
    ];

    // La guía redondea a 9.89 × 10⁴ V; con k = 8.99 × 10⁹ el valor es
    // 9.88 × 10⁴ V. Solo se avisa cuando los datos son los del ejercicio.
    if (Math.abs(potencial - 9.883e4) / 9.883e4 < 1e-3) {
      incisos[2].bloques.push({
        t: 'note',
        html: 'La guía escribe 9.89 × 10<sup>4</sup> V. Con k = 8.99 × 10<sup>9</sup> y tres cifras significativas el valor es 9.88 × 10<sup>4</sup> V: la diferencia es solo de redondeo.'
      });
    }

    var rMin = Math.max(Math.min(r, r0) * 0.28, 1e-3);
    var rMax = Math.max(r, r0) * 2.2;
    var puntos = [];
    var pasos = 220;
    for (var i = 0; i <= pasos; i++) {
      var x = rMin + (rMax - rMin) * (i / pasos);
      puntos.push({ x: x, y: -dosKL * Math.log(x / r0) });
    }

    return {
      principal: 'V = ' + N.texto(potencial, 3) + ' V',
      datos: [
        { sym: 'λ', value: N.format(lambda * 1e6, 3) + ' µC/m', conv: N.format(lambda, 3) + ' C/m' },
        { sym: 'r', value: N.format(r, 3) + ' m', conv: '' },
        { sym: 'r₀', value: N.format(r0, 3) + ' m', conv: '' },
        { sym: 'k', value: '8.99 × 10<sup>9</sup> N·m²/C²', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'r (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
        series: [{ points: puntos, color: 'var(--teal)' }],
        marker: { x: r, y: potencial }
      },
      cierre: 'A ' + N.format(r, 3) + ' m de la línea, tomando V = 0 en ' + N.format(r0, 3) + ' m, el potencial es ' + N.format(potencial, 3) + ' V.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'linea',
    nombre: 'Línea infinita',
    grupo: 'Distribuciones continuas',
    resumen: 'Potencial de una línea infinita con densidad λ, referido a una distancia r₀.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
