# Potencial eléctrico · Física II

Aplicación web instalable que resuelve los problemas de potencial eléctrico de las dos guías
del curso **paso a paso**, con validación de datos, esquema del enunciado y gráfica propia en
cada problema. Sin frameworks, sin dependencias y sin conexión: todo se calcula en el
dispositivo.

Es un proyecto aparte del simulador del disco cargado: aquel quedó cerrado y este no lo
modifica.

---

## Cobertura

Las 17 familias cubren los 19 ejercicios de las guías.

| Familia | Ejercicio | Gráfica |
| --- | --- | --- |
| Carga puntual | S9 · 1 | V vs r |
| Dos cargas puntuales | S9 · 2 | V sobre la recta que une las cargas (cruce por cero) |
| Diferencia de potencial | S9 · 3 | V en A y en B, con ΔV |
| Anillo cargado | S9 · 4 y S10 · 11 | V vs x en el eje, con comparación de carga puntual |
| Energía de tres cargas | S9 · 5 | energía por par y total |
| Disco cargado | S9 · 6 y S10 · 9 | V vs x en el eje |
| Línea infinita | S9 · 7 | V vs r con nivel cero en r₀ |
| Esfera aislante | S9 · 8 | V dentro y fuera de la esfera |
| Varilla sobre el eje | S10 · 1 | V vs d |
| Dipolo | S10 · 2 | V exacto, aproximado y error relativo |
| Arco semicircular | S10 · 3 | V vs R |
| Potencial, energía y trabajo | S10 · 4 | U y W |
| Gradiente | S10 · 5 | curvas de nivel y ∇f en P |
| Corteza esférica | S10 · 6 | V dentro y fuera |
| Equipotenciales | S10 · 7 | corte V(x, 0) de la elipse |
| Placas paralelas | S10 · 8 | V a lo ancho del campo |
| Varilla sobre la mediatriz | S10 · 10 | V vs d |

Resultados verificados contra las resoluciones de las guías:

| Ejercicio | Guía | App |
| --- | --- | --- |
| Carga puntual, q = 4.00 µC, r = 0.500 m | 7.19 × 10⁴ V | 7.19 × 10⁴ V |
| Dos cargas, +3.00 y −2.00 µC, d = 0.400 m | 4.50 × 10⁴ V | 4.50 × 10⁴ V |
| Diferencia, q = 5.00 µC, r = 0.200 y 0.500 m | 1.35 × 10⁵ V | 1.35 × 10⁵ V |
| Anillo, R = 0.150 m, Q = 8.00 µC, x = 0.250 m | 2.47 × 10⁵ V | 2.47 × 10⁵ V |
| Energía, 4.00, −3.00 y 5.00 µC, L = 0.300 m | −0.210 J | −0.210 J |
| Disco, R = 0.120 m, Q = 6.00 µC, x = 0.080 m | 4.81 × 10⁵ V | 4.81 × 10⁵ V |
| Línea, λ = 6.00 µC/m, r = 0.400 m, r₀ = 1.00 m | 9.89 × 10⁴ V | 9.88 × 10⁴ V |
| Esfera, R = 0.250 m, Q = 10.0 µC | 5.39 y 3.60 × 10⁵ V | 5.39 y 3.60 × 10⁵ V |
| Varilla en el eje, L = 0.600 m, Q = 6.00 µC, d = 0.400 m | 8.24 × 10⁴ V | 8.24 × 10⁴ V |
| Dipolo, q = 2.00 µC, a = 0.050 m, x = 0.500 m | 7.27 y 7.19 × 10³ V | 7.27 y 7.19 × 10³ V |
| Arco, R = 0.200 m, Q = 8.00 µC | 3.60 × 10⁵ V | 3.60 × 10⁵ V |
| Trabajo, q₁ = 4.00, q₂ = −2.00, q₃ = 3.00 µC, q₀ = 1.50 µC | V = 1.17 × 10⁵ V, U = 0.175 J | V = 1.17 × 10⁵ V, U = 0.175 J |
| Gradiente, f = x² + y² en P(1, 2) | 4.47 y 63.4° | 4.47 y 63.4° |
| Corteza, R = 0.300 m, Q = 12.0 µC | 3.60 y 2.16 × 10⁵ V | 3.60 y 2.16 × 10⁵ V |
| Equipotenciales, V = 50 − 4x² − 9y², V₀ = 14 V | a = 3.00 m, b = 2.00 m, E = 21.6 V/m | igual |
| Placas, d = 0.050 m, V_A = 600 V, q = 2.50 µC | E = 1.20 × 10⁴ V/m, W = 1.50 × 10⁻³ J | igual |
| Varilla en la mediatriz, L = 0.500 m, Q = 4.00 µC, d = 0.300 m | 1.09 × 10⁵ V | 1.09 × 10⁵ V |

