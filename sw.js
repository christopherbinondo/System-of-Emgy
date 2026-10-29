const CACHE = 'incident-desk-v6';
const ASSETS = [
  './', 
  './index.html', 
  './report.html', 
  './queue.html', 
  './records.html', 
  './analytics.html',
  './style.css?v=5', 
  './core.js', 
  './ai.js',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js' // <--- ADDED THIS
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // ONLY skip caching for the AI server
  if (url.hostname === 'oxford.uk.eu.org') return;
  
  // (We removed the googleapis and unpkg skip, so it caches them now)
  
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => cached))
  );
});
