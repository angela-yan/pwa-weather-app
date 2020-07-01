# pwa-weather-app
PWA weather app for learning PWA and other frameworks

Code based on https://github.com/ArturKlajnerok/pwa-weather, which in turn is based on https://developers.google.com/web/fundamentals/getting-started/your-first-progressive-web-app/

## Local hosting

Visual Studio Code + Live server

## Features

- Use OpenWeahterMap (OWM) One Call API to query real time weather data for cities.
  * https://openweathermap.org/api/one-call-api

- Selected city list is saved in Local Storage.

- Realtime weather data and reverse geo-location data is cached in dynamic Cached Storage in service worker and local storage.

- Get current location weather data based on current geo-location and show location and country name use reserver geolocation API from BigDataCloud.
  * https://www.bigdatacloud.com/geocoding-apis/free-reverse-geocode-to-city-api

- Show online/offline status with Offlinee.js library. 
  * https://dyclassroom.com/reference-javascript/display-online-offline-connection-status-in-javascript-using-offline-js
  * https://github.com/hubspot/offline
	

## Before running the project
In apps.js file, replace personal OWM API key in the following location:

	OWM_API_KEY : "<NOTE!! Add personal OWM API key here!>"
