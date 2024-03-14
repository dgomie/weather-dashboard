$(function () {
  var searchButtonEl = $("#search");

  var apiKey = "72c7869051a25b990158d88c78993aa4";
  var limit = "1";

  function searchCityWeather(event) {
    event.preventDefault();
    var cityName = $("#city-name-input").val();
    console.log(cityName);

    findCityCoords(cityName);

    clearSearch();
  }

  function findCityCoords(cityName) {
    var coordAPIUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},US&limit=${limit}&appid=${apiKey}`;
    fetch(coordAPIUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        console.log(data[0].name);
        console.log(data[0].lon);
        console.log(data[0].lat);
        var cityNameData = data[0].name;
        var cityLat = data[0].lat;
        var cityLon = data[0].lon;

        createCityButton(cityNameData, cityLat, cityLon);
        // findCityWeather(cityLat, cityLon);
        fiveDayForecast(cityLat, cityLon);
      });
  }

  function findCityWeather(lat, lon) {
    var currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    fetch(currentWeatherURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        console.log("City name: " + data["name"]);
        var city = data["name"];
        console.log("temp: " + data["main"]["temp"]);
        var temp = data["main"]["temp"];
        console.log("humidity: " + data["main"]["humidity"]);
        var humidity = data["main"]["humidity"];
        console.log("wind: " + data["wind"]["speed"]);
        var wind = data["wind"]["speed"];
        console.log("conditions: " + data["weather"][0]["id"]);
        var weatherConditions = data["weather"][0]["id"];
        renderWeatherData(city, weatherConditions, temp, humidity, wind);
      });
  }

  function fiveDayForecast(lat, lon) {
    var fiveDayURL = `api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    fetch(fiveDayURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
      });
  }

  function renderWeatherData(city, conditions, temp, humidity, wind) {
    var mainCityEl = $("#current-city-name");
    var mainWeatherConditionsEl = $("#weather-conditions");
    var mainTempEl = $("#main-temp");
    var mainWindEl = $("#main-wind");
    var mainHumidityEl = $("#main-humidity");

    mainCityEl.text(city);
    mainTempEl.html(`Temp: ${temp} &deg;F`);
    mainWindEl.text(`Wind: ${wind} MPH`);
    mainHumidityEl.text(`Humidity: ${humidity}%`);

    if (conditions === 800) {
      mainWeatherConditionsEl.addClass("wi wi-day-sunny");
    } else if (conditions >= 200 && conditions < 300) {
      mainWeatherConditionsEl.addClass("wi wi-day-thunderstorm");
    } else if (conditions >= 300 && conditions < 400) {
      mainWeatherConditionsEl.addClass("wi wi-day-showers");
    } else if (conditions >= 500 && conditions < 600) {
      mainWeatherConditionsEl.addClass("wi wi-day-rain");
    } else if (conditions >= 600 && conditions < 700) {
      mainWeatherConditionsEl.addClass("wi wi-day-snow-wind");
    } else if (conditions >= 700 && conditions < 800) {
      mainWeatherConditionsEl.addClass("wi wi-day-haze");
    } else if (conditions >= 801 && conditions < 900) {
      mainWeatherConditionsEl.addClass("wi wi-day-cloudy");
    }
  }

  function clearSearch() {
    $("#city-name-input").val("");
  }

  function createCityButton(city, lat, lon) {
    var pastCityButtonsEl = $("#past-city-buttons");
    var newButton = $("<button>");
    newButton.attr("id", `#${city}`);
    newButton.attr("city", `#${city}`);
    newButton.addClass(
      "btn btn-secondary text-light col-12 my-1 nanum-gothic-regular"
    );
    newButton.text(city);
    newButton.on("click", function () {
      findCityWeather(lat, lon);
    });

    pastCityButtonsEl.append(newButton);
  }

  function saveCitySearch(city, lat, lon) {}

  searchButtonEl.on("click", searchCityWeather);
});
