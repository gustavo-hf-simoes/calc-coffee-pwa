/**
 * Calc Coffee - Service Worker (Offline-First com Network-First para Código e Cache para Áudios)
 */

const CACHE_NAME = "calc-coffee-v2.3.0";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/engine.js",
  "./js/timer.js",
  "./js/dialin-coach.js",
  "./js/store.js",
  "./js/analytics.js",
  "./js/app.js",
  "./audio/bloom.mp3",
  "./audio/pour_1.mp3",
  "./audio/pour_2.mp3",
  "./audio/pour_3.mp3",
  "./audio/pour_4.mp3",
  "./audio/pour_5.mp3",
  "./audio/last_pour.mp3",
  "./audio/finish.mp3"
];

// Instalação do Service Worker e pré-cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza agressiva de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Removendo cache obsoleto:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First para HTML e JS (garante atualização imediata sem travar versão velha)
// Estratégia Cache-First para Áudios (para economia de banda e resposta instantânea)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Áudios MP3: Cache-First
  if (url.pathname.endsWith(".mp3")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML, JS e CSS: Network-First com Fallback no Cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return null;
        });
      })
  );
});
