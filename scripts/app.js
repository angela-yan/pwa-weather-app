
(function() {
  'use strict';

  var initialWeatherForecast = {
    key: '-75.499901,43.000351',
    label: 'New York, USA',
    current: {
      dt: 1453489481,
      summary: 'Clear',
      icon: '01d@2x',
      temp: 52.74,
      feels_like: 74.34,
      pressure: 1002,
      humidity: 77,
      wind_deg: 125,
      wind_speed: 1.52,
      weather: [
        {
          id:721,
          main: 'Haze',
          description: 'haze',
          icon: '50d'
        }
      ]
    },
    daily: [
        {}, //same behavior as data from OWM, not used by the app 
        {
          weather: [
            {id: 802, main: "Clouds", description: "scattered clouds", icon: "03d"}, 
          ],
          temp: {day: 314.61, min: 308.55, max: 318.37, night: 314.05, eve: 318.37, morn: 308.55}
        },
        {
          weather: [
            {id: 802, main: "Thunderstorm", description: "light thunderstorm", icon: "11d"}, 
          ],
          temp: {day: 214.61, min: 208.55, max: 218.37, night: 214.05, eve: 218.37, morn: 208.55}
        },
        {
          weather: [
            {id: 802, main: "Drizzle", description: "shower drizzle", icon: "09d"}, 
          ],
          temp: {day: 224.61, min: 218.55, max: 228.37, night: 224.05, eve: 228.37, morn: 218.55}
        },
        {
          weather: [
            {id: 802, main: "Rain", description: "moderate rain", icon: "10d"}, 
          ],
          temp: {day: 234.61, min: 248.55, max: 238.37, night: 234.05, eve: 238.37, morn: 238.55}
        },
        {
          weather: [
            {id: 802, main: "Snow", description: "light snow", icon: "13d"}, 
          ],
          temp: {day: 244.61, min: 258.55, max: 248.37, night: 244.05, eve: 248.37, morn: 248.55}
        },
        {
          weather: [
            {id: 802, main: "Tornado", description: "tornado", icon: "50d"}, 
          ],
          temp: {day: 254.61, min: 268.55, max: 258.37, night: 254.05, eve: 258.37, morn: 258.55}
        },
        {
          weather: [
            {id: 802, main: "Clear", description: "clear sky", icon: "01d"}, 
          ],
          temp: {day: 324.61, min: 318.55, max: 328.37, night: 324.05, eve: 328.37, morn: 318.55}
        }


        // {icon: 'rain', temperatureMax: 55, temperatureMin: 34},
        // {icon: 'snow', temperatureMax: 55, temperatureMin: 34},
        // {icon: 'sleet', temperatureMax: 55, temperatureMin: 34},
        // {icon: 'fog', temperatureMax: 55, temperatureMin: 34},
        // {icon: 'wind', temperatureMax: 55, temperatureMin: 34},
        // {icon: 'partly-cloudy-day', temperatureMax: 55, temperatureMin: 34}
      ]
  };

  var app = {
    hasRequestPending: false,
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    OWM_API_KEY : "<NOTE!! Add personal OWM API key here!>"
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('butCurrentLocation').addEventListener('click', function() {
    // Refresh all of the forecasts
    app.getCurrentLocation();
  });

  document.getElementById('butRefresh').addEventListener('click', function() {
    // Refresh all of the forecasts
    app.updateForecasts();
  });

  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  document.getElementById('butAddCity').addEventListener('click', function() {
    // Add the newly selected city
    var select = document.getElementById('selectCityToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var geo = selected.value;
    var label = selected.textContent;
    app.getForecastbygeo(geo, label);
    //app.getForecast(key, label);
    app.selectedCities.push({key: geo, label: label});
    //app.selectedCities.push({key: key, label: label});
    app.saveSelectedCities();
    app.toggleAddDialog(false);
  });

  document.getElementById('butAddCancel').addEventListener('click', function() {
    // Close the add new city dialog
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

   // Get Current geolocation coordinates
  app.getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(app.geoSuccess, app.geoError);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Callback function for successfully getting geolocation
  app.geoSuccess = position => {
    var lat = parseFloat(position.coords.latitude).toFixed(8);
    var lon = parseFloat(position.coords.longitude).toFixed(8);
    console.log("lat:" + lat + " lon:" + lon);
    app.getCityNameFromGeocode(lat, lon);
  }

  // Callback function for failing to get geolocation
  app.geoError = () => {
    console.log("get geolocation failed.");
  }

  //Get area name/Country name based on geolocation
  app.getCityNameFromGeocode = function (lat, lon){
    var areaCountryName = "";
    var url = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat +
     '&longitude=' + lon +
     '&localityLanguage=en';

    fetch(url)
      .then (responseObj =>
      {
          return responseObj.json();
      })
      .then (response => {
          console.log('response from bigdatacloud: ', response);
          if(response.locality !== ""){
            areaCountryName += response.locality;
          }
          else{
            areaCountryName += response.city;
          }

          if(response.countryName !== "")
          {
            areaCountryName +=", " + response.countryName
          }
          console.log('areaCountryName: ', areaCountryName);

          var geo = lat + "," + lon;
          app.getForecastbygeo(geo, areaCountryName);
          app.selectedCities.push({key: geo, label: areaCountryName});
          app.saveSelectedCities();
      })
      .catch ( err => 
      {
        console.log("Fail to get current location name: ", err);
        var geo = lat + "," + lon;
        app.getForecastbygeo(geo, areaCountryName);
        app.selectedCities.push({key: geo, label: areaCountryName});
        app.saveSelectedCities();
      });

  }

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function(data) {
    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.location').textContent = data.label;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }

    // Find out when the element was last updated.
    const cardLastUpdatedElem = card.querySelector('.card-last-updated');
    const cardLastUpdated = cardLastUpdatedElem.textContent;
    const lastUpdated = parseInt(cardLastUpdated);

    // If the data on the element is newer, skip the update.
    if (lastUpdated >= data.current.dt) {
      return;
    }
    cardLastUpdatedElem.textContent = data.current.dt;

    card.querySelector('.description').textContent = data.current.weather[0].description;
     var timeoptions = { 
       weekday: 'short', 
       year: 'numeric', month: 'long', day: 'numeric', 
       hour: '2-digit', minute: '2-digit', second: '2-digit', 
       timeZone: data.timezone, timeZoneName:'long' };
   
     //{ dateStyle : 'full', timeStyle : 'long', timeZone: data.timezone };
    var localTimeString = new Date(data.current.dt * 1000).toLocaleString("en-US", timeoptions);
    //var localTimeString = localTime.toLocaleString("en-US", timeoptions);

    card.querySelector('.date').textContent =
      localTimeString.replace('at ', '');
    
    var iconEle = card.querySelector('.current .icon');
    if(iconEle)
    {
      //Checked the last added class, if it is not .icon, remove it.
      var lastClassString = iconEle.classList[iconEle.classList.length - 1];
      if(lastClassString !== "icon")
        iconEle.classList.remove(lastClassString);
    }
    card.querySelector('.current .icon').classList.add('i' + data.current.weather[0].icon);
    card.querySelector('.current .temperature .value').textContent =
      Math.round(data.current.temp);
    card.querySelector('.current .feels-like .value').textContent =
      Math.round(data.current.feels_like);
    card.querySelector('.current .pressure').textContent =
      Math.round(data.current.pressure) + 'hPa';
    card.querySelector('.current .humidity').textContent =
      Math.round(data.current.humidity) + '%';
    card.querySelector('.current .wind .value').textContent =
      Math.round(data.current.wind_speed);
    card.querySelector('.current .wind .direction').textContent =
      data.current.wind_deg;
    var nextDays = card.querySelectorAll('.future .oneday');
    var todayStringwithLocal = new Date(data.current.dt * 1000).toLocaleString("en-US", {timeZone: data.timezone});
    var todayDay = new Date(todayStringwithLocal);
    var today = todayDay.getDay();
    for (var i = 0; i < 7; i++) {
      var nextDay = nextDays[i];
      var daily = data.daily[i + 1];
      if (daily && nextDay) {
        nextDay.querySelector('.date').textContent =
          app.daysOfWeek[(i + today) % 7];

        iconEle = nextDay.querySelector('.icon');
        if (iconEle) {
          //Checked the last added class, if it is not .icon, remove it.
          var lastClassString = iconEle.classList[iconEle.classList.length - 1];
          if (lastClassString !== "icon")
            iconEle.classList.remove(lastClassString);
        }
        nextDay.querySelector('.icon').classList.add('i' + daily.weather[0].icon);
        nextDay.querySelector('.temp-high .value').textContent =
          Math.round(daily.temp.max);
        nextDay.querySelector('.temp-low .value').textContent =
          Math.round(daily.temp.min);
      }
    }
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };


  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/
  // Gets a forecast for a specific city by coordiantes and update the card with the data
  app.getForecastbygeo = function(geo, label) {
    var url = 'https://api.openweathermap.org/data/2.5/onecall?';
    var lan_lon = geo.split(",");
    url += "lat=" + lan_lon[0] + "&lon=" + lan_lon[1];
    url += "&exclude=minutely";
    url += "&appid=" + app.OWM_API_KEY;
    //url += key + '.json';
    if ('caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function(json) {
            // Only update if the XHR is still pending, otherwise the XHR
            // has already returned and provided the latest data.
            if (app.hasRequestPending) {
              console.log('updated from cache');
              json.key = geo;
              json.label = label;
              app.updateForecastCard(json);
            }
          });
        }
      });
    }
    // Make the XHR to get the data, then update the card
    app.hasRequestPending = true;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          response.key = geo;
          response.label = label;
          app.hasRequestPending = false;
          console.log('response from OWM: ', response);

          //Save real time weather data into local storage
          //But not used, since already using cache storage above
          if (typeof(Storage) !== "undefined") {
            var responseJson = JSON.stringify(response);
            // IMPORTANT: See notes about use of localStorage.
            localStorage.setItem(geo, responseJson);
          } 
          app.updateForecastCard(response);
        }
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Gets a forecast for a specific city and update the card with the data
  app.getForecast = function(key, label) {
    var url = 'https://publicdata-weather.firebaseio.com/';
    url += key + '.json';
    if ('caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function(json) {
            // Only update if the XHR is still pending, otherwise the XHR
            // has already returned and provided the latest data.
            if (app.hasRequestPending) {
              console.log('updated from cache');
              json.key = key;
              json.label = label;
              app.updateForecastCard(json);
            }
          });
        }
      });
    }
    // Make the XHR to get the data, then update the card
    app.hasRequestPending = true;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          response.key = key;
          response.label = label;
          app.hasRequestPending = false;
          app.updateForecastCard(response);
        }
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function() {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
      app.getForecastbygeo(key);
    });
  };

  // Save list of cities to localStorage, see note below about localStorage.
  app.saveSelectedCities = function() {
    var selectedCities = JSON.stringify(app.selectedCities);
    // IMPORTANT: See notes about use of localStorage.
    localStorage.selectedCities = selectedCities;
  };

  /************************************************************************
   *
   * Code required to start the app
   *
   * NOTE: To simplify this codelab, we've used localStorage.
   *   localStorage is a synchronous API and has serious performance
   *   implications. It should not be used in production applications!
   *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
   *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
   ************************************************************************/

  app.selectedCities = localStorage.selectedCities;
  if (app.selectedCities) {
    app.selectedCities = JSON.parse(app.selectedCities);
    app.selectedCities.forEach(function(city) {
      app.getForecastbygeo(city.key, city.label);
    });
  } else {
    app.updateForecastCard(initialWeatherForecast);
    //Get realtime data for intial city as well
    app.getForecastbygeo(initialWeatherForecast.key, initialWeatherForecast.label);
    app.selectedCities = [
      {key: initialWeatherForecast.key, label: initialWeatherForecast.label}
    ];
    app.saveSelectedCities();
  }

  var registration;

  if('serviceWorker' in navigator) {
    console.log('Service Worker is supported');

    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });

    // navigator.serviceWorker.register('service-worker-push-notifications.js').then(function() {
    //   return navigator.serviceWorker.ready;
    // }).then(function(serviceWorkerRegistration) {
    //   registration = serviceWorkerRegistration;
    //   console.log('Service Worker is ready :^)', registration);
    // }).catch(function(error) {
    //   console.log('Service Worker Error :^(', error);
    // });
  }

//   var subcription;
//   var isSubscribed = false;
//   var notificationsButton = document.getElementById('butNotifications');

//   notificationsButton.addEventListener('click', function() {
//     if (isSubscribed) {
//       unsubscribe();
//     } else {
//       subscribe();
//     }
//   });

//   function subscribe() {
//     registration.pushManager.subscribe({
//       userVisibleOnly: true
//     }).then(function(pushSubscription){
//       subcription = pushSubscription;
//       console.log('Subscribed! Endpoint:', subcription.endpoint);
//       isSubscribed = true;
//   });
// }

// function unsubscribe() {
//   subcription.unsubscribe().then(function(event) {
//     console.log('Unsubscribed!', event);
//     isSubscribed = false;
//   }).catch(function(error) {
//     console.log('Error unsubscribing', error);
//   });
// }

})();
