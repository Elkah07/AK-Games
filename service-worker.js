const CACHE_PREFIX = "akgames-";
const CACHE_VERSION = "akgames-v4.10-all-character-voices";

const CORE_SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=ui-v48",
  "/creator.css?v=creator-v1.3-access",
  "/character-poses.css?v=characters-v5",
  "/app.js?v=ui-v48",
  "/creator.js?v=creator-v1.3-access",
  "/firebase.js",
  "/multiplayer.js?v=ui-v48",
  "/character-poses.js?v=characters-v5",
  "/character-voice-engine.js?v=characters-v5",
  "/characters.js?v=characters-v5",
  "/game-help.js?v=ui-v48",
  "/pwa.js",
  "/manifest.webmanifest",
  "/data/akgames-characters.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-32.png",
  "/icons/favicon-16.png",
  "/assets/characters/croa/idle/avatar-circle.webp",
  "/assets/characters/croa/talk/bust.webp",
  "/assets/characters/loki/idle/avatar-circle.webp",
  "/assets/characters/loki/talk/bust.webp",
  "/assets/characters/kaia/idle/avatar-circle.webp",
  "/assets/characters/kaia/talk/bust.webp",
  "/assets/characters/bonnie/idle/avatar-circle.webp",
  "/assets/characters/bonnie/talk/bust.webp",
  "/assets/characters/edgar/idle/avatar-circle.webp",
  "/assets/characters/edgar/talk/bust.webp",
  "/assets/characters/filou/idle/avatar-circle.webp",
  "/assets/characters/filou/talk/bust.webp",
  "/assets/characters/nuggets/idle/avatar-circle.webp",
  "/assets/characters/nuggets/talk/bust.webp",
  "/assets/characters/vapo/idle/avatar-circle.webp",
  "/assets/characters/vapo/talk/bust.webp",
  "/assets/characters/rrrrh/idle/avatar-circle.webp",
  "/assets/characters/rrrrh/talk/bust.webp",
  "/assets/characters/sir-moustache/idle/avatar-circle.webp",
  "/assets/characters/sir-moustache/talk/bust.webp",
  "/assets/characters/snow/idle/avatar-circle.webp",
  "/assets/characters/snow/talk/bust.webp",
  "/assets/characters/maurice/idle/avatar-circle.webp",
  "/assets/characters/maurice/talk/bust.webp",
  "/assets/characters/moon/idle/avatar-circle.webp",
  "/assets/characters/moon/talk/bust.webp",
  "/assets/characters/spike/idle/avatar-circle.webp",
  "/assets/characters/spike/talk/bust.webp",
  "/assets/characters/honey/idle/avatar-circle.webp",
  "/assets/characters/honey/talk/bust.webp",
  "/assets/characters/flash/idle/avatar-circle.webp",
  "/assets/characters/flash/talk/bust.webp",
  "/assets/characters/marcellius/idle/avatar-circle.webp",
  "/assets/characters/marcellius/talk/bust.webp"
];

const DATA_ASSETS = [
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
  "/data/imitation-adulte.json",
  "/data/bombe.json",
  "/data/bombe-adulte.json",
  "/data/quiz-culture.json",
  "/data/quiz-cinema.json",
  "/data/quiz-musique.json",
  "/data/quiz-jeux-video.json",
  "/data/quiz-logos.json",
  "/data/plaide-cause.json",
  "/data/fake-reel.json",
  "/data/fake-reel-adulte.json",
  "/data/alerte-rouge.json",
  "/data/tu-me-connais.json",
  "/data/classement-secret.json",
  "/data/devinettes.json",
  "/data/questions-osees.json",
  "/data/jeux-a-boire.json",
  "/data/defis-adultes.json"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);

    // Le nouveau worker n'est considéré comme installable que si le cœur de
    // l'application est réellement disponible hors ligne.
    await cache.addAll(CORE_SHELL);

    // Une carte optionnelle indisponible ne doit pas empêcher toute la mise à
    // jour. Les fichiers réussis restent malgré tout mis en cache.
    await Promise.allSettled(DATA_ASSETS.map(asset => cache.add(asset)));
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_VERSION)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Firebase et les services externes restent gérés par le réseau.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);

        // Une 404 ou une réponse non HTML ne doit jamais écraser la copie
        // fonctionnelle d'index.html utilisée en secours hors ligne.
        const contentType = response.headers.get("content-type") || "";
        if (response.ok && contentType.includes("text/html")) {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put("/index.html", response.clone());
        }

        return response;
      } catch {
        const cached = await caches.match("/index.html");
        return cached || Response.error();
      }
    })());
    return;
  }

  // Stale-while-revalidate pour le code, les styles, les icônes et les cartes.
  event.respondWith((async () => {
    const cached = await caches.match(request);

    const networkPromise = fetch(request)
      .then(async response => {
        if (response?.ok) {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => null);

    if (cached) {
      event.waitUntil(networkPromise);
      return cached;
    }

    return (await networkPromise) || Response.error();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
