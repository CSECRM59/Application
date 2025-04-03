// service-worker.js

const CACHE_NAME = 'cse-app-cache-v1'; // Changez 'v1' si vous modifiez les fichiers mis en cache

// Fichiers essentiels de l'application à mettre en cache lors de l'installation
const urlsToCache = [
  '/', // La page d'accueil (index.html)
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/logo.png', // Votre logo principal
  '/icons/icon-192x192.png', // Vos icônes PWA
  '/icons/icon-512x512.png',
  // Ajoutez ici d'autres ressources statiques importantes (polices, autres images...)
  // 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', // Attention avec les CDN, le cache peut être complexe
  // 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js' // Idem
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

  // Stratégie "Cache First" pour les fichiers mis en cache lors de l'installation
  // Pour les autres requêtes (ex: API Google Sheets), on va au réseau directement pour l'instant.
  if (urlsToCache.includes(requestUrl.pathname) || requestUrl.origin === self.location.origin && requestUrl.pathname === '/') {
     // console.log('[Service Worker] Fetch (Cache First):', event.request.url);
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            // Si trouvé dans le cache, renvoyer la réponse du cache
            if (response) {
              // console.log('[Service Worker] Réponse trouvée dans le cache:', event.request.url);
              return response;
            }
            // Sinon, effectuer la requête réseau
            // console.log('[Service Worker] Non trouvé dans le cache, requête réseau:', event.request.url);
            return fetch(event.request)
                // Optionnel: Mettre en cache la nouvelle réponse pour la prochaine fois ?
                // Attention, cela peut cacher des mises à jour si mal géré.
                /* .then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return networkResponse;
                }) */
                ;
          })
          .catch(error => {
              console.error('[Service Worker] Erreur lors du fetch:', error);
              // Optionnel: Renvoyer une page hors ligne générique si le cache et le réseau échouent
              // return caches.match('/offline.html');
          })
      );
  } else {
      // Pour les requêtes non mises en cache (API, etc.), laisser passer vers le réseau
      // console.log('[Service Worker] Fetch (Network Only):', event.request.url);
      // Aucune action spécifique ici, le navigateur gère la requête normalement.
      // On pourrait implémenter ici des stratégies plus complexes (NetworkFirst, StaleWhileRevalidate)
      // pour les données dynamiques (newsCsvUrl, partnersCsvUrl).
      return; // Laisse le navigateur faire la requête normalement.
  }
});
