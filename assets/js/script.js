$(function () {
  var apiKey = "bb7b7deb2ff7e1bdb30279ceac88462c";
  // var apiKey = "d91f911bcf2c0f925fb6535547a5ddc9"

  var searchButtonEl = $("#search");

  function searchCityWeather(event) {
    event.preventDefault();
    var cityName = $("#city-name-input").val();

    findCityCoords(cityName);

    clearSearch();
  }

  function findCityCoords(cityName) {
    var limit = "5";
    var coordAPIUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},US&limit=${limit}&appid=${apiKey}`;
    fetch(coordAPIUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        if (data.length === 0) {
          //add validation if cityName input returns no results
          return alert("Cannot find city name. Please try again.");
        } else {
          // console.log(data[0].name);
          // console.log(data[0].lon);
          // console.log(data[0].lat);
          var cityNameData = data[0].name;
          var cityLat = data[0].lat;
          var cityLon = data[0].lon;

          findCityWeather(cityLat, cityLon);
          getFiveDayForecast(cityLat, cityLon);
          saveToLocalStorage(cityNameData, cityLat, cityLon);
          createCityButtons();
        }
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
        // console.log("City name: " + data["name"]);
        var city = data["name"];
        // console.log("temp: " + data["main"]["temp"]);
        var temp = data["main"]["temp"];
        // console.log("humidity: " + data["main"]["humidity"]);
        var humidity = data["main"]["humidity"];
        // console.log("wind: " + data["wind"]["speed"]);
        var wind = data["wind"]["speed"];
        // console.log("conditions: " + data["weather"][0]["id"]);
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
        var timeStampArray = [8, 16, 24, 32, 39];
        for (let i = 0; i < timeStampArray.length; i++) {
          var arrayItem = timeStampArray[i];
          var dailyWeatherData = data["list"][arrayItem];

          var dailyConditions = dailyWeatherData["weather"]["0"]["id"];
          var dailyTemp = dailyWeatherData["main"]["temp_max"];
          var dailyWind = dailyWeatherData["wind"]["speed"];
          var dailyHumidity = dailyWeatherData["main"]["humidity"];

          var unixDate = dailyWeatherData["dt"];
          var dailyDate = dayjs.unix(unixDate);
          var formattedDate = dailyDate.format("M/DD/YYYY");

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
    mainWindEl.text(`Wind: ${Math.ceil(wind)} MPH`);
    mainHumidityEl.text(`Humidity: ${humidity}%`);
    mainWeatherConditionsEl.removeClass();

    renderWeatherIcon(mainWeatherConditionsEl, conditions);
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
    windEl.text(`${Math.ceil(wind)} MPH`);
    humidityEl.text(`${humidity}%`);
    conditionsEl.removeClass();

    renderWeatherIcon(conditionsEl, conditions);
  }

  function clearSearch() {
    $("#city-name-input").val("");
  }

  function clearCityButtons() {
    var buttonsParentEl = $("#past-city-buttons");
    buttonsParentEl.empty();
  }

  function createCityButtons() {
    clearCityButtons();
    var storedData = JSON.parse(localStorage.getItem("cityData"));
    if (storedData !== null) {
      for (let i = 0; i < storedData.length; i++) {
        var city = storedData[i]["cityName"];
        var lat = storedData[i]["cityLat"];
        var lon = storedData[i]["cityLon"];

        var pastCityButtonsEl = $("#past-city-buttons");
        var newButton = $("<button>");
        newButton.attr("id", `#${city}`);
        newButton.attr("city", `#${city}`);
        newButton.addClass(
          "btn btn-secondary text-light col-12 my-1 nanum-gothic-regular"
        );
        newButton.text(city);
    
        (function(lat, lon) {
          newButton.on("click", function () {
              findCityWeather(lat, lon);
              getFiveDayForecast(lat, lon);
          });
        })(lat, lon);

        pastCityButtonsEl.append(newButton);
      }
    }
  }

  function renderWeatherIcon(element, conditions) {
    if (conditions === 800) {
      element.addClass("wi wi-day-sunny fs-4 m-1");
    } else if (conditions >= 200 && conditions < 300) {
      element.addClass("wi wi-day-thunderstorm fs-4 m-1");
    } else if (conditions >= 300 && conditions < 400) {
      element.addClass("wi wi-day-showers fs-4 m-1");
    } else if (conditions >= 500 && conditions < 600) {
      element.addClass("wi wi-day-rain fs-4 m-1");
    } else if (conditions >= 600 && conditions < 700) {
      element.addClass("wi wi-day-snow-wind fs-4 m-1");
    } else if (conditions >= 700 && conditions < 800) {
      element.addClass("wi wi-day-haze fs-4 m-1");
    } else if (conditions >= 801 && conditions < 900) {
      element.addClass("wi wi-day-cloudy fs-4 m-1");
    }
  }

  function saveToLocalStorage(city, lat, lon) {
    var cityData = {
      cityName: city,
      cityLat: lat,
      cityLon: lon,
    };
    
    var storedData = JSON.parse(localStorage.getItem("cityData")) || [];
    console.log("storedData", storedData);

    for (let i = 0; i < storedData.length; i++) {
      if (storedData[i]["cityName"] === cityData["cityName"]) {
        console.log("City already saved");
        return;
      }
    }

    storedData.push(cityData);
    localStorage.setItem("cityData", JSON.stringify(storedData));
    // console.log("New City Saved");
  }
  createCityButtons();
  searchButtonEl.on("click", searchCityWeather);
});
