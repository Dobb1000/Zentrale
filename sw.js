const CACHE_NAME = "zentrale-v1";

// Du kannst hier bewusst klein anfangen:
const ASSETS = [
    "./",
    "./index.html",
    "./admin.html",
    "./manifest.webmanifest",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
        )
    );
    self.clients.claim();
});

// Netzwerk-first (damit Updates schnell kommen), fallback Cache
self.addEventListener("fetch", (event) => {
    const req = event.request;

    // Nur GET cachen
    if (req.method !== "GET") return;

    event.respondWith(
        fetch(req)
            .then((res) => {
                const copy = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                return res;
            })
            .catch(() => caches.match(req).then((cached) => cached || caches.match("./")))
    );
});
