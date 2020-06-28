var dataCacheName = 'weatherData-v7';
var staticCacheName = 'weatherPWA-step-7-2';
const MaxDataCacheSize = 20;
var filesToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/scripts/app.js',
  '/styles/inline.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png',
  '/images/ic_notifications_white_24px.svg'
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
  var dataUrl = 'https://publicdata-weather.firebaseio.com/';
  if (e.request.url.indexOf(dataUrl) === 0) {
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
  } else {
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
