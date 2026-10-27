/* ═══════════════════════════════════════════════════════════════════
   math.js — Piezas de notación matemática en HTML
   No es un motor de LaTeX. Son cuatro piezas (fracción, raíz, potencia,
   subíndice) que cubren todo lo que aparece en las guías, y se ven
   nítidas a cualquier tamaño porque son texto y CSS, no imágenes.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num;

  // fracción apilada con raya real
  function frac(num, den) {
    return '<span class="frac"><span class="frac__num">' + num +
      '</span><span class="frac__den">' + den + '</span></span>';
  }

  // raíz con vínculo encima del radicando
  function sqrt(inner) {
    return '<span class="sqrt"><span class="sqrt__sign">√</span>' +
      '<span class="sqrt__arg">' + inner + '</span></span>';
  }

  function sup(text) { return '<sup>' + text + '</sup>'; }
  function sub(text) { return '<sub>' + text + '</sub>'; }

  // "4.50 × 10^4" ya formateado con superíndice real
  function num(value, digits) { return N.format(value, digits); }

  // Variables con cursiva editorial, sin depender de fuentes matemáticas
  function v(name) { return '<i class="var">' + name + '</i>'; }

  // Une piezas con espacios finos: v('V') + ' = ' + ...
  function join() {
    return Array.prototype.slice.call(arguments).join('');
  }

  // Valor con su unidad, en formato de resultado
  function measure(value, unit, digits) {
    return N.format(value, digits) + (unit ? ' ' + unit : '');
  }

  global.M = {
    frac: frac,
    sqrt: sqrt,
    sup: sup,
    sub: sub,
    num: num,
    v: v,
    join: join,
    measure: measure
  };
})(typeof window !== 'undefined' ? window : globalThis);
