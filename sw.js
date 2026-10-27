/* Service worker: el HTML siempre se pide a la red (para no servir
   versiones viejas durante el desarrollo) y los recursos estáticos
   se guardan en caché. */
const CACHE = 'potencial-v3';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/app.css',
  './assets/js/core/num.js',
  './assets/js/core/math.js',
  './assets/js/core/validate.js',
  './assets/js/core/plot.js',
  './assets/js/core/diagram.js',
  './assets/js/core/fonts.js',
  './assets/js/core/export.js',
  './assets/js/problems/puntual.js',
  './assets/js/problems/superposicion.js',
  './assets/js/problems/anillo.js',
  './assets/js/problems/arco.js',
  './assets/js/problems/varilla-eje.js',
  './assets/js/problems/varilla-mediatriz.js',
  './assets/js/problems/disco.js',
  './assets/js/problems/dipolo.js',
  './assets/js/problems/diferencia.js',
  './assets/js/problems/energia.js',
  './assets/js/problems/trabajo.js',
  './assets/js/problems/linea.js',
  './assets/js/problems/esfera.js',
  './assets/js/problems/corteza.js',
  './assets/js/problems/placas.js',
  './assets/js/problems/gradiente.js',
  './assets/js/problems/equipotenciales.js',
  './assets/js/diagrams/esquemas.js',
  './assets/js/ui/import.js',
  './assets/js/ui/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }))
  );
});
