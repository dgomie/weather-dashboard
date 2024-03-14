$.getScript('./assets/js/config.js', function() {
  console.log('API key loaded:', apiKey);
});

$(function () {
  var searchButtonEl = $("#search");
  
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
        findCityWeather(cityLat, cityLon);
        getFiveDayForecast(cityLat, cityLon);
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
        renderMainWeatherData(city, weatherConditions, temp, humidity, wind);
      });
  }

  function getFiveDayForecast(lat, lon) {
    var fiveDayURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&cnt=44&appid=${apiKey}`;

    fetch(fiveDayURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        var noonWeatherArray = [7, 15, 23, 31, 39];
        for (let i = 0; i < noonWeatherArray.length; i++) {
          var arrayItem = noonWeatherArray[i];
          var dailyWeatherData = data["list"][arrayItem];

          var dailyConditions = dailyWeatherData["weather"]["0"]["id"];
          var dailyTemp = dailyWeatherData["main"]["temp"];
          var dailyWind = dailyWeatherData["wind"]["speed"];
          var dailyHumidity = dailyWeatherData["main"]["humidity"];
          //   TODO: figure out how to get first day in 5day forecast to be one calendar day after main weather date.
          var unixDate = dailyWeatherData["dt"];
          var dailyDate = dayjs.unix(unixDate);
          var formattedDate = dailyDate.format("M/DD/YYYY");
          console.log(formattedDate);

          renderFiveDayForecast(
            i,
            formattedDate,
            dailyConditions,
            dailyTemp,
            dailyWind,
            dailyHumidity
          );
        }
      });
  }

  function renderMainWeatherData(city, conditions, temp, humidity, wind) {
    var mainCityEl = $("#current-city-name");
    var mainWeatherConditionsEl = $("#weather-conditions");
    var mainTempEl = $("#main-temp");
    var mainWindEl = $("#main-wind");
    var mainHumidityEl = $("#main-humidity");
    var currentDate = dayjs().format("M/DD/YYYY");

    mainCityEl.text(`${city} (${currentDate})`);
    mainTempEl.html(`Temp: ${Math.ceil(temp)} &deg;F`);
    mainWindEl.text(`Wind: ${wind} MPH`);
    mainHumidityEl.text(`Humidity: ${humidity}%`);
    mainWeatherConditionsEl.removeClass();

    if (conditions === 800) {
      mainWeatherConditionsEl.addClass("wi wi-day-sunny fs-4 m-1");
    } else if (conditions >= 200 && conditions < 300) {
      mainWeatherConditionsEl.addClass("wi wi-day-thunderstorm fs-4 m-1");
    } else if (conditions >= 300 && conditions < 400) {
      mainWeatherConditionsEl.addClass("wi wi-day-showers fs-4 m-1");
    } else if (conditions >= 500 && conditions < 600) {
      mainWeatherConditionsEl.addClass("wi wi-day-rain fs-4 m-1");
    } else if (conditions >= 600 && conditions < 700) {
      mainWeatherConditionsEl.addClass("wi wi-day-snow-wind fs-4 m-1");
    } else if (conditions >= 700 && conditions < 800) {
      mainWeatherConditionsEl.addClass("wi wi-day-haze fs-4 m-1");
    } else if (conditions >= 801 && conditions < 900) {
      mainWeatherConditionsEl.addClass("wi wi-day-cloudy fs-4 m-1");
    }
  }

  function renderFiveDayForecast(
    index,
    date,
    conditions,
    temp,
    wind,
    humidity
  ) {
    index++;
    var dateEl = $(`#day-${index}-date`);
    var conditionsEl = $(`#day-${index}-conditions`);
    var tempEl = $(`#day-${index}-temp`);
    var windEl = $(`#day-${index}-wind`);
    var humidityEl = $(`#day-${index}-humidity`);

    dateEl.text(date);
    tempEl.html(`Temp: ${Math.ceil(temp)} &deg;F`);
    windEl.text(`${wind} MPH`);
    humidityEl.text(`${humidity}%`);
    conditionsEl.removeClass();

    if (conditions === 800) {
      conditionsEl.addClass("wi wi-day-sunny fs-4 m-1");
    } else if (conditions >= 200 && conditions < 300) {
      conditionsEl.addClass("wi wi-day-thunderstorm fs-4 m-1");
    } else if (conditions >= 300 && conditions < 400) {
      conditionsEl.addClass("wi wi-day-showers fs-4 m-1");
    } else if (conditions >= 500 && conditions < 600) {
      conditionsEl.addClass("wi wi-day-rain fs-4 m-1");
    } else if (conditions >= 600 && conditions < 700) {
      conditionsEl.addClass("wi wi-day-snow-wind fs-4 m-1");
    } else if (conditions >= 700 && conditions < 800) {
      conditionsEl.addClass("wi wi-day-haze fs-4 m-1");
    } else if (conditions >= 801 && conditions < 900) {
      conditionsEl.addClass("wi wi-day-cloudy fs-4 m-1");
    }
  }

  function clearSearch() {
    $("#city-name-input").val("");
  }

  function createCityButton(city, lat, lon) {
    // TODO: create an if statement to checks if city button already exists
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
      getFiveDayForecast(lat, lon);
    });

    pastCityButtonsEl.append(newButton);
  }

  //   TODO: create function that saves cities to local storage
  //   function saveCitySearch(city, lat, lon) {}

  searchButtonEl.on("click", searchCityWeather);
});
