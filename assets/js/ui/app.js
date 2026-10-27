/* ═══════════════════════════════════════════════════════════════════
   app.js — Interfaz
   Una sola pantalla que se rellena con la familia de problema elegida.
   Añadir un problema no requiere tocar este archivo.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var N = global.Num, V = global.Validate, Plot = global.Plot;

  var problemas = global.Problemas || [];
  var actual = null;
  var memoria = {};   // texto crudo por problema
  var timer = null;
  var resizeTimer = null;
  var ultima = null;
  var ultimosValores = null;
  var esquemaSvg = null;
  var esquemaDatos = null;
  var tocados = {};

  var els = {};

  function $(id) { return document.getElementById(id); }

  function iniciar() {
    els.tabs = $('tabs');
    els.titulo = $('titulo');
    els.resumen = $('resumen');
    els.campos = $('campos');
    els.estado = $('estado');
    els.salida = $('salida');

    if (!problemas.length) {
      els.estado.textContent = 'No se cargó ninguna familia de problema.';
      return;
    }

    pintarPestanas();
    elegir(problemas[0].id);
    conectarHoja();

    // La gráfica se redibuja al girar el teléfono o cambiar el ancho,
    // porque se dibuja a escala 1:1 con los píxeles reales.
    global.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var svg = $('lienzo');
        if (svg && ultima && ultima.grafica) Plot.render(svg, ultima.grafica);
        if (esquemaSvg && global.Esquemas && global.Esquemas[actual.id] && esquemaDatos) {
          Diagram.render(esquemaSvg, global.Esquemas[actual.id], esquemaDatos);
        }
      }, 180);
    });
  }

  function pintarPestanas() {
    var grupos = {};
    problemas.forEach(function (p) {
      (grupos[p.grupo] = grupos[p.grupo] || []).push(p);
    });

    els.tabs.innerHTML = '';
    Object.keys(grupos).forEach(function (nombre) {
      var fila = document.createElement('div');
      fila.className = 'tabs__fila';
      var rotulo = document.createElement('span');
      rotulo.className = 'tabs__grupo';
      rotulo.textContent = nombre;
      fila.appendChild(rotulo);

      grupos[nombre].forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.dataset.id = p.id;
        b.textContent = p.nombre;
        b.addEventListener('click', function () { elegir(p.id); });
        fila.appendChild(b);
      });
      els.tabs.appendChild(fila);
    });
  }

  function elegir(id) {
    actual = problemas.filter(function (p) { return p.id === id; })[0];
    if (!actual) return;

    Array.prototype.forEach.call(els.tabs.querySelectorAll('.chip'), function (b) {
      b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false');
    });

    // La fila de problemas se desplaza en horizontal: centrar el elegido
    // sin mover la página.
    var activo = els.tabs.querySelector('.chip[aria-pressed="true"]');
    if (activo && activo.parentNode) {
      var fila = activo.parentNode;
      var r = activo.getBoundingClientRect();
      var f = fila.getBoundingClientRect();
      if (fila.scrollWidth > fila.clientWidth) {
        fila.scrollLeft += (r.left - f.left) - (f.width - r.width) / 2;
      }
    }

    els.titulo.textContent = actual.nombre;
    els.resumen.textContent = actual.resumen;
    document.title = actual.nombre + ' · Potencial eléctrico';
    pintarCampos();
    calcular();
  }

  function pintarCampos() {
    var guardado = memoria[actual.id] || {};
    els.campos.innerHTML = '';

    actual.campos.forEach(function (campo) {
      var wrap = document.createElement('div');
      wrap.className = 'field';
      wrap.dataset.id = campo.id;

      var label = document.createElement('label');
      label.className = 'field__label';
      label.htmlFor = 'f-' + campo.id;
      label.innerHTML = '<span class="field__sym">' + campo.symbol + '</span>' +
        '<span class="field__name">' + campo.label + '</span>';
      wrap.appendChild(label);

      var box = document.createElement('div');
      box.className = 'field__box';

      var input = document.createElement('input');
      input.id = 'f-' + campo.id;
      input.type = 'text';
      input.inputMode = 'decimal';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.placeholder = '';
      input.value = guardado[campo.id] || '';
      input.addEventListener('input', function () {
        tocados[campo.id] = true;
        esperar();
      });
      box.appendChild(input);

      var unit = document.createElement('span');
      unit.className = 'field__unit';
      unit.textContent = campo.unit;
      box.appendChild(unit);

      wrap.appendChild(box);

      if (campo.help) {
        var help = document.createElement('p');
        help.className = 'field__help';
        help.textContent = campo.help;
        wrap.appendChild(help);
      }

      var err = document.createElement('p');
      err.className = 'field__error';
      err.id = 'e-' + campo.id;
      wrap.appendChild(err);

      els.campos.appendChild(wrap);
    });
  }

  function leer() {
    var raw = {};
    actual.campos.forEach(function (campo) {
      var input = $('f-' + campo.id);
      raw[campo.id] = input ? input.value : '';
    });
    return raw;
  }

  function esperar() {
    clearTimeout(timer);
    timer = setTimeout(calcular, 240);
  }

  function calcular() {
    var raw = leer();
    memoria[actual.id] = raw;

    var base = V.check(actual.campos, raw);
    var errors = base.errors;
    var warnings = base.warnings;
    var values = base.values;

    if (base.valid) {
      var extra = actual.validar ? actual.validar(values) : { errors: {}, warnings: {} };
      Object.keys(extra.errors || {}).forEach(function (k) { errors[k] = extra.errors[k]; });
      Object.keys(extra.warnings || {}).forEach(function (k) { warnings[k] = extra.warnings[k]; });
    }

    marcar(errors, warnings, raw);

    var validos = Object.keys(errors).length === 0;
    if (!validos) {
      var vacios = actual.campos.every(function (c) { return !N.normalize(raw[c.id]); });
      els.estado.hidden = vacios;
      if (!vacios) {
        var n = Object.keys(errors).length;
        els.estado.textContent = n === 1
          ? 'Hay un dato por corregir.'
          : 'Hay ' + n + ' datos por corregir.';
      }
      els.salida.innerHTML = vacios
        ? '<p class="vacio">Ingresa los datos del enunciado para ver el procedimiento, el resultado y la gráfica.</p>'
        : '';
      return;
    }

    els.estado.hidden = true;
    var salida = actual.resolver(values);
    pintar(salida, values);
  }

  function marcar(errors, warnings, raw) {
    actual.campos.forEach(function (campo) {
      var wrap = els.campos.querySelector('[data-id="' + campo.id + '"]');
      if (!wrap) return;
      var input = wrap.querySelector('input');
      var err = wrap.querySelector('.field__error');
      // Mientras el campo esté intacto no se le señala nada al usuario.
      var escribio = tocados[campo.id] || N.normalize(raw[campo.id] || '') !== '';
      var aviso = escribio ? (errors[campo.id] || warnings[campo.id] || '') : '';
      err.textContent = aviso;
      wrap.classList.toggle('field--error', !!errors[campo.id] && escribio);
      wrap.classList.toggle('field--warn', escribio && !errors[campo.id] && !!warnings[campo.id]);
      input.setAttribute('aria-invalid', errors[campo.id] && escribio ? 'true' : 'false');
    });
  }

  function pintar(salida, valores) {
    Diagram.detener(esquemaSvg);
    esquemaSvg = null;
    esquemaDatos = null;

    ultima = salida;
    ultimosValores = valores;
    els.salida.innerHTML = '';

    var esquema = bloqueEsquema(valores);
    if (esquema) els.salida.appendChild(esquema);

    els.salida.appendChild(bloqueDatos(actual, salida));
    els.salida.appendChild(bloqueIncisos(salida));
    els.salida.appendChild(bloqueGrafica(salida));

    if (salida.cierre) {
      var p = document.createElement('p');
      p.className = 'cierre';
      p.innerHTML = salida.cierre;
      els.salida.appendChild(p);
    }

    els.salida.appendChild(bloqueExportar(salida));
  }

  var ANIMADOS = { anillo: true, arco: true, disco: true, varillaEje: true, varillaMediatriz: true };

  function bloqueEsquema(valores) {
    var dibujar = global.Esquemas && global.Esquemas[actual.id];
    if (!dibujar) return null;

    var sec = document.createElement('section');
    sec.className = 'tarjeta';
    sec.innerHTML = '<h2 class="tarjeta__titulo">Esquema</h2>' +
      '<div class="esquema"><svg id="esquema" aria-label="Esquema del problema"></svg></div>' +
      '<p class="plot__pie" id="esquema-pie"></p>';

    setTimeout(function () {
      var svg = $('esquema');
      if (!svg) return;
      esquemaSvg = svg;

      // Los esquemas rotulan con lo que escribió el estudiante, no con el
      // valor ya convertido.
      var conTexto = {};
      Object.keys(valores).forEach(function (k) { conTexto[k] = valores[k]; });
      conTexto.__raw = memoria[actual.id] || {};

      var api = Diagram.render(svg, dibujar, conTexto);
      esquemaDatos = conTexto;

      var pie = $('esquema-pie');
      if (pie && api && api.pie) {
        pie.textContent = api.pie + (ANIMADOS[actual.id]
          ? ' El punto amarillo recorre la distribución.'
          : '');
      }
    }, 0);

    return sec;
  }

  function subtitulo() {
    var raw = memoria[actual.id] || {};
    return actual.campos.map(function (c) {
      return c.symbol + ' = ' + (raw[c.id] || '—') + ' ' + c.unit;
    }).join('   ·   ');
  }

  function generarFigura(salida) {
    return global.Exportar.figura({
      etiqueta: 'FÍSICA II · ' + actual.grupo,
      titulo: actual.nombre,
      subtitulo: subtitulo(),
      esquema: esquemaSvg,
      grafica: $('lienzo'),
      resultado: salida.principal || '',
      pie: ($('esquema-pie') || {}).textContent || ''
    });
  }

  function bloqueExportar(salida) {
    var sec = document.createElement('section');
    sec.className = 'tarjeta tarjeta--exportar';
    sec.innerHTML = '<h2 class="tarjeta__titulo">Exportar</h2>' +
      '<p class="plot__pie">Esquema y gráfica en una sola imagen, lista para el informe.</p>' +
      '<button type="button" class="boton boton--lleno" id="btn-png">Descargar PNG</button>' +
      '<p class="exportar__estado" id="estado-png" role="status"></p>';

    sec.querySelector('#btn-png').addEventListener('click', function () {
      var estado = sec.querySelector('#estado-png');
      estado.textContent = 'Generando la imagen…';

      generarFigura(salida).then(function (canvas) {
        return global.Exportar.descargar(canvas, 'potencial-' + actual.id + '.png');
      }).then(function () {
        estado.textContent = 'Imagen descargada.';
        setTimeout(function () { estado.textContent = ''; }, 2600);
      }).catch(function (e) {
        estado.textContent = e.message;
      });
    });

    // Para las pruebas automatizadas.
    global.__exportarFigura = function () { return generarFigura(salida); };

    return sec;
  }

  function bloqueDatos(problema, salida) {
    var sec = document.createElement('section');
    sec.className = 'tarjeta';
    sec.innerHTML = '<h2 class="tarjeta__titulo">Datos</h2>';

    var tabla = document.createElement('table');
    tabla.className = 'datos';
    var thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Magnitud</th><th>Valor</th><th>En SI</th></tr>';
    tabla.appendChild(thead);

    var tbody = document.createElement('tbody');
    (salida.datos || []).forEach(function (d) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td class="datos__sym">' + d.sym + '</td>' +
        '<td class="datos__val">' + d.value + '</td>' +
        '<td class="datos__si">' + (d.conv || '—') + '</td>';
      tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);
    sec.appendChild(tabla);
    return sec;
  }

  function bloqueIncisos(salida) {
    var sec = document.createElement('section');
    sec.className = 'tarjeta';
    sec.innerHTML = '<h2 class="tarjeta__titulo">Procedimiento</h2>';

    var lista = document.createElement('div');
    lista.className = 'incisos';

    (salida.incisos || []).forEach(function (inc) {
      var art = document.createElement('article');
      art.className = 'inciso';

      var head = document.createElement('h3');
      head.className = 'inciso__titulo';
      head.innerHTML = '<span class="inciso__letra">' + inc.letra + '</span>' + inc.titulo;
      art.appendChild(head);

      (inc.bloques || []).forEach(function (b) {
        art.appendChild(bloque(b));
      });

      if (inc.resultado) {
        var res = document.createElement('p');
        res.className = 'inciso__resultado';
        res.innerHTML = '<span class="inciso__res-label">' + inc.resultado.label + '</span>' +
          '<span class="inciso__res-val">' + inc.resultado.html + '</span>';
        art.appendChild(res);
      }
      lista.appendChild(art);
    });

    sec.appendChild(lista);
    return sec;
  }

  function bloque(b) {
    var node = document.createElement('div');
    if (b.t === 'text') { node.className = 'p'; node.innerHTML = b.html; }
    else if (b.t === 'eq') { node.className = 'eq'; node.innerHTML = '<span class="eq__line">' + b.html + '</span>'; }
    else if (b.t === 'calc') { node.className = 'calc'; node.innerHTML = '<span class="calc__line">' + b.html + '</span>'; }
    else { node.className = 'nota'; node.innerHTML = b.html; }
    return node;
  }

  function bloqueGrafica(salida) {
    var sec = document.createElement('section');
    sec.className = 'tarjeta';
    sec.innerHTML = '<h2 class="tarjeta__titulo">Gráfica</h2>' +
      '<div class="plot"><svg id="lienzo" aria-label="Gráfica del potencial"></svg>' +
      '<p class="plot__readout" hidden></p></div>' +
      '<div class="plot__leyenda"></div>' +
      '<p class="plot__pie"></p>';

    var conEtiqueta = ((salida.grafica || {}).series || []).filter(function (s) { return s.label; });
    var leyenda = sec.querySelector('.plot__leyenda');
    if (conEtiqueta.length > 1) {
      conEtiqueta.forEach(function (s) {
        var item = document.createElement('span');
        item.className = 'plot__leyenda-item';
        item.innerHTML = '<i style="border-color:' + (s.color || 'var(--teal)') +
          ';' + (s.dash ? 'border-top-style:dashed;' : '') + '"></i>' + s.label;
        leyenda.appendChild(item);
      });
    } else {
      leyenda.remove();
    }

    var pie = sec.querySelector('.plot__pie');
    pie.textContent = 'Arrastra el dedo sobre la curva para leer los valores.';

    // Se dibuja después de insertar el SVG en el documento.
    setTimeout(function () {
      var svg = $('lienzo');
      if (!svg || !salida.grafica) return;
      Plot.render(svg, salida.grafica);
    }, 0);

    return sec;
  }

  /* ── hoja de importación ──────────────────────────────────────── */

  function conectarHoja() {
    var hoja = $('hoja');
    var btn = $('btn-importar');
    if (!hoja || !btn) return;

    btn.addEventListener('click', function () {
      hoja.hidden = false;
      $('hoja-texto').focus();
    });

    Array.prototype.forEach.call(hoja.querySelectorAll('[data-cerrar]'), function (b) {
      b.addEventListener('click', function () { hoja.hidden = true; });
    });

    hoja.addEventListener('click', function (e) {
      if (e.target === hoja) hoja.hidden = true;
    });

    $('btn-analizar').addEventListener('click', analizarTexto);

    $('btn-voz').addEventListener('click', function () {
      var estado = $('hoja-estado');
      estado.textContent = 'Escuchando…';
      global.Importar.voz(function (err, texto) {
        if (err) { estado.textContent = err.message; return; }
        $('hoja-texto').value = texto;
        analizarTexto();
      });
    });

    $('foto').addEventListener('change', function (ev) {
      var file = ev.target.files && ev.target.files[0];
      if (!file) return;
      var estado = $('hoja-estado');
      var vista = $('foto-vista');
      vista.src = URL.createObjectURL(file);
      vista.hidden = false;

      if (!global.OcrEngine.disponible) {
        estado.textContent = 'Espacio reservado para el OCR: la imagen quedó cargada. Mientras tanto, escribe o pega el enunciado en la pestaña de texto.';
        return;
      }
      estado.textContent = 'Leyendo la imagen…';
      global.OcrEngine.reconocer(file).then(function (texto) {
        $('hoja-texto').value = texto;
        analizarTexto();
      }).catch(function (e) {
        estado.textContent = e.message;
      });
    });
  }

  function analizarTexto() {
    var texto = $('hoja-texto').value || '';
    var estado = $('hoja-estado');
    var panel = $('hoja-resultado');

    var r = global.Importar.interpretar(texto, actual.campos);
    var ids = Object.keys(r.valores);

    if (!ids.length) {
      estado.textContent = 'No se reconoció ningún valor con unidad. Escribe algo como «R = 0.12 m, Q = 6 µC».';
      panel.innerHTML = '';
      return;
    }

    estado.textContent = 'Revisa lo detectado antes de aplicarlo.';
    panel.innerHTML = '';

    actual.campos.forEach(function (campo) {
      var valor = r.valores[campo.id];
      var fila = document.createElement('div');
      fila.className = 'detectado' + (valor ? '' : ' detectado--falta');
      fila.innerHTML = '<span class="detectado__sym">' + campo.symbol + '</span>' +
        '<span class="detectado__val">' + (valor ? N.format(valor.valor, 4) + ' ' + campo.unit : 'sin detectar') + '</span>';
      panel.appendChild(fila);
    });

    var aplicar = document.createElement('button');
    aplicar.type = 'button';
    aplicar.className = 'boton boton--lleno';
    aplicar.textContent = 'Aplicar a los campos';
    aplicar.addEventListener('click', function () {
      actual.campos.forEach(function (campo) {
        var valor = r.valores[campo.id];
        if (!valor) return;
        var input = $('f-' + campo.id);
        if (input) input.value = String(parseFloat(valor.valor.toPrecision(8)));
      });
      $('hoja').hidden = true;
      calcular();
    });
    panel.appendChild(aplicar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})(window);
