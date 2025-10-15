// JavaScript file for the Weather Application
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");

const API_KEY = "dc1c001e2cc412d3173b6a35164eb8aa"; // OpenWeatherMap API key key

// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, index, aqiText) => {
    const tempCelsius = (weatherItem.main.temp - 273.15).toFixed(2);
    const weatherIcon = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`;

    if (index === 0) { // Main weather card
        return `
            <div class="details">
                <h2>${cityName}</h2>
                <h4>${weatherItem.dt_txt.split(" ")[0]}</h4>
                <h4>Wind Speed: ${weatherItem.wind.speed} M/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                <h4>Air Quality: ${aqiText}</h4>
            </div>
            <img src="graph.png" alt="line-graph" id="line-grap">
            <div class="icon">
                <img src="${weatherIcon}" alt="weather-icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    } else { // Forecast cards
        return `
            <li class="card">
                <h3>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="${weatherIcon}" alt="weather-icon">
                <h4>Desc: ${weatherItem.weather[0].description}</h4>
                <h4>Temperature: ${tempCelsius}°C</h4>
                <h4>Wind Speed: ${weatherItem.wind.speed} M/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                <h4>Air Quality: ${aqiText}</h4>
            </li>`;
    }
};

// Function to get air quality index
const getAirQuality = (lat, lon) => {
    const AQI_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    return fetch(AQI_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            const aqi = data.list[0].main.aqi; // Get AQI value
            const aqiDescription = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
            const aqiText = aqiDescription[aqi - 1] || "Unknown";
            return aqiText;
        })
        .catch(error => {
            console.error("Error fetching air quality data:", error);
            return "Unavailable";
        });
};

// Function to get weather details based on city coordinates
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            return getAirQuality(lat, lon)
                .then(aqiText => {
                    fiveDaysForecast.forEach((weatherItem, index) => {
                        if (index === 0) {
                            currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index, aqiText));
                        } else {
                            weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index, aqiText));
                        }
                    });
                    updateMap(lat, lon);
                });
        })
        .catch(error => {
            console.error("Error fetching weather forecast:", error);
            alert("An error occurred while fetching the weather forecast: " + error.message);
        });
};

// Function to get city coordinates
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                throw new Error("No weather data available for this location.");
            }
            const { lat, lon } = data[0];
            getWeatherDetails(cityName, lat, lon);
        })
        .catch(error => {
            console.error("Error fetching city coordinates:", error);
            alert("An error occurred while fetching city coordinates: " + error.message);
        });
};

// Function to get user's current coordinates
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => alert("An error occurred while fetching the city!"));
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please allow location access.");
            }
        }
    );
};

// Event listeners
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

// Windy API setup
const options = {
    key: 'H3MzWInDcItupZcD6PvvOdQ92hG6mNKw', // Replace with your Windy API key
    lat: 19.0760, // Default latitude for Mumbai
    lon: 72.8777, // Default longitude for Mumbai
    zoom: 10,
};

let windyAPI;

// Initialize the Windy map
windyInit(options, (api) => {
    windyAPI = api;
});

// Function to update the Windy map with new coordinates
const updateMap = (lat, lon) => {
    if (windyAPI) {
        if (typeof windyAPI.map.setView === 'function') {
            windyAPI.map.setView([lat, lon], 12);
        } else {
            console.error("setView method not available on windyAPI.map");
        }
    } else {
        console.error("Windy API not initialized.");
    }
};

// Dark mode functionality
const darkModeToggle = document.querySelector('.dark-mode-toggle');
const body = document.body;
const icon = darkModeToggle.querySelector('i');

if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
}

darkModeToggle.addEventListener('click', function () {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('darkMode', 'disabled');
    }
});