/**
 * PodChat service worker.
 *
 * Deliberately conservative: the app shell is cached so PodChat opens
 * instantly and survives a dropped connection, but API responses and
 * media are always fetched live. Nobody should be served a stale
 * episode list, and audio files are far too large to cache blindly.
 */

const VERSION = "podchat-v1";
const SHELL = [
  "/",
  "/favicon.svg",
  "/manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache the API or media — always live.
  if (url.pathname.startsWith("/api/")) return;
  if (url.hostname.includes("cloudinary")) return;
  if (url.hostname.includes("podchat.wittyhub.co")) return;

  // Navigation: try the network, fall back to the cached shell offline.
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).catch(() => caches.match("/").then((r) => r || Response.error()))
    );
    return;
  }

  // Static assets: serve from cache, refresh in the background.
  e.respondWith(
    caches.match(request).then((cached) => {
      const live = fetch(request).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || live;
    })
  );
});
