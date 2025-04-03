// service-worker.js

const CACHE_NAME = 'cse-app-cache-v2'; // Incrémentez la version ! v1 -> v2

const urlsToCache = [
  // Chemins relatifs au Service Worker (qui est dans /Application/)
  './',                     // La racine de l'application (/Application/)
  './index.html',           // La page principale
  './styles.css',
  './script.js',
  './manifest.json',
  './logo.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  // Mettre les URLs complètes pour les CDN externes est plus sûr
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js'
  // Ajoutez d'autres ressources locales avec './' ou chemin relatif
];

// Événement 'install' : le Service Worker est installé
self.addEventListener('install', event => {
  console.log('[Service Worker] Installation...');
  // Pré-mise en cache des ressources essentielles
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Mise en cache des fichiers de base');
        // Important : addAll est atomique, si UN fichier échoue, tout échoue.
        // Vérifiez bien les chemins !
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Échec de la mise en cache initiale:', error);
      })
  );
  // Force le nouveau Service Worker à s'activer immédiatement (optionnel mais souvent utile)
  self.skipWaiting();
});

// Événement 'activate' : le Service Worker est activé et prend le contrôle
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation...');
  // Supprimer les anciens caches qui ne sont plus utilisés
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    // Prend le contrôle immédiat des clients (onglets) ouverts
     .then(() => self.clients.claim())
  );
});

// Événement 'fetch' : Intercepte toutes les requêtes réseau de la page
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Adapter la condition pour correspondre aux URLs mises en cache
    // Vérifie si l'URL demandée (chemin relatif depuis l'origine) fait partie des URLs à cacher
    const requestedPath = requestUrl.origin === self.location.origin ? requestUrl.pathname.substring('/Application'.length) || '/' : null;
    // Correction : Construire le chemin relatif attendu dans urlsToCache
    const expectedCachePath = requestedPath === '/' ? './' : '.' + requestedPath; 
    
    // OU plus simple : comparer les URLs complètes pour les CDN
    const isExternalCachable = urlsToCache.includes(event.request.url);

    if (isExternalCachable || (requestedPath !== null && urlsToCache.includes(expectedCachePath))) {
       // console.log('[SW] Fetch (Cache First):', event.request.url, "Expected Cache Path:", expectedCachePath);
         event.respondWith(
            caches.match(event.request)
              .then(response => {
                  if (response) {
                      return response;
                  }
                  return fetch(event.request); // Pas de mise en cache dynamique pour l'instant
              })
        );
    } else {
        // console.log('[SW] Fetch (Network Only):', event.request.url);
         return; // Laisse le navigateur gérer
    }
});

