/* ═══════════════════════════════════════════════════════════════════
   import.js — Entrada de enunciados (texto, foto, voz)
   El parser de texto ya funciona. La foto pasa por una interfaz de OCR
   que queda declarada aquí: cuando se instale el motor, devuelve texto
   y el resto del flujo es idéntico.
   Nunca rellena a ciegas: siempre propone y el usuario confirma.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num;

  // ── motor de OCR (interfaz, aún sin implementación) ─────────────
  var OcrEngine = global.OcrEngine || {
    disponible: false,
    idioma: 'spa',
    reconocer: function (/* file */) {
      return Promise.reject(new Error('El motor de OCR todavía no está instalado en esta versión.'));
    }
  };
  global.OcrEngine = OcrEngine;

  var UNIDADES = [
    { re: 'µC/m|uC/m|μC/m', dim: 'lambda', factor: 1e-6 },
    { re: 'µC|uC|μC|mc|mC|nC|C', dim: 'carga', factor: null },
    { re: 'km|cm|mm|m', dim: 'longitud', factor: null }
  ];

  function factorDe(texto) {
    var t = texto.replace(/\s/g, '');
    if (t === 'µC' || t === 'uC' || t === 'μC') return 1e-6;
    if (t === 'mC') return 1e-3;
    if (t === 'nC') return 1e-9;
    if (t === 'C') return 1;
    if (t === 'km') return 1e3;
    if (t === 'cm') return 1e-2;
    if (t === 'mm') return 1e-3;
    if (t === 'm') return 1;
    return null;
  }

  function dimensionDe(texto) {
    var t = texto.replace(/\s/g, '');
    if (/C\/m$/.test(t)) return 'lambda';
    if (/C$/.test(t)) return 'carga';
    if (/m$/.test(t)) return 'longitud';
    return null;
  }

  // Saca del texto todos los pares número + unidad.
  function extraer(texto) {
    var out = [];
    var re = /([+-]?\d+(?:[.,]\d+)?)\s*(µC\/m|uC\/m|μC\/m|µC|uC|μC|mC|nC|km|cm|mm|C|m)\b/g;
    var m;
    while ((m = re.exec(texto)) !== null) {
      var valor = parseFloat(m[1].replace(',', '.'));
      var unidad = m[2];
      out.push({
        numero: isNaN(valor) ? null : valor,
        unidad: unidad,
        factor: factorDe(unidad),
        dim: dimensionDe(unidad),
        pos: m.index
      });
    }
    return out;
  }

  // Busca "q1 = 4.00" o "R: 15 cm" cerca del símbolo.
  function porSimbolo(texto, campo, candidatos) {
    var simbolos = [campo.symbol, campo.id, campo.symbol.replace('₁', '1').replace('₂', '2')];
    for (var i = 0; i < simbolos.length; i++) {
      var s = simbolos[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = new RegExp('(^|[^a-záéíóúñ])' + s + '\\s*[=:]\\s*([+-]?\\d+(?:[.,]\\d+)?)\\s*([µuμm]?[Ccmk]?[mC]?)', 'i');
      var m = texto.match(re);
      if (m) {
        var valor = parseFloat(m[2].replace(',', '.'));
        if (isNaN(valor)) continue;
        var unid = (m[3] || '').trim();
        var factor = unid ? factorDe(unid) : null;
        // Si no hay unidad explícita, se toma la del propio campo.
        if (factor === null) factor = campo.scale;
        return { numero: valor, factor: factor, por: 'símbolo' };
      }
    }
    return null;
  }

  function interpretar(texto, campos) {
    var candidatos = extraer(texto);
    var usados = {};
    var resultado = {};

    // Primera pasada: por símbolo.
    campos.forEach(function (campo) {
      var hit = porSimbolo(texto, campo, candidatos);
      if (hit) {
        resultado[campo.id] = {
          valor: hit.numero * hit.factor / campo.scale,
          como: hit.por
        };
      }
    });

    // Segunda pasada: por dimensión y orden de aparición.
    campos.forEach(function (campo) {
      if (resultado[campo.id]) return;
      var dim = dimensionDeCampo(campo);
      if (!dim) return;
      for (var i = 0; i < candidatos.length; i++) {
        var c = candidatos[i];
        if (usados[i]) continue;
        if (c.dim === dim && c.factor) {
          usados[i] = true;
          resultado[campo.id] = {
            valor: c.numero * c.factor / campo.scale,
            como: 'posición'
          };
          return;
        }
      }
    });

    return { valores: resultado, restantes: candidatos.length };
  }

  function dimensionDeCampo(campo) {
    if (campo.unit === 'µC/m') return 'lambda';
    if (campo.unit === 'µC') return 'carga';
    if (campo.unit === 'm') return 'longitud';
    return null;
  }

  function textoDesdeVoz(cb) {
    var Ctor = global.SpeechRecognition || global.webkitSpeechRecognition;
    if (!Ctor) return cb(new Error('El dictado por voz no está disponible en este navegador.'));
    var rec = new Ctor();
    rec.lang = 'es-ES';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = function (ev) {
      cb(null, ev.results[0][0].transcript);
    };
    rec.onerror = function () {
      cb(new Error('No se pudo escuchar. Revisa el permiso del micrófono.'));
    };
    rec.start();
  }

  global.Importar = {
    interpretar: interpretar,
    extraer: extraer,
    voz: textoDesdeVoz,
    ocr: OcrEngine
  };
})(window);
