/* ═══════════════════════════════════════════════════════════════════
   shot.js — Revisión visual sin dependencias
   Arranca Chrome por CDP, escribe datos de ejemplo en el formulario,
   captura la pantalla y devuelve los errores de consola.
   Uso:  node tools/shot.js [ancho] [alto] [problema] [salida.png]
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PUERTO = 9333;

const ancho = parseInt(process.argv[2] || '390', 10);
const alto = parseInt(process.argv[3] || '844', 10);
const problema = process.argv[4] || 'anillo';
const salida = process.argv[5] || path.join(__dirname, 'captura.png');

const DATOS = {
  puntual: { q: '4.00', r: '0.500' },
  superposicion: { q1: '3.00', q2: '-2.00', d: '0.400' },
  anillo: { R: '0.150', Q: '8.00', x: '0.250' },
  arco: { R: '0.200', Q: '8.00' },
  varillaEje: { L: '0.600', Q: '6.00', d: '0.400' },
  varillaMediatriz: { L: '0.500', Q: '4.00', d: '0.300' },
  disco: { R: '0.120', Q: '6.00', x: '0.080' },
  dipolo: { q: '2.00', a: '0.050', x: '0.500' },
  diferencia: { q: '5.00', rA: '0.200', rB: '0.500' },
  energia: { q1: '4.00', q2: '-3.00', q3: '5.00', L: '0.300' },
  trabajo: { q1: '4.00', q2: '-2.00', q3: '3.00', q0: '1.50', a: '0.300', b: '0.400' },
  linea: { lambda: '6.00', r: '0.400', r0: '1.000' },
  esfera: { R: '0.250', Q: '10.0', r: '0.500' },
  corteza: { R: '0.300', Q: '12.0', r: '0.500' },
  placas: { d: '0.050', VA: '600', VB: '0', q: '2.50' },
  gradiente: { x0: '1', y0: '2' },
  equipotenciales: { V0: '14', x0: '1.5', y0: '1' }
};

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const perfil = path.join(require('os').tmpdir(), 'shot-perfil-' + Date.now());
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=' + PUERTO,
    '--user-data-dir=' + perfil,
    '--no-first-run',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    'about:blank'
  ], { stdio: 'ignore' });

  let ws;
  try {
    let version;
    for (let i = 0; i < 40; i++) {
      try {
        version = await (await fetch(`http://127.0.0.1:${PUERTO}/json/version`)).json();
        break;
      } catch (e) { await dormir(150); }
    }
    if (!version) throw new Error('Chrome no respondió en el puerto ' + PUERTO);

    ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let id = 0;
    const pendientes = new Map();
    const errores = [];

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pendientes.has(msg.id)) {
        const { res, rej } = pendientes.get(msg.id);
        pendientes.delete(msg.id);
        msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        errores.push(msg.params.args.map((a) => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        const d = msg.params.exceptionDetails;
        errores.push((d.exception && d.exception.description) || d.text);
      }
    };

    const enviar = (method, params, sessionId) => new Promise((res, rej) => {
      const mid = ++id;
      pendientes.set(mid, { res, rej });
      ws.send(JSON.stringify({ id: mid, method, params: params || {}, sessionId }));
    });

    const { targetId } = await enviar('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await enviar('Target.attachToTarget', { targetId, flatten: true });

    await enviar('Page.enable', {}, sessionId);
    await enviar('Runtime.enable', {}, sessionId);
    await enviar('Emulation.setDeviceMetricsOverride', {
      width: ancho, height: alto, deviceScaleFactor: 2, mobile: true
    }, sessionId);

    const url = process.env.URL
      ? 'file:///' + process.env.URL.replace(/\\/g, '/')
      : 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');
    await enviar('Page.navigate', { url }, sessionId);
    await dormir(1200);

    const guion = `
      (function () {
        var chip = document.querySelector('.chip[data-id="${problema}"]');
        if (chip) chip.click();
        var datos = ${process.env.EMPTY ? '{}' : JSON.stringify(DATOS[problema] || {})};
        Object.keys(datos).forEach(function (k) {
          var el = document.getElementById('f-' + k);
          if (!el) return;
          el.value = datos[k];
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        return document.body.scrollHeight;
      })()`;

    await enviar('Runtime.evaluate', { expression: guion, returnByValue: true }, sessionId);
    await dormir(900);

    // Modo hoja de importación: se abre el panel y se analiza un enunciado.
    if (process.env.SHEET) {
      await enviar('Runtime.evaluate', {
        expression: `(function(){
          document.getElementById('btn-importar').click();
          var t = document.getElementById('hoja-texto');
          t.value = ${JSON.stringify(process.env.SHEET === '1' ? 'Un anillo de radio 15 cm tiene una carga total de 8.00 µC distribuida uniformemente. Determine el potencial en un punto sobre el eje a 25 cm del centro.' : process.env.SHEET)};
          document.getElementById('btn-analizar').click();
          return true;
        })()`, returnByValue: true
      }, sessionId);
      await dormir(600);
    }

    const alto2 = process.env.SHEET ? alto : (await enviar('Runtime.evaluate', {
      expression: 'document.body.scrollHeight', returnByValue: true
    }, sessionId)).result.value;

    const altoFinal = Math.min(Math.max(alto2, alto), 4000);
    await enviar('Emulation.setDeviceMetricsOverride', {
      width: ancho, height: altoFinal, deviceScaleFactor: 2, mobile: true
    }, sessionId);
    await dormir(500);

    const shot = await enviar('Page.captureScreenshot', { format: 'png' }, sessionId);
    fs.writeFileSync(salida, Buffer.from(shot.data, 'base64'));

    // Recorte del esquema, para revisar las etiquetas de cerca.
    if (process.env.SOLO === 'esquema') {
      const caja = (await enviar('Runtime.evaluate', {
        expression: `(function(){
          var s = document.getElementById('esquema');
          if (!s) return null;
          var r = s.getBoundingClientRect();
          return { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height };
        })()`, returnByValue: true
      }, sessionId)).result.value;
      if (caja) {
        const cerca = await enviar('Page.captureScreenshot', {
          format: 'png',
          clip: { x: caja.x, y: caja.y, width: caja.width, height: caja.height, scale: 3 }
        }, sessionId);
        fs.writeFileSync(salida.replace(/\.png$/, '-esquema.png'), Buffer.from(cerca.data, 'base64'));
      }
    }

    if (process.env.EXPORT) {
      const res = await enviar('Runtime.evaluate', {
        expression: `(function(){
          if (!window.__exportarFigura) return 'sin-hook';
          return window.__exportarFigura().then(function (c) { return c.toDataURL('image/png'); });
        })()`,
        returnByValue: true,
        awaitPromise: true
      }, sessionId);

      const datos = String(res.result.value).replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(salida.replace(/\.png$/, '-export.png'), Buffer.from(datos, 'base64'));
    }

    if (process.env.DUMP) {
      const dump = await enviar('Runtime.evaluate', {
        expression: `JSON.stringify({
          ticks: Array.from(document.querySelectorAll('.p-tick')).map(t => t.textContent),
          labels: Array.from(document.querySelectorAll('.p-label')).map(t => t.textContent),
          resultados: Array.from(document.querySelectorAll('.inciso__res-val')).map(t => t.textContent),
          codigos: (function () {
            var t = document.querySelector('.p-tick');
            return t ? Array.from(t.textContent).map(function (c) { return c.charCodeAt(0); }) : null;
          })(),
          rect: (function () {
            var s = document.getElementById('esquema');
            if (!s) return null;
            var r = s.getBoundingClientRect();
            return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height };
          })(),
          estado: (document.getElementById('estado') || {}).textContent
        })`, returnByValue: true
      }, sessionId);
      console.log(dump.result.value);
    }

    console.log('Captura: ' + salida + ' (' + ancho + '×' + altoFinal + ')');
    if (errores.length) {
      console.log('Errores de consola:');
      errores.forEach((e) => console.log('  · ' + e));
      process.exitCode = 1;
    } else {
      console.log('Sin errores de consola.');
    }
  } finally {
    if (ws) ws.close();
    chrome.kill();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
