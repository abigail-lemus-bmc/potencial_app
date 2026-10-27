/* ═══════════════════════════════════════════════════════════════════
   test.js — Verificación contra la guía de clase
   Cada caso reproduce un ejercicio del PDF. Si un número deja de
   coincidir con el de la docente, el test falla.
   Ejecutar:  node tools/test.js
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const raiz = path.join(__dirname, '..');

const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

function cargar(rel) {
  const src = fs.readFileSync(path.join(raiz, rel), 'utf8');
  vm.runInContext(src, sandbox, { filename: rel });
}

[
  'assets/js/core/num.js',
  'assets/js/core/math.js',
  'assets/js/core/validate.js',
  'assets/js/problems/puntual.js',
  'assets/js/problems/superposicion.js',
  'assets/js/problems/anillo.js',
  'assets/js/problems/arco.js',
  'assets/js/problems/varilla-eje.js',
  'assets/js/problems/varilla-mediatriz.js',
  'assets/js/problems/disco.js',
  'assets/js/problems/dipolo.js',
  'assets/js/problems/diferencia.js',
  'assets/js/problems/energia.js',
  'assets/js/problems/trabajo.js',
  'assets/js/problems/linea.js',
  'assets/js/problems/esfera.js',
  'assets/js/problems/corteza.js',
  'assets/js/problems/placas.js',
  'assets/js/problems/gradiente.js',
  'assets/js/problems/equipotenciales.js'
].forEach(cargar);

const N = sandbox.Num;
const problemas = sandbox.Problemas;

let fallos = 0;
let total = 0;

function ok(cond, texto) {
  total++;
  if (cond) {
    console.log('  ✓ ' + texto);
  } else {
    fallos++;
    console.log('  ✗ ' + texto);
  }
}

function cerca(a, b, tol) {
  const t = tol === undefined ? 1e-3 : tol;
  if (!isFinite(a) || !isFinite(b)) return false;
  return Math.abs(a - b) / Math.max(1, Math.abs(b)) < t;
}

function buscar(id) {
  return problemas.filter((p) => p.id === id)[0];
}

function resolver(id, valores) {
  return buscar(id).resolver(valores);
}

/* ── valores de la guía ─────────────────────────────────────────── */

console.log('\nGuía S9 · ejercicios 1 a 4 y Guía S10 · anillo y arco\n');

// Ejercicio 1 — carga puntual: q = 4.00 µC, r = 0.500 m → 7.19 × 10⁴ V
{
  const r = resolver('puntual', { q: 4.00e-6, r: 0.500 });
  ok(cerca(r.grafica.marker.y, 7.192e4, 1e-3), 'carga puntual: V = 7.19 × 10⁴ V (dio ' + N.format(r.grafica.marker.y, 3) + ')');
}

// Ejercicio 2 — dos cargas: q1 = 3.00, q2 = −2.00 µC, d = 0.400 m → 4.50 × 10⁴ V
{
  const r = resolver('superposicion', { q1: 3.00e-6, q2: -2.00e-6, d: 0.400 });
  const v = r.grafica.marker.y;
  ok(cerca(v, 4.495e4, 1e-3), 'dos cargas: V = 4.50 × 10⁴ V (dio ' + N.format(v, 3) + ')');
}

// Ejercicio 4 — anillo: R = 0.150, Q = 8.00 µC, x = 0.250 → 2.47 × 10⁵ V
{
  const r = resolver('anillo', { R: 0.150, Q: 8.00e-6, x: 0.250 });
  const v = r.grafica.marker.y;
  ok(cerca(v, 2.467e5, 1e-3), 'anillo (S9): V = 2.47 × 10⁵ V (dio ' + N.format(v, 3) + ')');
}

// Guía S10, ejercicio 3 — arco: R = 0.200, Q = 8.00 µC → 3.60 × 10⁵ V
{
  const r = resolver('arco', { R: 0.200, Q: 8.00e-6 });
  const v = r.grafica.marker.y;
  ok(cerca(v, 3.596e5, 1e-3), 'arco: V = 3.60 × 10⁵ V (dio ' + N.format(v, 3) + ')');
}

// Guía S10, ejercicio 11 — anillo: R = 0.200, Q = 6.00 µC, x = 0.300 → 1.50 × 10⁵ V
{
  const r = resolver('anillo', { R: 0.200, Q: 6.00e-6, x: 0.300 });
  const v = r.grafica.marker.y;
  ok(cerca(v, 1.497e5, 2e-3), 'anillo (S10): V ≈ 1.50 × 10⁵ V (dio ' + N.format(v, 3) + ')');
}

