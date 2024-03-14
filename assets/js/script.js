$(function () {
    var searchButtonEl = $("#search")
    
    var apiKey = "72c7869051a25b990158d88c78993aa4"
    var limit = "5"
    
    function searchCityWeather(event) {
        event.preventDefault();
        var cityName = $("#city-name-input").val();
        console.log(cityName);

        findCityCoords(cityName)
        
        clearSearch();
    }

    function findCityCoords(cityName) {
        var coordAPIUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},US&limit=${limit}&appid=${apiKey}`
        fetch(coordAPIUrl)
        .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            console.log(data)
            console.log(data[0]);
            console.log(data[0].lon)
            console.log(data[0].lat)
            var cityLat = data[0].lat;
            var cityLon = data[0].lon;

            findCityWeather(cityLat, cityLon);
          });
    }

    function findCityWeather(lat, lon) {
        var currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
        var fiveDayURL = `api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

        fetch(currentWeatherURL)
        .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            console.log(data)
          });

        

    }

    function clearSearch() {
     $("#city-name-input").val("");
    };



    searchButtonEl.on("click", searchCityWeather);
    
        



});