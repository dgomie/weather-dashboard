$(function () {
  var apiKey = "bb7b7deb2ff7e1bdb30279ceac88462c";

  var searchButtonEl = $("#search");

  // Takes input value from city search and invokes findCityCoords(), then clears the search box.
  function searchCityWeather(event) {
    event.preventDefault();
    var cityName = $("#city-name-input").val();

    findCityCoords(cityName);
    clearSearch();
  }

  // Fetches searched city latitude and longitude. Alerts user if city can't be found. If found, invokes findCityWeather(), getFiveDayForcast(), saveToLocalStorage(), and createCityButtons()
  function findCityCoords(cityName) {
    var limit = "1";
    var coordAPIUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${limit}&appid=${apiKey}`;
    fetch(coordAPIUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.length === 0) {
          //add validation if cityName input returns no results
          return alert("Cannot find city name. Please try again.");
        } else {
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

  // Fetches current weather for searched city by using lat and lon. Invokes renderMainWeatherData() to render data on screen.
  function findCityWeather(lat, lon) {
    var currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    fetch(currentWeatherURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // console.log(data);
        var city = data["name"];
        var temp = data["main"]["temp"];
        var humidity = data["main"]["humidity"];
        var wind = data["wind"]["speed"];
        var weatherConditions = data["weather"][0]["id"];
        renderMainWeatherData(city, weatherConditions, temp, humidity, wind);
      });
  }

  // Fetches the 5 day forecast information for searched city based on lat and lon. Then invokes renderFiveDayForecast function.
  function getFiveDayForecast(lat, lon) {
    var fiveDayURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&cnt=44&appid=${apiKey}`;

    fetch(fiveDayURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // console.log(data);
        var highTemps = getHighTemperatures(data);
        var timeStampArray = [0, 8, 16, 24, 32];

        for (let i = 0; i < timeStampArray.length; i++) {
          var arrayItem = timeStampArray[i];
          var dailyWeatherData = data["list"][arrayItem];
          var dailyConditions = dailyWeatherData["weather"]["0"]["id"];
          var dailyWind = dailyWeatherData["wind"]["speed"];
          var dailyHumidity = dailyWeatherData["main"]["humidity"];

          var unixDate = dailyWeatherData["dt"];
          var dailyDate = dayjs.unix(unixDate);
          var formattedDate = dailyDate.format("M/DD/YYYY");
          var dailyTemp = highTemps[formattedDate];

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
  // Renders the current weather data into the main weather section in html. Invokes renderWeatherIcon function to determine weather conditions for the current day.
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

  // Renders the 5 day forecast data to screen. Invokes renderWeatherIcon function to determine weather conditions for each of the 5 days.
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
    windEl.text(`Wind: ${Math.ceil(wind)} MPH`);
    humidityEl.text(`Humidity: ${humidity}%`);
    conditionsEl.removeClass();

    renderWeatherIcon(conditionsEl, conditions);
  }
  // Clears search box by replacing search value with an empty string
  function clearSearch() {
    $("#city-name-input").val("");
  }

  // Clears the city buttons from the parent element
  function clearCityButtons() {
    var buttonsParentEl = $("#past-city-buttons");
    buttonsParentEl.empty();
  }

  // Creates a button from previously searched city that's been saved in localStorage. Button will repopulate weather with button city's forecast
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

        (function (lat, lon) {
          newButton.on("click", function () {
            findCityWeather(lat, lon);
            getFiveDayForecast(lat, lon);
          });
        })(lat, lon);

        pastCityButtonsEl.append(newButton);
      }
    }
  }

  // Looks through the condition code for day and changes html element argument to display appropiate weather condition icon
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

  // Saves searched city's name, latitude and longitude to localStorage
  function saveToLocalStorage(city, lat, lon) {
    var cityData = {
      cityName: city,
      cityLat: lat,
      cityLon: lon,
    };

    var storedData = JSON.parse(localStorage.getItem("cityData")) || [];
    for (let i = 0; i < storedData.length; i++) {
      if (storedData[i]["cityName"] === cityData["cityName"]) {
        return;
      }
    }

    if (storedData.length > 9) {
      storedData.shift();
    }
    storedData.push(cityData);
    localStorage.setItem("cityData", JSON.stringify(storedData));
  }

  // Iterates over 5 day forecast timestamps to find highest temp for each day
  function getHighTemperatures(forecastData) {
    var highTemps = {};

    forecastData.list.forEach(function (forecast) {
      var date = forecast["dt_txt"].split(" ")[0];
      var reformattedDate = dayjs(date).format("M/DD/YYYY");

      // If the date is not in the highTemps object, add it with the current temperature
      if (!highTemps[reformattedDate]) {
        highTemps[reformattedDate] = forecast.main.temp_max;
      } else {
        // If the date is already in the object, update the high temperature if necessary
        if (forecast.main.temp_max > highTemps[reformattedDate]) {
          highTemps[reformattedDate] = forecast.main.temp_max;
        }
      }
    });
    // console.log(highTemps)
    return highTemps;
  }

  createCityButtons(); //start every page load with previous searches if any in localStorage
  searchButtonEl.on("click", searchCityWeather);
});