// Guía S10, ejercicio 1 — varilla sobre el eje: L = 0.600, Q = 6.00 µC,
// d = 0.400 → V = 8.24 × 10⁴ V
{
  const r = resolver('varillaEje', { L: 0.600, Q: 6.00e-6, d: 0.400 });
  const v = r.grafica.marker.y;
  ok(cerca(v, 8.237e4, 1e-3), 'varilla sobre el eje: V = 8.24 × 10⁴ V (dio ' + N.format(v, 3) + ')');
}

// Guía S10, ejercicio 10 — varilla sobre la mediatriz: L = 0.500,
// Q = 4.00 µC, d = 0.300 → V = 1.09 × 10⁵ V
{
  const r = resolver('varillaMediatriz', { L: 0.500, Q: 4.00e-6, d: 0.300 });
  const v = r.grafica.marker.y;
  ok(cerca(v, 1.0905e5, 1e-3), 'varilla en la mediatriz: V = 1.09 × 10⁵ V (dio ' + N.format(v, 3) + ')');
}

// Guía S9, ejercicio 6 — disco: R = 0.120, Q = 6.00 µC, x = 0.080 →
// V = 4.81 × 10⁵ V
{
  const r = resolver('disco', { R: 0.120, Q: 6.00e-6, x: 0.080 });
  const v = r.grafica.marker.y;
  ok(cerca(v, 4.810e5, 1e-3), 'disco (S9): V = 4.81 × 10⁵ V (dio ' + N.format(v, 3) + ')');
}

// Guía S10, ejercicio 9 — disco: R = 0.150, Q = 9.00 µC, x = 0.100 →
// V = 5.77 × 10⁵ V
{
  const r = resolver('disco', { R: 0.150, Q: 9.00e-6, x: 0.100 });
  const v = r.grafica.marker.y;
  ok(cerca(v, 5.773e5, 1e-3), 'disco (S10): V = 5.77 × 10⁵ V (dio ' + N.format(v, 3) + ')');
}

// Guía S10, ejercicio 2 — dipolo: q = 2.00 µC, a = 0.050, x = 0.500 →
// exacto 7.27 × 10³ V, aproximado 7.19 × 10³ V, error 1.00 %
{
  const r = resolver('dipolo', { q: 2.00e-6, a: 0.050, x: 0.500 });
  const v = r.grafica.marker.y;
  const aprox = N.K_REF * (2 * 2.00e-6 * 0.050) / (0.5 * 0.5);
  ok(cerca(v, 7.2653e3, 1e-3), 'dipolo: V exacto = 7.27 × 10³ V (dio ' + N.format(v, 3) + ')');
  ok(cerca(aprox, 7.192e3, 1e-3), 'dipolo: V aproximado = 7.19 × 10³ V (dio ' + N.format(aprox, 3) + ')');
  ok(cerca(Math.abs(v - aprox) / Math.abs(v) * 100, 1.0, 5e-2), 'dipolo: error del 1.00 %');
  ok(r.principal === 'V = 7.27 × 10³ V', 'dipolo: el resultado se escribe 7.27 × 10³ V');
}

// Guía S9, ejercicio 3 — diferencia de potencial: q = 5.00 µC,
// r_A = 0.200 m, r_B = 0.500 m → V_A = 2.25 × 10⁵ V, V_B = 8.99 × 10⁴ V,
// V_A − V_B = 1.35 × 10⁵ V
{
  const r = resolver('diferencia', { q: 5.00e-6, rA: 0.200, rB: 0.500 });
  ok(cerca(r.grafica.markers[0].y, 2.2475e5, 1e-3), 'diferencia: V_A = 2.25 × 10⁵ V (dio ' + N.format(r.grafica.markers[0].y, 3) + ')');
  ok(cerca(r.grafica.markers[1].y, 8.99e4, 1e-3), 'diferencia: V_B = 8.99 × 10⁴ V (dio ' + N.format(r.grafica.markers[1].y, 3) + ')');
  ok(cerca(r.grafica.markers[0].y - r.grafica.markers[1].y, 1.3485e5, 1e-3), 'diferencia: ΔV = 1.35 × 10⁵ V');
}

// Guía S9, ejercicio 5 — energía de tres cargas: q₁ = +4.00, q₂ = −3.00,
// q₃ = +5.00 µC, L = 0.300 m → U = −0.210 J
{
  const r = resolver('energia', { q1: 4.00e-6, q2: -3.00e-6, q3: 5.00e-6, L: 0.300 });
  const u = r.grafica.marker.y;
  ok(cerca(u, -0.2098, 1e-3), 'energía de tres cargas: U = −0.210 J (dio ' + N.format(u, 3) + ')');
  ok(cerca(r.grafica.marker.y, -0.2098, 1e-3), 'energía: el total suma los tres pares una sola vez');
}

