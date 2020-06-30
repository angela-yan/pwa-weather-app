# pwa-weather-app
PWA weather app for learning PWA and other frameworks

Code based on https://github.com/ArturKlajnerok/pwa-weather, which in turn is based on https://developers.google.com/web/fundamentals/getting-started/your-first-progressive-web-app/

## Local hosting

Visual Studio Code + Live server

## Features

Use OpenWeahterMap (OWM) One Call API to query real time weather data for cities.
Selected city list is saved in Local Storage.
Realtime weather data is cached in Cached Storage in service worker.


## Before running the project
In apps.js file, replace personal OWM API key in the following location:
	OWM_API_KEY : "<NOTE!! Add personal OWM API key here!>"