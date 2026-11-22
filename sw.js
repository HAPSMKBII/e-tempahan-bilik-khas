// Book-It (Tempahan Bilik Khas) — service worker
// Tukar VERSI setiap kali index.html dikemas kini supaya telefon guru menerima versi baharu.
const VERSI = 'bookit-v1.8-2026-11-22';
const WAJIB = ['./index.html'];
const PILIHAN = ['./', './manifest.webmanifest', './tetapan.js', './ikon-192.png', './ikon-512.png',
  './ikon-maskable-512.png', './apple-touch-icon.png', './favicon.png', './lencana.png', './latar-sekolah.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI)
    .then(c => c.addAll(WAJIB).then(() => Promise.all(PILIHAN.map(f => c.add(f).catch(() => {})))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Cuba rangkaian dahulu (dapat versi terbaru), guna cache jika luar talian
function rangkaianDahulu(req, kunci) {
  return fetch(req).then(r => {
    if (r && r.ok) { const k = r.clone(); caches.open(VERSI).then(c => c.put(kunci, k)); }
    return r;
  }).catch(() => caches.match(kunci));
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Data tempahan (Apps Script) dan fon Google tidak disimpan: sentiasa terus ke internet
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(rangkaianDahulu(req, './index.html')); return; }
  // Tetapan: sentiasa ambil versi terbaru supaya API_URL yang baharu sampai ke telefon
  if (url.pathname.endsWith('/tetapan.js')) { e.respondWith(rangkaianDahulu(req, './tetapan.js')); return; }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
