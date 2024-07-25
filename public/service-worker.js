// public/service-worker.js
self.addEventListener('install', (event) => {
    console.log('Service worker installed');
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service worker activated');
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('Service worker intercepting fetch');
      })
    );
  });
  