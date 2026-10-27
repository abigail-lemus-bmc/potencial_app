/* ═══════════════════════════════════════════════════════════════════
   placas.js — Potencial entre placas paralelas
   Entre dos placas el campo es uniforme. El potencial baja linealmente
   de la placa positiva a la negativa, y la energía de una carga cambia
   según el sentido en que se mueva.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, M = global.M, V = global.Validate;

  function campos() {
    return [
      V.field({ id: 'd', label: 'Separación entre placas', symbol: 'd', unit: 'm', min: 0 }),
      V.field({ id: 'VA', label: 'Potencial de la placa A', symbol: 'V_A', unit: 'V' }),
      V.field({ id: 'VB', label: 'Potencial de la placa B', symbol: 'V_B', unit: 'V' }),
      V.field({ id: 'q', label: 'Carga que se mueve', symbol: 'q', unit: 'uC', scale: 1e-6 })
    ];
  }

  function validar(v) {
    var errors = {}, warnings = {};
    if (Math.abs(v.VA - v.VB) < 1e-9) {
      errors.VA = 'Si las dos placas están al mismo potencial no hay campo entre ellas.';
    }
    if (v.q === 0) {
      warnings.q = 'Con q = 0 no cambia la energía: ΔU = 0 y W = 0.';
    }
    return { errors: errors, warnings: warnings };
  }

  function resolver(v) {
    var d = v.d, VA = v.VA, VB = v.VB, q = v.q;
    var deltaV = VB - VA;
    var campo = Math.abs(deltaV) / d;
    var alta = VA > VB ? 'A' : 'B';
    var baja = VA > VB ? 'B' : 'A';
    var deltaU = q * deltaV;
    var trabajo = -deltaU;

    var incisos = [
      {
        letra: 'a',
        titulo: 'Campo eléctrico entre las placas',
        bloques: [
          { t: 'text', html: 'Entre placas paralelas el campo es uniforme y apunta de la placa de mayor potencial a la de menor. Su magnitud es el cociente entre la diferencia de potencial y la separación:' },
          { t: 'eq', html: M.v('E') + ' = ' + M.frac('|' + M.v('V<sub>A</sub>') + ' − ' + M.v('V<sub>B</sub>') + '|', M.v('d')) },
          { t: 'calc', html: '|' + N.format(VA, 3) + ' − ' + N.format(VB, 3) + '| = ' + N.format(Math.abs(deltaV), 4) + ' V' },
          { t: 'calc', html: M.v('E') + ' = ' + M.frac(N.format(Math.abs(deltaV), 4), N.format(d, 3)) + ' = ' + N.format(campo, 4) + ' V/m' },
          { t: 'note', html: 'El campo va de la placa ' + alta + ' a la placa ' + baja + '. Es el mismo en todos los puntos entre las placas: no depende de la posición.' }
        ],
        resultado: { label: 'E', html: N.format(campo, 3) + ' V/m' }
      },
      {
        letra: 'b',
        titulo: 'Diferencia de potencial',
        bloques: [
          { t: 'text', html: 'La diferencia entre las placas es la del enunciado:' },
          { t: 'eq', html: M.v('ΔV') + ' = ' + M.v('V<sub>B</sub>') + ' − ' + M.v('V<sub>A</sub>') + ' = ' + N.format(deltaV, 4) + ' V' },
          { t: 'text', html: 'El signo indica que se pasa de un potencial mayor a uno menor si se va de ' + alta + ' a ' + baja + '.' }
        ],
        resultado: { label: 'ΔV', html: N.format(deltaV, 3) + ' V' }
      },
      {
        letra: 'c',
        titulo: 'Cambio de energía potencial',
        bloques: [
          { t: 'text', html: 'La energía potencial de una carga en un campo eléctrico es <i>U</i> = <i>qV</i>. Su cambio al moverse entre las placas es:' },
          { t: 'eq', html: M.v('ΔU') + ' = ' + M.v('q') + ' ' + M.v('ΔV') },
          { t: 'eq', html: M.v('ΔU') + ' = (' + N.format(q, 3) + ')(' + N.format(deltaV, 3) + ') = ' + N.format(deltaU, 4) + ' J' },
          { t: 'note', html: deltaU < 0
            ? 'La energía disminuye: la carga positiva se mueve espontáneamente hacia la placa negativa.'
            : 'La energía aumenta: hay que hacer trabajo externo para llevar la carga hacia la placa del mismo signo.' }
        ],
        resultado: { label: 'ΔU', html: N.format(deltaU, 3) + ' J' }
      },
      {
        letra: 'd',
        titulo: 'Trabajo realizado por el campo',
        bloques: [
          { t: 'text', html: 'El trabajo del campo es menos el cambio de energía potencial:' },
          { t: 'eq', html: M.v('W<sub>campo</sub>') + ' = −' + M.v('ΔU') },
          { t: 'calc', html: M.v('W<sub>campo</sub>') + ' = −(' + N.format(deltaU, 4) + ') = ' + N.format(trabajo, 4) + ' J' },
          { t: 'text', html: 'Si el trabajo es positivo, el campo empuja la carga y ella gana energía cinética. Si es negativo, hay que frenarla o empujarla en contra.' }
        ],
        resultado: { label: 'W', html: N.format(trabajo, 3) + ' J' }
      },
      {
        letra: 'e',
        titulo: 'Potencial en función de la posición',
        bloques: [
          { t: 'text', html: 'Tomando <i>x</i> = 0 en la placa A, el potencial cambia linealmente hasta la placa B:' },
          { t: 'eq', html: M.v('V(x)') + ' = ' + M.v('V<sub>A</sub>') + ' + ' + M.frac(M.v('V<sub>B</sub>') + ' − ' + M.v('V<sub>A</sub>'), M.v('d')) + ' ' + M.v('x') },
          { t: 'calc', html: 'en <i>x</i> = 0: V = ' + N.format(VA, 3) + ' V' },
          { t: 'calc', html: 'en <i>x</i> = ' + N.format(d, 3) + ' m: V = ' + N.format(VB, 3) + ' V' },
          { t: 'text', html: 'La gráfica es una recta cuya pendiente es ' + N.format(deltaV / d, 3) + ' V/m. El campo apunta en el sentido en que el potencial disminuye: de ' + alta + ' hacia ' + baja + '.' }
        ]
      }
    ];

    var puntos = [];
    var pasos = 60;
    for (var i = 0; i <= pasos; i++) {
      var x = d * (i / pasos);
      puntos.push({ x: x, y: VA + (deltaV / d) * x });
    }

    return {
      principal: 'E = ' + N.texto(campo, 3) + ' V/m',
      datos: [
        { sym: 'd', value: N.format(d, 3) + ' m', conv: '' },
        { sym: 'V_A', value: N.format(VA, 3) + ' V', conv: '' },
        { sym: 'V_B', value: N.format(VB, 3) + ' V', conv: '' },
        { sym: 'q', value: N.format(q * 1e6, 3) + ' µC', conv: N.format(q, 3) + ' C' },
        { sym: 'E', value: N.format(campo, 3) + ' V/m', conv: '' },
        { sym: 'ΔU', value: N.format(deltaU, 3) + ' J', conv: '' },
        { sym: 'W', value: N.format(trabajo, 3) + ' J', conv: '' }
      ],
      incisos: incisos,
      grafica: {
        xLabel: 'x entre placas (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
        series: [{ points: puntos, color: 'var(--teal)' }],
        markers: [
          { x: 0, y: VA, label: 'A', dx: 6, dy: -8 },
          { x: d, y: VB, label: 'B', dx: -18, dy: -8 }
        ]
      },
      cierre: 'El campo entre las placas es ' + N.format(campo, 3) + ' V/m; al mover ' + N.format(q * 1e6, 3) + ' µC, la energía cambia ' + N.format(deltaU, 3) + ' J y el campo realiza ' + N.format(trabajo, 3) + ' J.'
    };
  }

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'placas',
    nombre: 'Placas paralelas',
    grupo: 'Campo y potencial',
    resumen: 'Campo uniforme, diferencia de potencial, energía y trabajo entre dos placas paralelas.',
    campos: campos(),
    validar: validar,
    resolver: resolver
  });
})(window);
