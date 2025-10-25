// JavaScript file for the Weather Application 
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");
const addToFavBtn = document.getElementById('addToFavBtn'); // Select the Add to Favourites button
const weatherInputDiv = document.querySelector(".weather-input"); // Added selector for the parent container

const API_KEY = "4e75be8e17dc6b780ba1f05afee3a368";  // OpenWeatherMap API key

// Helper function to convert Kelvin to Celsius
const kelvinToCelsius = (tempK) => (tempK - 273.15).toFixed(2);

// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, aqiText, index) => {
    // Temperature conversion from Kelvin (default OpenWeatherMap) to Celsius
    const tempCelsius = kelvinToCelsius(weatherItem.main.temp);
    const weatherIcon = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`;
    
    if (index === 0) {  // Main weather card (Current Weather)
        return `
            <div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4>Temperature: ${tempCelsius}°C</h4> 
                <h4>Wind Speed: ${weatherItem.wind.speed} M/s</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                <h4>Air Quality: ${aqiText}</h4>
            </div>
            <div class="icon">
                <img src="${weatherIcon}" alt="weather-icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>
            <div class="graph-sec">
                <img src="graph.png" alt="line-graph" id="line-grap">
            </div>`;
    } else { // Forecast cards (Day 2 to 5)
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
const getAirQuality = async (lat, lon) => {
    const AQI_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    
    try {
        const res = await fetch(AQI_API_URL);
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
        }
        const data = await res.json();
        const aqi = data.list[0].main.aqi; // Get AQI value (1=Good, 5=Very Poor)
        const aqiDescription = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
        const aqiText = aqiDescription[aqi - 1] || "Unknown";
        return aqiText;
    } catch (error) {
        console.error("Error fetching air quality data:", error);
        return "Unavailable";
    }
};

// Function to get weather details based on city coordinates
const getWeatherDetails = async (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    
    try {
        const weatherRes = await fetch(WEATHER_API_URL);
        if (!weatherRes.ok) {
            throw new Error(`HTTP error! Status: ${weatherRes.status} - ${weatherRes.statusText}`);
        }
        const weatherData = await weatherRes.json();
        
        // Filter the forecast to get one entry per day, ideally around noon (12:00:00)
        const uniqueForecastDays = [];
        const fiveDaysForecast = weatherData.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate) && forecast.dt_txt.includes("12:00:00")) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        }).slice(0, 5); // Ensure a maximum of 5 days

        // Get Air Quality Index
        const aqiText = await getAirQuality(lat, lon);

        // Clear previous data
        cityInput.value = cityName; // Update input with correct city name
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";
        
        // Populate current weather and 5-day forecast
        if (fiveDaysForecast.length > 0) {
            currentWeatherDiv.innerHTML = createWeatherCard(cityName, fiveDaysForecast[0], aqiText, 0);

            // Populate the rest of the 5-day forecast cards
            fiveDaysForecast.slice(1).forEach((weatherItem, index) => {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, aqiText, index + 1));
            });
        }

        // FIX: Add the class here to apply the spacing fix
        weatherInputDiv.classList.add('map-active');
        
        // Update the map
        updateMap(lat, lon);

    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("An error occurred while fetching the weather forecast: " + error.message);
    }
};

// Function to get city coordinates
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return alert("Please enter a city name.");

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
            throw new Error(`No coordinates found for "${cityName}".`);
        }

        const { lat, lon, name } = data[0];
        // Use the name from the geocoding API for accurate city display
        getWeatherDetails(name, lat, lon);
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
                    if (!data || data.length === 0) {
                        throw new Error("Could not reverse geocode your location.");
                    }
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(error => alert("An error occurred while fetching the city! " + error.message));
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please allow location access to use this feature.");
            } else {
                 alert("An error occurred getting your location: " + error.message);
            }
        }
    );
};

// Event listeners for search functionality
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

// Windy API setup (Left as is, assuming a valid API key is used)
const options = {
    key: 'H3MzWInDcItupZcD6PvvOdQ92hG6mNKw', // Replace with your actual Windy API key
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
    const newZoom = 12; 
    if (windyAPI && windyAPI.map && typeof windyAPI.map.setView === 'function') {
        windyAPI.map.setView([lat, lon], newZoom); 
    } else {
        console.error("Windy API map object or setView method not available.");
    }
};


// Dark mode functionality (left as is)
const darkModeToggle = document.querySelector('.dark-mode-toggle');
const body = document.body;
const icon = darkModeToggle.querySelector('i');

// Initialize dark mode based on saved preference
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
}

// Toggle dark mode on button click
darkModeToggle.addEventListener('click', function () {
    body.classList.toggle('dark-mode');

    // Toggle the icons between sun and moon
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('darkMode', 'enabled'); // Save preference to localStorage
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('darkMode', 'disabled'); // Save preference to localStorage
    }
});

// ===== Favourite Locations Feature Fix and Enhancement =====

// Load favourites from localStorage
let favourites = JSON.parse(localStorage.getItem('favourites') || "[]");

// Helper: Render favourite city list
function renderFavourites() {
    const favListEl = document.getElementById('favouritesList');
    favListEl.innerHTML = '';
    
    if (favourites.length === 0) {
        const li = document.createElement('li');
        li.textContent = "No favourites yet. Search a city and click 'Add'!";
        li.style.cssText = "font-style: italic; background: none; color: #666; justify-content: center;";
        favListEl.appendChild(li);
        return;
    }

    favourites.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.classList.add('fav-item');

        // Fix: On click, set the city input value and trigger the search function
        li.addEventListener('click', () => {
            cityInput.value = city;
            getCityCoordinates();
        });

        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = "✕";
        removeBtn.classList.add('remove-btn');
        removeBtn.setAttribute('aria-label', `Remove ${city} from favourites`);
        
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the li click event from triggering
            removeFavourite(city);
        });

        li.appendChild(removeBtn);
        favListEl.appendChild(li);
    });
}

// Add to favourites
function addFavourite(cityName) {
    if (!cityName) return alert("Please search and select a city name to add to favourites.");

    // Capitalize first letter for consistent display
    const formattedCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase();

    if (!favourites.includes(formattedCityName)) {
        favourites.push(formattedCityName);
        localStorage.setItem('favourites', JSON.stringify(favourites));
        renderFavourites();
        alert(`${formattedCityName} added to favourites!`);
    } else {
        alert(`${formattedCityName} is already in favourites.`);
    }
}

// Remove a favourite
function removeFavourite(cityName) {
    favourites = favourites.filter(c => c !== cityName);
    localStorage.setItem('favourites', JSON.stringify(favourites));
    renderFavourites();
    // Optional: Alert or notification here
}

// Handle "Add to favourites" button
addToFavBtn.addEventListener('click', () => {
    // Fix: Use the value of the main city input field
    const currentCity = cityInput.value.trim();
    addFavourite(currentCity);
});

// Render favourites on load
document.addEventListener('DOMContentLoaded', renderFavourites);