// Guía S10, ejercicio 4 — potencial, energía y trabajo: q₁ = +4.00,
// q₂ = −2.00, q₃ = +3.00 µC en (0,0), (0.30,0), (0,0.40); q₀ = +1.50 µC
// en (0.30,0.40) → V = 1.17 × 10⁵ V, U = 0.175 J, W = +0.175 J
{
  const r = resolver('trabajo', {
    q1: 4.00e-6, q2: -2.00e-6, q3: 3.00e-6, q0: 1.50e-6, a: 0.300, b: 0.400
  });
  ok(cerca(r.grafica.marker.y, 0.1753, 1e-3), 'trabajo: U = 0.175 J (dio ' + N.format(r.grafica.marker.y, 3) + ')');
  ok(r.principal === 'V(P) = 1.17 × 10⁵ V', 'trabajo: V(P) = 1.17 × 10⁵ V');
  ok(cerca(r.grafica.marker.y / 1.50e-6, 1.1687e5, 1e-3), 'trabajo: V(P) = 1.1687 × 10⁵ V');
}

// Guía S9, ejercicio 7 — línea infinita: λ = 6.00 µC/m, r = 0.400 m,
// r₀ = 1.00 m → V = 9.88 × 10⁴ V (la guía redondea a 9.89)
{
  const r = resolver('linea', { lambda: 6.00e-6, r: 0.400, r0: 1.000 });
  const v = r.grafica.marker.y;
  ok(cerca(v, 9.883e4, 1e-3), 'línea infinita: V = 9.88 × 10⁴ V (dio ' + N.format(v, 3) + ')');
}

// Guía S9, ejercicio 8 — esfera aislante: R = 0.250 m, Q = 10.0 µC →
// centro 5.39 × 10⁵ V, superficie 3.60 × 10⁵ V
{
  const r = resolver('esfera', { R: 0.250, Q: 10.0e-6, r: 0.500 });
  ok(cerca(r.grafica.markers[0].y, 5.394e5, 1e-3), 'esfera: V(centro) = 5.39 × 10⁵ V (dio ' + N.format(r.grafica.markers[0].y, 3) + ')');
  ok(cerca(r.grafica.markers[1].y, 3.596e5, 1e-3), 'esfera: V(superficie) = 3.60 × 10⁵ V (dio ' + N.format(r.grafica.markers[1].y, 3) + ')');
}

// Guía S10, ejercicio 6 — corteza esférica: R = 0.300 m, Q = 12.0 µC →
// interior 3.60 × 10⁵ V; a 0.500 m, 2.16 × 10⁵ V
{
  const dentro = resolver('corteza', { R: 0.300, Q: 12.0e-6, r: 0.150 });
  ok(cerca(dentro.grafica.marker.y, 3.596e5, 1e-3), 'corteza: V interior = 3.60 × 10⁵ V (dio ' + N.format(dentro.grafica.marker.y, 3) + ')');
  const fuera = resolver('corteza', { R: 0.300, Q: 12.0e-6, r: 0.500 });
  ok(cerca(fuera.grafica.marker.y, 2.158e5, 1e-3), 'corteza: V(0.500 m) = 2.16 × 10⁵ V (dio ' + N.format(fuera.grafica.marker.y, 3) + ')');
}

// Guía S10, ejercicio 8 — placas paralelas: d = 0.050 m, V_A = 600 V,
// V_B = 0 V, q = +2.50 µC → E = 1.20 × 10⁴ V/m, ΔU = −1.50 × 10⁻³ J,
// W = +1.50 × 10⁻³ J
{
  const r = resolver('placas', { d: 0.050, VA: 600, VB: 0, q: 2.50e-6 });
  ok(r.datos[4].value === N.format(1.2e4, 3) + ' V/m', 'placas: E = 1.20 × 10⁴ V/m (dio ' + r.datos[4].value + ')');
  ok(r.datos[5].value === N.format(-1.5e-3, 3) + ' J', 'placas: ΔU = −1.50 × 10⁻³ J (dio ' + r.datos[5].value + ')');
  ok(r.datos[6].value === N.format(1.5e-3, 3) + ' J', 'placas: W = +1.50 × 10⁻³ J (dio ' + r.datos[6].value + ')');
}

// Guía S10, ejercicio 5 — gradiente: f = x² + y², P(1, 2) →
// ∇f = 2i + 4j, |∇f| = 4.47, θ = 63.4°
{
  const r = resolver('gradiente', { x0: 1, y0: 2 });
  ok(r.datos[3].value === N.format(Math.sqrt(20), 3), 'gradiente: |∇f| = 4.47 (dio ' + r.datos[3].value + ')');
  ok(r.datos[4].value === N.format(63.4349, 3) + '°', 'gradiente: θ = 63.4° (dio ' + r.datos[4].value + ')');
}

