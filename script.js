//Store API Key
var apiKey = "17d70aa41cd7e635889b8094b07c4340"

function generateQueryURL(cityName) {
    //Query for today's forecast
    return "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
}

function generateQuery2URL(coord) {
    //Query for 5 day forecast
    return "https://api.openweathermap.org/data/2.5/onecall?lat=" + coord.lat + "&lon=" + coord.lon + "&units=imperial&appid=" + apiKey;
}

//Start querying using click listener
$("#search-button").on("click", function () {
    event.preventDefault()
    var cityName = $("#search").val();
    fetchWeatherData(cityName)
    // fetchForecastData(coord)
    createList(cityName);
});

function createList() {
    var cityName = $("#search").val();
    var listItem = $("<li>").text(cityName);
    $(".list-group").append(listItem);
  }

function extractWeatherData(response) {
    //Get the data from the returned API object
    var data = {}
    data.name = response.name
    data.date = moment.unix(response.dt).format("M/D/Y")
    data.icon = createIconURL(response.weather[0].icon)
    data.temp = Math.floor(response.main.temp - 273.15) * 1.80 + 32; 
    data.humidity = response.main.humidity;
    data.windspeed = response.wind.speed;
    return data
}

function extractFiveDayData(dataArray) {
    var fiveDays = []
    for (i = 0; i < 5; i++) {
        fiveDays.push(extractSingleDay(dataArray[i]))
    }
    // var data = {}
    // data.temp = (response.list.main.temp - 273.15) * 1.80 + 32;
    // data.humidity = response.list.main.humidity;
    // console.log(fiveDays)
    return fiveDays
}

function extractSingleDay(apiData) {
    var data = {}
    data.date = moment.unix(apiData.dt).format("M/D/Y")
    data.icon = createIconURL(apiData.weather[0].icon)
    data.temp = apiData.temp.day
    data.humidity = apiData.humidity
    return data
}

function fetchWeatherData(cityName) {
    var queryURL = generateQueryURL(cityName)
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        // console.log(response)
        fetchForecastData(response.coord)
        // console.log(response)
        var data = extractWeatherData(response);
        fetchUvData(response).then(function (UVresponse) {
            // console.log("uvdata", UVresponse)
            var uvIndex = UVresponse.value
            $("#current-city").empty();
            $("#current-city").append(createCurrentWeatherDivs(data, uvIndex));
        })
        // console.log(data)
    });
}

function fetchUvData({ coord }) {
    var queryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + coord.lat + "&lon=" + coord.lon;
    return $.ajax({
        url: queryURL,
        method: "GET"
    })
}

function fetchForecastData(coord) {
    var queryURL = generateQuery2URL(coord)
    // console.log(queryURL)
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        // console.log(response)
        var data = extractFiveDayData(response.daily);
        var forecastContainer = createFiveDayDivs(data)
        $("#fivedayforecast").empty();
            $("#fivedayforecast").append(forecastContainer)
        // console.log(data)
    });
}

function createCurrentWeatherDivs(data, uvIndex) {
    // console.log(data)
    var currentWeatherDiv = $("<div>")
    var topRow = $("<div class='top-row'>")
    var cString = `<span class='main-title'>${data.name} </span><span class='main-title'>${data.date}</span><img src='${data.icon}'>`
    var tString = `<p>Temperature: ${data.temp}°F</p>`
    var hString = `<p>Humidity: ${data.humidity}%</p>`
    var wString = `<p>Windspeed: ${data.windspeed} MPH</p>`
    var uString = `<p>UV Index: ${uvIndex}</p>`
    var c = $(cString)
    var t = $(tString)
    var h = $(hString)
    var w = $(wString)
    var u = $(uString)
    topRow.append(c)
    currentWeatherDiv.append(topRow)
    currentWeatherDiv.append(t)
    currentWeatherDiv.append(h)
    currentWeatherDiv.append(w)
    currentWeatherDiv.append(u)
    return currentWeatherDiv
}

function createFiveDayDivs(arrayOfDays) {
    var forecastContainer = $("<div class='weatherclass'>")
    for (i = 0; i < arrayOfDays.length; i++) {
        var card = createForecastCard(arrayOfDays[i])
        forecastContainer.append(card)
    }
    return forecastContainer
}

function createForecastCard(data) {
    console.log(data)
    var singleDayDiv = $("<div class='single-card'>")
    var mString = $(`<h2>${data.date}</h2>`)
    var iString = $(`<img src='${data.icon}'>`)
    var pString = $(`<p>Temperature: ${data.temp}°F</p>`)
    var bString = $(`<p>Humidity: ${data.humidity}%</p>`)
    return singleDayDiv.append(mString, iString, pString, bString)
}

function createIconURL(icon) {
    return "http://openweathermap.org/img/wn/" + icon + "@2x.png"
}