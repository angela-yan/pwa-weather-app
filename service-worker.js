var dataCacheName = 'weatherData-v35';
var staticCacheName = 'weatherPWA-step-7-46';
const MaxDataCacheSize = 20;
var filesToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/scripts/app.js',
  '/scripts/offline.min.js',
  '/styles/inline.css',
  '/styles/offline-theme-default.css',
  '/styles/offline-language-english-indicator.css',
  '/images/ic_add_white_24px.svg',
  '/images/ic_notifications_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/ic_place-marker_24px.svg',
  '/images/icons/icon-144x144.png',
  '/images/01n@2x.png',
  '/images/02n@2x.png',
  '/images/03n@2x.png',
  '/images/04n@2x.png',
  '/images/09n@2x.png',
  '/images/10n@2x.png',
  '/images/11n@2x.png',
  '/images/13n@2x.png',
  '/images/50n@2x.png',
  '/images/01d@2x.png',
  '/images/02d@2x.png',
  '/images/03d@2x.png',
  '/images/04d@2x.png',
  '/images/09d@2x.png',
  '/images/10d@2x.png',
  '/images/11d@2x.png',
  '/images/13d@2x.png',
  '/images/50d@2x.png'
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== staticCacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUrl = 'https://api.openweathermap.org/data/2.5';
  var locationURL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
  if (e.request.url.indexOf(dataUrl) === 0 ||
      e.request.url.indexOf(locationURL) === 0) {
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          return caches.open(dataCacheName).then(function(cache) {
            cache.put(e.request.url, response.clone());
            console.log('[ServiceWorker] Fetched&Cached Data');           
            return response;
          });
        })
    );
  } 
  else if(e.request.url.indexOf('favicon.ico?_=') > -1)
  {
      //To check whether it is offline
      //Don't save into cache storage, use default handling
  }
  else{
    e.respondWith(
      //For non-weather data, look from cache first.
      //If not found, fetch and save into datacache
      //May need to review later to see if need to save all data
      caches.match(e.request).then(function (response) {
        return response || fetch(e.request).then(fetchRes => {
          return caches.open(dataCacheName).then(cache => {
            cache.put(e.request.url, fetchRes.clone());
            // check cached items size
            limitCacheSize(dynamicCacheName, MaxDataCacheSize);
            return fetchRes;
          })
        });
      }).catch(() => {
        if(e.request.url.indexOf('.html') > -1){
          return caches.match('/offline.html');
        } 
      })
    );
  }
});
