/* ═══════════════════════════════════════════════════════════════════
   validate.js — Reglas de entrada compartidas
   Un campo se declara una vez y todas las familias de problema lo
   validan igual: vacío, no numérico, fuera de rango. Después cada
   problema añade sus reglas cruzadas (geometría, continuidad, etc.).
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num;

  var UNIT = {
    m: 'm',
    uC: 'µC',
    uC_m: 'µC/m',
    V: 'V',
    J: 'J',
    V_m: 'V/m'
  };

  // Un campo de entrada. `scale` pasa el valor a unidades del SI.
  function field(spec) {
    return {
      id: spec.id,
      label: spec.label,
      symbol: spec.symbol || spec.id,
      unit: UNIT[spec.unit] || spec.unit || '',
      scale: spec.scale === undefined ? 1 : spec.scale,
      min: spec.min,
      exclusiveMin: spec.exclusiveMin !== false,
      max: spec.max,
      help: spec.help || ''
    };
  }

  function checkFields(campos, raw) {
    var values = {};
    var errors = {};
    var warnings = {};

    campos.forEach(function (campo) {
      var text = raw[campo.id];
      var normalized = N.normalize(text);

      if (!normalized) {
        errors[campo.id] = 'Completa el dato: ' + campo.label + '.';
        return;
      }

      var value = N.parseNumber(text);
      if (isNaN(value)) {
        errors[campo.id] = 'Escribe solo el número, sin unidades.';
        return;
      }
      if (!isFinite(value)) {
        errors[campo.id] = 'El valor está fuera del rango representable.';
        return;
      }

      if (campo.min !== undefined) {
        if (campo.exclusiveMin && value <= campo.min) {
          errors[campo.id] = campo.symbol + ' debe ser mayor que ' + campo.min + '.';
          return;
        }
        if (!campo.exclusiveMin && value < campo.min) {
          errors[campo.id] = campo.symbol + ' debe ser mayor o igual que ' + campo.min + '.';
          return;
        }
      }
      if (campo.max !== undefined && value > campo.max) {
        errors[campo.id] = campo.symbol + ' no puede superar ' + campo.max + '.';
        return;
      }

      var si = value * campo.scale;
      if (!isFinite(si)) {
        errors[campo.id] = 'El valor es demasiado grande para operarlo.';
        return;
      }

      values[campo.id] = si;
      values[campo.id + '__raw'] = value;

      // Aviso, no error: valores atípicos siguen siendo válidos.
      if (Math.abs(si) >= 1 && campo.unit === 'µC') {
        warnings[campo.id] = 'Carga inusualmente grande para un ejercicio de clase. Revisa la escala.';
      }
    });

    return {
      valid: Object.keys(errors).length === 0,
      values: values,
      errors: errors,
      warnings: warnings
    };
  }

  global.Validate = {
    field: field,
    check: checkFields
  };
})(typeof window !== 'undefined' ? window : globalThis);
