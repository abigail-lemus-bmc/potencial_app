/* ═══════════════════════════════════════════════════════════════════
   num.js — Números, constantes y formato
   Sin DOM. Todo el proyecto formatea por aquí para que las cifras se
   lean igual en pantalla, en el PDF y en el CSV.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var K = 8.9875517923e9;       // constante de Coulomb exacta (N·m²/C²)
  var EPS0 = 8.8541878128e-12;  // permitividad del vacío (C²/(N·m²))
  var K_REF = 8.99e9;           // valor de libro, el que usa la guía

  var SUP = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': ''
  };

  function superscript(text) {
    return String(text).split('').map(function (c) {
      return SUP[c] !== undefined ? SUP[c] : c;
    }).join('');
  }

  /* ── lectura ──────────────────────────────────────────────────── */

  function normalize(text) {
    var s = String(text == null ? '' : text).trim();
    if (!s) return '';
    s = s.replace(/\u2212/g, '-').replace(/\u00a0/g, ' ');
    // Superíndices escritos a mano: 10⁵, 10⁻⁶
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, function (block) {
      return block.replace(/⁻/g, '-').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function (c) {
        var map = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
        return map[c];
      });
    });
    // Notación copiada de una calculadora o de otro visor: "4.5 × 10^-6"
    var sci = s.match(/^([+-]?\d+(?:[.,]\d+)?)\s*[x×*]\s*10\s*\^?\s*([+-]?\d+)$/i);
    if (sci) {
      return String(parseFloat(sci[1].replace(',', '.')) * Math.pow(10, parseInt(sci[2], 10)));
    }
    // Coma decimal (0,12) frente a coma de millares (1,234.5)
    if (s.indexOf(',') !== -1) {
      s = s.indexOf('.') !== -1 ? s.replace(/,/g, '') : s.replace(',', '.');
    }
    return s.replace(/\s+/g, '');
  }

  function parseNumber(text) {
    var s = normalize(text);
    if (!s) return NaN;
    if (!/^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(s)) return NaN;
    return parseFloat(s);
  }

  /* ── formato ──────────────────────────────────────────────────── */

  function parts(value, digits) {
    var sig = digits || 3;
    if (value === null || value === undefined || !isFinite(value)) {
      return { html: '—', plain: '—', mantissa: '—', exp: 0 };
    }
    if (value === 0) {
      return { html: '0', plain: '0', mantissa: '0', exp: 0 };
    }
    var abs = Math.abs(value);
    var exp = Math.floor(Math.log10(abs));

    // La guía escribe con potencia de diez a partir de 10⁴ y por debajo de 10⁻².
    if (exp >= 4 || exp <= -3) {
      var mant = parseFloat((value / Math.pow(10, exp)).toFixed(sig - 1));
      if (Math.abs(mant) >= 10) {
        mant = parseFloat((value / Math.pow(10, exp + 1)).toFixed(sig - 1));
        exp += 1;
      }
      var text = mant.toFixed(sig - 1);
      return {
        html: text + '\u00A0×\u00A010<sup>' + exp + '</sup>',
        plain: text + 'e' + exp,
        mantissa: text,
        exp: exp
      };
    }
    var fixed = parseFloat(value.toPrecision(sig)).toString();
    return { html: fixed, plain: fixed, mantissa: fixed, exp: 0 };
  }

  function format(value, digits) { return parts(value, digits).html; }
  function formatPlain(value, digits) { return parts(value, digits).plain; }

  // Notación científica forzada: la guía la usa también en el rango 10³
  // (el dipolo escribe 7.27 × 10³ V y no 7270 V).
  function sciParts(value, digits) {
    var sig = digits || 3;
    if (!isFinite(value) || value === 0) return parts(value, sig);
    var exp = Math.floor(Math.log10(Math.abs(value)));
    var mant = parseFloat((value / Math.pow(10, exp)).toFixed(sig - 1));
    if (Math.abs(mant) >= 10) {
      mant = parseFloat((mant / 10).toFixed(sig - 1));
      exp += 1;
    }
    return { mantissa: mant.toFixed(sig - 1), plain: mant.toFixed(sig - 1) + 'e' + exp, exp: exp };
  }

  function sci(value, digits) {
    var p = sciParts(value, digits);
    return p.mantissa + '\u00A0×\u00A010<sup>' + p.exp + '</sup>';
  }

  function sciTexto(value, digits) {
    var p = sciParts(value, digits);
    return p.mantissa + ' × 10' + superscript(String(p.exp));
  }

  // Texto sin etiquetas, con superíndices reales: "2.47 × 10⁵".
  function texto(value, digits) {
    var p = parts(value, digits);
    if (p.exp) return p.mantissa + ' × 10' + superscript(String(p.exp));
    return p.plain;
  }

  // Cifras significativas explícitas, útil para los pasos intermedios.
  function sig(value, n) {
    if (!isFinite(value)) return '—';
    if (value === 0) return '0';
    var exp = Math.floor(Math.log10(Math.abs(value)));
    var mant = value / Math.pow(10, exp);
    var rounded = parseFloat(mant.toFixed(n - 1));
    if (Math.abs(rounded) >= 10) { rounded /= 10; exp += 1; }
    return rounded + ' × 10' + superscript(String(exp));
  }

  // Para las líneas de cálculo: seis decimales útiles, sin ceros de relleno.
  function calc(value) {
    if (!isFinite(value)) return '—';
    var abs = Math.abs(value);
    if (abs !== 0 && (abs < 1e-4 || abs >= 1e6)) return formatPlain(value, 6);
    var s = parseFloat(value.toPrecision(6)).toString();
    return s;
  }

  global.Num = {
    K: K, EPS0: EPS0, K_REF: K_REF,
    normalize: normalize,
    parseNumber: parseNumber,
    parts: parts,
    format: format,
    formatPlain: formatPlain,
    texto: texto,
    sci: sci,
    sciTexto: sciTexto,
    sciParts: sciParts,
    sig: sig,
    calc: calc,
    superscript: superscript
  };
})(typeof window !== 'undefined' ? window : globalThis);
