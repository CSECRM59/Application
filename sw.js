// Nom du cache avec une version pour forcer la mise à jour si besoin
const CACHE_NAME = 'cse-cache-v4'; // Changez "v2" à chaque mise à jour importante

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
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retourner la réponse en cache si disponible, sinon aller sur le réseau
            return response || fetch(event.request).then((networkResponse) => {
                // Mettre en cache la nouvelle réponse pour les futures utilisations
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
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
