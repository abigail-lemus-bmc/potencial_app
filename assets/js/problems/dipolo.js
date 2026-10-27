/* ═══════════════════════════════════════════════════════════════════
   dipolo.js — Potencial de un dipolo sobre su eje
   Dos cargas ±q separadas 2a. El potencial exacto se obtiene sumando los
   aportes; el aproximado, con el momento dipolar p = 2qa. La diferencia
   entre ambos mide cuándo vale la pena la aproximación.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  var K = N.K_REF;

  function campos() {
    return [
      V.field({ id: 'q', label: 'Carga de cada polo', symbol: 'q', unit: 'uC', scale: 1e-6, help: 'El dipolo tiene +q y −q; escribe el valor de q.' }),
      V.field({ id: 'a', label: 'Semiseparación', symbol: 'a', unit: 'm', min: 0, help: 'Cada carga está a la distancia a del centro; la separación total es 2a.' }),
      V.field({ id: 'x', label: 'Distancia del centro a P', symbol: 'x', unit: 'm', min: 0, help: 'Sobre el eje del dipolo, fuera de él.' })
    ];
  }

  function validar(v) {
    var errors = {}, warnings = {};
    if (v.x <= v.a) {
      errors.x = 'P debe quedar fuera del dipolo: x > a.';
    }
    if (v.q === 0) {
      warnings.q = 'Con q = 0 no hay dipolo: revisa la carga.';
    } else if (v.x > v.a && v.x < 2 * v.a) {
      warnings.x = 'Con x < 2a la aproximación dipolar deja de ser válida.';
    }
    return { errors: errors, warnings: warnings };
  }

  function resolver(v) {
    var q = v.q, a = v.a, x = v.x;
    var rp = x - a;          // distancia a +q
    var rm = x + a;          // distancia a −q
    var Vp = K * q / rp;
    var Vm = -K * q / rm;
    var exacto = Vp + Vm;
    var p = 2 * q * a;
    var aproximado = K * p / (x * x);
    var error = exacto !== 0 ? Math.abs(exacto - aproximado) / Math.abs(exacto) * 100 : 0;
    var cociente = x / a;

    // La guía suma los dos aportes ya redondeados a cuatro cifras y
    // escribe el resultado en la misma potencia de diez.
    var exp = Math.floor(Math.log10(Math.max(Math.abs(Vp), Math.abs(Vm)) || 1));
    var factor = Math.pow(10, exp);
    var a4 = parseFloat((Vp / factor).toFixed(3));
    var b4 = parseFloat((Vm / factor).toFixed(3));
    var suma = parseFloat((a4 + b4).toFixed(3));
    var sumado = suma * factor;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Distancia de P a cada carga',
        bloques: [
          { t: 'text', html: 'El dipolo está formado por +<i>q</i> y −<i>q</i> separadas 2<i>a</i>. El punto <i>P</i> está sobre el eje, a la distancia <i>x</i> del centro, del lado de +<i>q</i>.' },
          { t: 'eq', html: M.v('r<sub>+</sub>') + ' = ' + M.v('x') + ' − ' + M.v('a') + ' = ' + N.format(x, 3) + ' − ' + N.format(a, 3) + ' = ' + N.format(rp, 3) + ' m' },
          { t: 'eq', html: M.v('r<sub>−</sub>') + ' = ' + M.v('x') + ' + ' + M.v('a') + ' = ' + N.format(x, 3) + ' + ' + N.format(a, 3) + ' = ' + N.format(rm, 3) + ' m' },
          { t: 'note', html: 'La condición <i>x</i> > <i>a</i> es la que garantiza que <i>P</i> esté fuera del dipolo. Si no se cumple, el punto cae entre las cargas y las distancias cambian de signo.' }
        ],
        resultado: { label: 'r₊ , r₋', html: N.format(rp, 3) + ' y ' + N.format(rm, 3) + ' m' }
      },
      {
        letra: 'b',
        titulo: 'Potencial de cada carga',
        bloques: [
          { t: 'eq', html: M.v('V<sub>+</sub>') + ' = ' + M.frac('k' + M.v('q'), M.v('r<sub>+</sub>')) + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(q, 3) + ')', N.format(rp, 3)) + ' = ' + N.sci(Vp, 4) + ' V' },
          { t: 'eq', html: M.v('V<sub>−</sub>') + ' = ' + M.frac('k(−' + M.v('q') + ')', M.v('r<sub>−</sub>')) + ' = ' + M.frac('(8.99 × 10<sup>9</sup>)(−' + N.format(Math.abs(q), 3) + ')', N.format(rm, 3)) + ' = ' + N.sci(Vm, 4) + ' V' },
          { t: 'text', html: 'La carga positiva está más cerca y produce un potencial mayor en valor absoluto que el negativo. Por eso la suma no se anula.' }
        ]
      },
      {
        letra: 'c',
        titulo: 'Potencial exacto',
        bloques: [
          { t: 'eq', html: M.v('V') + ' = ' + M.v('V<sub>+</sub>') + ' + ' + M.v('V<sub>−</sub>') },
          { t: 'eq', html: M.v('V') + ' = ' + N.sci(Vp, 4) + ' + (' + N.sci(Vm, 4) + ')' },
          { t: 'text', html: 'Con la misma potencia de diez, los aportes se restan directamente:' },
          { t: 'calc', html: M.v('V') + ' = (' + a4 + (b4 < 0 ? ' − ' : ' + ') + Math.abs(b4) + ') × 10<sup>' + exp + '</sup> = ' + suma + ' × 10<sup>' + exp + '</sup>' },
          { t: 'text', html: suma + ' × 10<sup>' + exp + '</sup> V es lo mismo que ' + N.sciTexto(sumado, 3) + ' V.' },
          { t: 'text', html: 'En forma algebraica, con denominador común, se llega a la expresión cerrada:' },
          { t: 'eq', html: M.v('V') + ' = k' + M.v('q') + ' (' + M.frac('1', M.v('x') + ' − ' + M.v('a')) + ' − ' + M.frac('1', M.v('x') + ' + ' + M.v('a')) + ') = ' + M.frac('2k' + M.v('q') + M.v('a'), M.v('x<sup>2</sup>') + ' − ' + M.v('a<sup>2</sup>')) },
          { t: 'note', html: 'Si se suman los aportes sin redondear, se obtiene ' + N.sciTexto(exacto, 4) + ' V. La diferencia con ' + N.sciTexto(sumado, 3) + ' V es solo de redondeo: por eso conviene no redondear los pasos intermedios.' }
        ],
        resultado: { label: 'V exacto', html: N.sciTexto(sumado, 3) + ' V' }
      },
      {
        letra: 'd',
        titulo: 'Momento dipolar',
        bloques: [
          { t: 'text', html: 'El momento dipolar resume la geometría y la carga del par:' },
          { t: 'eq', html: M.v('p') + ' = 2' + M.v('qa') + ' = 2(' + N.format(q, 3) + ')(' + N.format(a, 3) + ') = ' + N.format(p, 3) + ' C·m' },
          { t: 'text', html: 'Su unidad es carga por distancia (C·m) y apunta de la carga negativa a la positiva.' }
        ],
        resultado: { label: 'p', html: N.format(p, 3) + ' C·m' }
      },
      {
        letra: 'e',
        titulo: 'Aproximación para x ≫ a',
        bloques: [
          { t: 'text', html: 'Si <i>x</i> ≫ <i>a</i>, el denominador <i>x</i><sup>2</sup> − <i>a</i><sup>2</sup> se puede reemplazar por <i>x</i><sup>2</sup>:' },
          { t: 'eq', html: M.v('V') + ' ≈ ' + M.frac('k' + M.v('p'), M.v('x<sup>2</sup>')) },
          { t: 'eq', html: M.v('V') + ' ≈ ' + M.frac('(8.99 × 10<sup>9</sup>)(' + N.format(p, 3) + ')', '(' + N.format(x, 3) + ')<sup>2</sup>') + ' = ' + N.sci(aproximado, 4) + ' V' },
          { t: 'text', html: 'Error porcentual frente al valor exacto:' },
          { t: 'eq', html: '% error = ' + M.frac('|' + N.format(exacto, 4) + ' − ' + N.format(aproximado, 4) + '|', N.format(Math.abs(exacto), 4)) + ' × 100 = ' + N.format(error, 3) + ' %' }
        ],
        resultado: { label: 'V aprox.', html: N.sciTexto(aproximado, 3) + ' V (' + N.format(error, 2) + ' %)' }
      },
      {
        letra: 'f',
        titulo: 'Interpretación',
        bloques: [
          {
            t: 'text',
            html: 'El cociente <i>x</i>/<i>a</i> vale ' + N.format(cociente, 3) + '. ' +
              (error < 5
                ? 'Como es grande, la condición <i>x</i> ≫ <i>a</i> se cumple y la aproximación dipolar es razonable: el error es de solo ' + N.format(error, 2) + ' %.'
                : 'Como no es grande, <i>x</i> no está lejos del dipolo y la aproximación falla: el error llega a ' + N.format(error, 2) + ' %. Usa la expresión exacta.')
          },
          { t: 'text', html: 'El potencial del dipolo decae como 1/<i>x</i><sup>2</sup>, más rápido que el 1/<i>x</i> de una carga puntual. La razón física es que desde lejos las dos cargas se cancelan y solo queda el término de orden siguiente.' },
          { t: 'text', html: (exacto > 0 ? 'El resultado es positivo porque +q está más cerca de P.' : 'El resultado es negativo porque −q está más cerca de P.') }
        ]
      }
    ];

    // Curva V(x) sobre el eje, del lado de +q.
    var xMin = Math.max(1.2 * a, 0.72 * x);
    var xMax = Math.max(2.2 * x, 6 * a);
    var puntos = [];
    var ref = [];
    var pasos = 220;
    for (var i = 0; i <= pasos; i++) {
      var xi = xMin + (xMax - xMin) * (i / pasos);
      puntos.push({ x: xi, y: 2 * K * q * a / (xi * xi - a * a) });
    }
    for (var j = 0; j <= pasos; j++) {
      var xr = xMin + (xMax - xMin) * (j / pasos);
      ref.push({ x: xr, y: K * p / (xr * xr) });
    }

    var tope = Math.abs(exacto) * 2.2;
    var grafica = {
      xLabel: 'x (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
      series: [
        { points: puntos, color: 'var(--teal)', label: 'exacto' },
        { points: ref, color: 'var(--muted)', dash: '5 5', label: 'kp/x²' }
      ],
      marker: { x: x, y: exacto }
    };
    if (tope > 1e-12) grafica.clipY = exacto >= 0 ? [0, tope] : [-tope, 0];

    return {
      principal: 'V = ' + N.sciTexto(sumado, 3) + ' V',
      datos: [
        { sym: 'q', value: N.format(q * 1e6, 3) + ' µC', conv: N.format(q, 3) + ' C' },
        { sym: 'a', value: N.format(a, 3) + ' m', conv: '' },
        { sym: 'x', value: N.format(x, 3) + ' m', conv: '' },
        { sym: 'p', value: N.format(p, 3) + ' C·m', conv: '' },
        { sym: 'k', value: '8.99 × 10<sup>9</sup> N·m²/C²', conv: '' }
      ],
      incisos: incisos,
      grafica: grafica,
      cierre: 'En el eje, a ' + N.format(x, 3) + ' m del centro, V = ' + N.sciTexto(sumado, 3) + ' V; la aproximación dipolar da ' + N.sciTexto(aproximado, 3) + ' V.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'dipolo',
    nombre: 'Dipolo eléctrico',
    grupo: 'Cargas puntuales',
    resumen: 'Potencial sobre el eje de un dipolo: valor exacto, aproximación kp/x² y error porcentual.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