En la línea infinita la guía escribe 9.89 × 10⁴ V; con k = 8.99 × 10⁹ N·m²/C² el valor es
9.88 × 10⁴ V. La app muestra el suyo y lo advierte en una nota.

---

## Cómo ejecutarlo

No requiere instalación.

1. Abre `index.html` con doble clic.
2. Para probar la instalación como aplicación (PWA) hace falta servirlo por HTTP:

```powershell
python -m http.server 8765 --bind 127.0.0.1
# luego abre http://127.0.0.1:8765/index.html
```

### Verificación automática

```powershell
node tools/test.js
```

Compara cada familia con los resultados de las guías y prueba la validación de entradas.
Si un número deja de coincidir, el test falla.

### Revisión visual

```powershell
node tools/shot.js 390 844 anillo captura.png
```

Abre Chrome sin interfaz, escribe datos de ejemplo, captura la pantalla y avisa si hubo
errores de consola. Con `DUMP=1` imprime además las marcas de los ejes y los resultados; con
`SHEET=1` prueba la hoja de importación; con `EXPORT=1` guarda la figura exportada y con
`SOLO=esquema` recorta el esquema.

---

## Estructura

```
potencial-app/
├─ index.html                 Una sola pantalla; el contenido lo pone app.js
├─ manifest.webmanifest       Metadatos PWA
├─ sw.js                      Service worker (HTML por red, recursos por caché)
├─ assets/
│  ├─ css/app.css             Sistema visual completo, incluida la hoja de importación
│  ├─ js/core/
│  │  ├─ num.js               Constantes, lectura de números y formato de cifras
│  │  ├─ math.js              Fracciones, raíces y potencias en HTML
│  │  ├─ validate.js          Reglas de entrada compartidas
│  │  ├─ plot.js              Motor de gráficas SVG
│  │  ├─ diagram.js           Motor de esquemas SVG y animaciones
│  │  ├─ fonts.js             Fuentes en base64 para el PNG
│  │  └─ export.js            Exportación de esquema y gráfica a PNG
│  ├─ js/problems/            Una familia por archivo (17)
│  ├─ js/diagrams/esquemas.js Un esquema por familia (17)
│  └─ js/ui/
│     ├─ app.js               Estado, formulario, procedimiento, gráfica
│     └─ import.js            Lectura de enunciados (texto, voz y espacio para OCR)
└─ tools/
   ├─ test.js                 Verificación contra las guías
   └─ shot.js                 Captura y revisión de consola
```

---

## Cómo se añade un problema nuevo

Se crea un archivo en `assets/js/problems/`, se enlaza en `index.html` y en `sw.js`, y se
registra su esquema en `assets/js/diagrams/esquemas.js`. No se toca el HTML de la pantalla ni
`app.js`.

