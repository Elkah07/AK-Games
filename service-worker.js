const CACHE_VERSION = "akgames-v1.0-audit4";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/firebase.js",
  "/multiplayer.js",
  "/pwa.js",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-32.png",
  "/icons/favicon-16.png",
  "/data/qui-de-nous.json",
  "/data/qui-de-nous-adulte.json",
  "/data/blagues.json",
  "/data/blagues-adulte.json",
  "/data/qui-ment-prompts.json",
  "/data/qui-ment-prompts-adulte.json",
  "/data/action-verite.json",
  "/data/action-verite-adulte.json",
  "/data/je-nai-jamais.json",
  "/data/je-nai-jamais-adulte.json",
  "/data/tu-preferes.json",
  "/data/tu-preferes-adulte.json",
  "/data/meme-cerveau.json",
  "/data/meme-cerveau-adulte.json",
  "/data/minorite.json",
  "/data/minorite-adulte.json",
  "/data/qui-a-repondu.json",
  "/data/qui-a-repondu-adulte.json",
  "/data/imposteur.json",
  "/data/imposteur-adulte.json",
  "/data/faux-expert.json",
  "/data/faux-expert-adulte.json",
  "/data/qui-suis-je.json",
  "/data/qui-suis-je-adulte.json",
  "/data/roulette-defis.json",
  "/data/mime.json",
  "/data/imitation.json",
  "/data/bombe.json",
  "/data/quiz-culture.json",
  "/data/quiz-cinema.json",
  "/data/quiz-musique.json",
  "/data/quiz-jeux-video.json",
  "/data/quiz-logos.json",
  "/data/plaide-cause.json",
  "/data/fake-reel.json",
  "/data/alerte-rouge.json",
  "/data/tu-me-connais.json",
  "/data/classement-secret.json",
  "/data/devinettes.json",
  "/data/questions-osees.json",
  "/data/jeux-a-boire.json",
  "/data/defis-adultes.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => Promise.allSettled(
        APP_SHELL.map(asset => cache.add(asset))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Firebase et les autres services externes restent gérés par le réseau.
  if (url.origin !== self.location.origin) return;

  // Navigation : réseau d'abord, puis l'app locale en secours.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Code, styles et données : retour rapide du cache, puis mise à jour silencieuse.
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