// Guía S10, ejercicio 7 — equipotenciales: V = 50 − 4x² − 9y², V₀ = 14,
// P(1.5, 1) → a = 3 m, b = 2 m, |E| = 21.6 V/m, θ = 56.3°
{
  const r = resolver('equipotenciales', { V0: 14, x0: 1.5, y0: 1 });
  ok(r.datos[1].value === N.format(3, 3) + ' m', 'equipotenciales: a = 3.00 m (dio ' + r.datos[1].value + ')');
  ok(r.datos[2].value === N.format(2, 3) + ' m', 'equipotenciales: b = 2.00 m (dio ' + r.datos[2].value + ')');
  ok(r.datos[4].value === N.format(Math.sqrt(468), 3) + ' V/m', 'equipotenciales: |E| = 21.6 V/m (dio ' + r.datos[4].value + ')');
}

/* ── validación ─────────────────────────────────────────────────── */

console.log('\nValidación de entradas\n');

{
  const p = buscar('puntual');
  const vacio = sandbox.Validate.check(p.campos, { q: '', r: '' });
  ok(!vacio.valid && vacio.errors.q && vacio.errors.r, 'campos vacíos producen error en cada campo');

  const texto = sandbox.Validate.check(p.campos, { q: '4 µC', r: '0.5' });
  ok(!texto.valid && texto.errors.q, 'rechaza texto con unidades dentro del campo');

  const cero = sandbox.Validate.check(p.campos, { q: '4', r: '0' });
  ok(!cero.valid && cero.errors.r, 'rechaza r = 0 (potencial no definido)');

  const coma = sandbox.Validate.check(p.campos, { q: '4,00', r: '0,500' });
  ok(coma.valid && cerca(coma.values.q, 4e-6, 1e-9), 'acepta coma decimal (4,00 µC)');

  const cientifica = sandbox.Validate.check(p.campos, { q: '4.00 × 10^-6', r: '5e-1' });
  ok(cientifica.valid && cerca(cientifica.values.r, 0.5, 1e-9), 'acepta notación científica');
}

{
  const p = buscar('anillo');
  const negativo = sandbox.Validate.check(p.campos, { R: '-0.1', Q: '8', x: '0.25' });
  ok(!negativo.valid && negativo.errors.R, 'rechaza radio negativo en el anillo');

  const xCero = sandbox.Validate.check(p.campos, { R: '0.15', Q: '8', x: '0' });
  ok(xCero.valid, 'acepta x = 0 (potencial en el centro del anillo)');
}

{
  const p = buscar('superposicion');
  const cero = sandbox.Validate.check(p.campos, { q1: '0', q2: '0', d: '0.4' });
  const extra = p.validar(cero.values);
  ok(Object.keys(extra.errors).length > 0, 'rechaza dos cargas nulas');
}

{
  const p = buscar('arco');
  const r = p.resolver({ R: 0.2, Q: -8e-6 });
  ok(r.grafica.marker.y < 0, 'una carga negativa da potencial negativo');
}

{
  const p = buscar('dipolo');
  const dentro = sandbox.Validate.check(p.campos, { q: '2', a: '0.05', x: '0.04' });
  const extra = p.validar(dentro.values);
  ok(!dentro.valid || extra.errors.x, 'el dipolo rechaza un punto entre las cargas (x ≤ a)');

  const fuera = sandbox.Validate.check(p.campos, { q: '2', a: '0.05', x: '0.5' });
  ok(fuera.valid && !p.validar(fuera.values).errors.x, 'el dipolo acepta x = 0.500 m');
}

{
  const p = buscar('disco');
  const centro = sandbox.Validate.check(p.campos, { R: '0.15', Q: '9', x: '0' });
  ok(centro.valid, 'el disco acepta x = 0 (potencial en el centro)');
  const negativo = sandbox.Validate.check(p.campos, { R: '-0.1', Q: '9', x: '0.1' });
  ok(!negativo.valid && negativo.errors.R, 'el disco rechaza un radio negativo');
}

{
  const p = buscar('varillaEje');
  const cero = sandbox.Validate.check(p.campos, { L: '0.6', Q: '6', d: '0' });
  ok(!cero.valid && cero.errors.d, 'la varilla sobre el eje rechaza d = 0 (punto en el extremo)');
}

/* ── formato ────────────────────────────────────────────────────── */

console.log('\nFormato de cifras\n');

ok(N.format(4.213e5, 3) === '4.21\u00A0×\u00A010<sup>5</sup>', 'notación científica con superíndice');
ok(N.format(0.175, 3) === '0.175', 'valores pequeños en forma decimal');
ok(N.format(-89900, 3).indexOf('−') === -1 && N.format(-89900, 3).indexOf('-') === 0, 'conserva el signo negativo');

/* ── resumen ────────────────────────────────────────────────────── */

console.log('\n' + (total - fallos) + '/' + total + ' verificaciones correctas\n');
process.exit(fallos === 0 ? 0 : 1);
