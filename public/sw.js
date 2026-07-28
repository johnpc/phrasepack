// Service worker for PhrasePack — makes the app installable AND resilient
// offline, without stale-asset risk. Two strategies:
//
//  • Hashed static assets (/assets/*, produced by Vite with a content hash in
//    the filename) are CACHE-FIRST: a filename only ever maps to one exact
//    build output, so serving it from cache can never be stale.
//
//  • Navigations (HTML documents) are NETWORK-FIRST: online, always fetch the
//    latest index.html (a new deploy is picked up immediately); offline, fall
//    back to the cached shell so the app still boots.
//
// The cache is versioned; activate() deletes older versions. Bump CACHE on any
// strategy change.
const CACHE = 'phrasepack-v1';
const SHELL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only handle same-origin GETs; let everything else (APIs, POSTs) pass through.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // Navigations → network-first, cached shell as the offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(SHELL)));
    return;
  }

  // Hashed static assets → cache-first (immutable per build; fetch + store on miss).
  if (new URL(request.url).pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
  }
});