```js
(function (global) {
  'use strict';
  var N = global.Num, M = global.M, V = global.Validate;

  global.Problemas = global.Problemas || [];
  global.Problemas.push({
    id: 'varilla',
    nombre: 'Varilla cargada',
    grupo: 'Distribuciones continuas',
    resumen: 'Potencial sobre el eje de una varilla de longitud L.',

    // Unidad fija por campo; `scale` la convierte al SI.
    campos: [
      V.field({ id: 'L', label: 'Longitud', symbol: 'L', unit: 'm', min: 0 }),
      V.field({ id: 'Q', label: 'Carga total', symbol: 'Q', unit: 'uC', scale: 1e-6 }),
      V.field({ id: 'd', label: 'Distancia al extremo', symbol: 'd', unit: 'm', min: 0 })
    ],

    // Reglas cruzadas; los valores ya vienen en unidades del SI.
    validar: function (v) {
      return { errors: {}, warnings: {} };
    },

    resolver: function (v) {
      return {
        principal: 'V = 8.24 × 10⁴ V',
        datos: [{ sym: 'L', value: N.format(v.L, 3) + ' m', conv: '' }],
        incisos: [{
          letra: 'a',
          titulo: 'Densidad lineal de carga',
          bloques: [
            { t: 'text', html: 'La carga se reparte en toda la longitud:' },
            { t: 'eq', html: M.v('λ') + ' = ' + M.frac(M.v('Q'), M.v('L')) },
            { t: 'calc', html: 'λ = ' + N.format(v.Q / v.L, 4) + ' C/m' }
          ],
          resultado: { label: 'λ', html: N.format(v.Q / v.L, 3) + ' C/m' }
        }],
        grafica: {
          xLabel: 'd (m)', yLabel: 'V (V)', xUnit: 'm', yUnit: 'V',
          series: [{ points: [], color: 'var(--teal)' }],
          marker: { x: v.d, y: 0 }
        },
        cierre: 'Texto de cierre del resultado.'
      };
    }
  });
})(window);
```

Tipos de bloque disponibles: `text`, `eq`, `calc` y `nota`.

---

## Convenciones

- **Unidades fijas por campo.** No hay selector: la unidad se muestra al lado del campo. El
  estudiante convierte a SI, igual que en la guía, y la app muestra la conversión en la tabla
  de datos.
- **Sin valores precargados.** Los campos arrancan vacíos.
- **Validación silenciosa al inicio.** Los errores solo aparecen en los campos que el usuario
  ya tocó. Nunca se regaña a quien acaba de abrir la app.
- **Cifras.** Se calcula con k = 8.99 × 10⁹ N·m²/C², el valor de la guía, y se redondea a tres
  cifras significativas al final.
- **Avisos frente a errores.** Un valor atípico (por ejemplo una carga de 1 C) no bloquea el
  cálculo: se advierte que revise la escala.
- **Esquema y gráfica.** Cada problema trae el esquema del enunciado, dibujado a medidas
  reales, y una gráfica propia. Ambos se descargan juntos en un solo PNG desde la tarjeta
  Exportar.
- **Animación con propósito.** Solo giran el anillo, el disco y las varillas, y solo mientras
  la figura está a la vista; con `prefers-reduced-motion` quedan quietas.

---

## Importación de enunciados

`assets/js/ui/import.js` ya interpreta texto pegado o dictado:

- Reconoce `µC`, `uC`, `μC`, `mC`, `nC`, `C`, `m`, `cm`, `mm`, `km`, `µC/m`.
- Convierte a la unidad del campo (`15 cm` → `0.15`, `8 µC` → `8`).
- Primero busca el símbolo (`R = 0.15`); si no lo encuentra, asigna por dimensión y orden de
  aparición.
- **Nunca rellena a ciegas:** muestra lo detectado y espera la confirmación.

La foto queda conectada a una interfaz ya declarada:

```js
global.OcrEngine = {
  disponible: false,
  idioma: 'spa',
  reconocer: function (file) { /* devuelve el texto reconocido */ }
};
```

Mientras `disponible` sea `false`, la app avisa que el espacio está reservado. Al instalar el
motor de OCR (Tesseract.js en la web o ML Kit con Capacitor), basta con devolver texto: el
resto del flujo es el mismo.

---

## Publicación

La app está publicada en **https://abigail-lemus-bmc.github.io/potencial_app/**

El proyecto es estático: cualquier servidor de archivos sirve. Para GitHub Pages basta con
subir el contenido de esta carpeta a la rama principal y activar Pages en la raíz.

Las rutas son relativas, así que funciona igual en `usuario.github.io/repositorio/` que en
un dominio propio.

---

Universidad Mariano Gálvez de Guatemala · Facultad de Ingeniería · Física II · Ing. Estela Xiloj
