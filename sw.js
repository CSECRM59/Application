// Nom du cache avec une version pour forcer la mise à jour si besoin
const CACHE_NAME = 'cse-cache-v7'; // Changez "v2" à chaque mise à jour importante

// Installation : Mise en cache des fichiers
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './',
                './index.html',
                './styles.css',
                './script.js',
                './manifest.json', // Ajoutez d'autres fichiers si nécessaire
                './icons/favicon.ico',
                './icons/icon-192x192.png',
                './icons/icon-512x512.png'
            ]);
        }).then(() => {
            // Forcer l'activation immédiate du nouveau Service Worker
            self.skipWaiting();
        })
    );
});

// Activation : Nettoyer les anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => {
            // Prendre le contrôle immédiatement
            return self.clients.claim();
        })
    );
});

// Fetch : Servir depuis le cache ou le réseau
// sw.js

self.addEventListener('fetch', (event) => {
    // --- NOUVEAU : Ignorer immédiatement toutes les requêtes non-GET ---
    if (event.request.method !== 'GET') {
      // console.log('[SW] Ignored non-GET request:', event.request.method, event.request.url);
      // Ne pas intercepter, laisser le navigateur gérer la requête POST/PUT/etc. normalement
      return;
    }
    // --- FIN NOUVEAU ---

    // Maintenant, on sait qu'on a affaire à une requête GET.
    // On peut garder les exclusions spécifiques si on ne veut pas cacher certains domaines GET.
    if (event.request.url.includes('firestore.googleapis.com') || // Probablement redondant maintenant, mais sans danger
        event.request.url.includes('google.com/recaptcha') ||
        event.request.url.includes('fonts.gstatic.com')) {
      // console.log('[SW] Ignored specific GET domain:', event.request.url);
      // Laisser passer ces requêtes GET spécifiques sans les mettre en cache via le SW
      return;
    }

    // Si on arrive ici, c'est une requête GET qu'on veut potentiellement servir depuis le cache ou mettre en cache.
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                //console.log('[SW] Ressource trouvée en cache:', event.request.url);
                return cachedResponse;
            }

            //console.log('[SW] Ressource non trouvée en cache, fetch réseau:', event.request.url);
            return fetch(event.request).then((networkResponse) => {
                // Vérifier si la réponse est valide avant de la mettre en cache
                // IMPORTANT : Toujours vérifier, car même pour GET on peut avoir des erreurs
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    //console.log('[SW] Mise en cache de la nouvelle ressource GET:', event.request.url);
                    // Maintenant, on est sûr que event.request est une requête GET valide pour la mise en cache
                    cache.put(event.request, responseToCache); // Ligne 48 (ou proche) - Ne devrait plus poser problème
                });

                return networkResponse;
            }).catch(error => {
                console.warn('[SW] Erreur Fetch (Réseau indisponible?) :', error);
                // Optionnel: Renvoyer une page offline générique
                // return caches.match('/offline.html');
            });
        })
    );
});

// Écouter un message pour forcer la mise à jour
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        self.skipWaiting(); // Activer immédiatement une nouvelle version si en attente
    }
});
