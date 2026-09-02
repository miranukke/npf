/* NPF Rule — offline service worker.
 *
 * The whole app is one self-contained HTML file, so the cache is tiny and the
 * strategy can be simple: serve from cache immediately (instant, and works with
 * no signal at a dark site), then refresh the cache in the background so the
 * next launch has the newer build.
 *
 * Bump VERSION on every deploy — activate() drops every other cache.
 */
const VERSION = 'npf-2026-09-02';

// './' and './index.html' are the same document on GitHub Pages, but a
// navigation request hits './' while a precache lists the file, so cache both.
const CRITICAL = ['./', './index.html'];
const OPTIONAL = ['./manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // cache:'reload' bypasses the HTTP cache, so a deploy can never bake a
    // stale copy into the offline cache (GitHub Pages serves max-age=600)
    const fresh = u => new Request(u, { cache: 'reload' });
    await cache.addAll(CRITICAL.map(fresh));            // must succeed
    await Promise.all(OPTIONAL.map(u =>                 // nice to have
      cache.add(fresh(u)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });

    const fromNetwork = fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    }).catch(() => null);

    // cached copy wins the race; the refresh continues after the response
    if (cached) { event.waitUntil(fromNetwork); return cached; }

    const res = await fromNetwork;
    if (res) return res;

    // offline and never seen this URL: fall back to the app shell
    if (req.mode === 'navigate') {
      const shell = await cache.match('./', { ignoreSearch: true });
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  })());
});

// lets the page trigger an immediate update
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
