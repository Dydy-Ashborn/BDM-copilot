const CACHE_NAME = 'bdm-v2';

// Utiliser l'URL de base du service worker pour les chemins relatifs
const getBaseUrl = () => {
  const url = new URL('./', self.location);
  return url.pathname;
};

const baseUrl = getBaseUrl();

const urlsToCache = [
  `${baseUrl}`,
  `${baseUrl}index.html`,
  `${baseUrl}styles.css`,
  `${baseUrl}app.jsx`,
  `${baseUrl}manifest.json`,
  `${baseUrl}Logo.png`,
  `${baseUrl}Header.jpg`,
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie de cache: Network First, puis Cache
self.addEventListener('fetch', event => {
  // Pour les requêtes Firebase, toujours aller sur le réseau
  if (event.request.url.includes('firebasestorage') || 
      event.request.url.includes('firebaseio') ||
      event.request.url.includes('googleapis')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone la réponse
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, chercher dans le cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // Si pas dans le cache, retourner une page offline basique
            if (event.request.destination === 'document') {
              return caches.match(`${baseUrl}index.html`);
            }
          });
      })
  );
});

// Gestion des messages du client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});