// Service worker TAMAK Transport — mise en cache minimale
// pour un chargement rapide et une tolérance aux coupures réseau
// (voir section 9.1 du cahier des charges : PWA responsive et installable)

const CACHE_NAME = "tamak-transport-v1";
const URLS_A_METTRE_EN_CACHE = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_A_METTRE_EN_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(noms.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Stratégie "réseau d'abord, cache en secours" : les données restent à jour
// quand la connexion est bonne, et l'appli reste utilisable en coupure réseau
// pour les pages déjà visitées.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((reponse) => {
        const copie = reponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copie));
        return reponse;
      })
      .catch(() => caches.match(event.request))
  );
});
