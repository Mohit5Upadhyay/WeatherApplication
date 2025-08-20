// JavaScript file for the Weather Application 
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");

const API_KEY = "eb25bb98e70091ae7787a643b17b1686";  // OpenWeatherMap API key

// Function to create weather card HTML
const createWeatherCard = (cityName, weatherItem, index, aqiText) => {
    const tempCelsius = (weatherItem.main.temp - 273.15).toFixed(2);
    const weatherIcon = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`;
    
    if (index === 0) {  // Main weather card
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
            const aqi = data.list[0].main.aqi;
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
    console.log("Fetching weather data from:", WEATHER_API_URL);
    
    fetch(WEATHER_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Weather Data:", data);
            
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Clear previous data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Create weather cards
            return getAirQuality(lat, lon)
            .then(aqiText => {
                fiveDaysForecast.forEach((weatherItem, index) => {
                    if (index === 0) {
                        currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index, aqiText));
                    } else {
                        weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index, aqiText));
                    }
                });

                console.log(`Updating map to: Latitude: ${lat}, Longitude: ${lon}`);
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
        console.log("Geocoding Data:", data);
        if (!data || data.length === 0) {
            throw new Error("No weather data available for this location.");
        }

        const { lat, lon } = data[0];
        personalizedGetWeatherDetails(cityName, lat, lon);
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
    key: 'H3MzWInDcItupZcD6PvvOdQ92hG6mNKw',
    lat: 19.0760,
    lon: 72.8777,
    zoom: 10,
};

let windyAPI;

// Initialize the Windy map
windyInit(options, (api) => {
    windyAPI = api;
});

// Function to update the Windy map with new coordinates
const updateMap = (lat, lon) => {
    console.log(`Updating map to: Latitude: ${lat}, Longitude: ${lon}`);
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

// Initialize dark mode based on saved preference
const savedDarkMode = JSON.parse(sessionStorage.getItem('darkMode') || 'false');
if (savedDarkMode) {
    body.classList.add('dark-mode');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
}

// Toggle dark mode on button click
darkModeToggle.addEventListener('click', function () {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        sessionStorage.setItem('darkMode', 'true');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        sessionStorage.setItem('darkMode', 'false');
    }
});

// Enhanced Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(sessionStorage.getItem('weatherApp_users') || '{}');
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkLoginStatus();
    }

    bindEvents() {
        // Modal controls
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const closeLogin = document.getElementById('close-login');
        const closeSignup = document.getElementById('close-signup');

        // Modal show/hide
        loginBtn?.addEventListener('click', () => this.showModal('login'));
        signupBtn?.addEventListener('click', () => this.showModal('signup'));
        closeLogin?.addEventListener('click', () => this.hideModal('login'));
        closeSignup?.addEventListener('click', () => this.hideModal('signup'));

        // Modal switch
        document.getElementById('switch-to-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('login');
            setTimeout(() => this.showModal('signup'), 100);
        });

        document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('signup');
            setTimeout(() => this.showModal('login'), 100);
        });

        // Form submissions
        document.getElementById('login-submit')?.addEventListener('click', () => this.handleLogin());
        document.getElementById('signup-submit')?.addEventListener('click', () => this.handleSignup());

        // Password toggles
        document.getElementById('login-password-toggle')?.addEventListener('click', () => 
            this.togglePassword('login-password', 'login-password-toggle'));
        document.getElementById('signup-password-toggle')?.addEventListener('click', () => 
            this.togglePassword('signup-password', 'signup-password-toggle'));

        // User profile events
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());

        // Close modal on backdrop click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.hideAllModals();
            }
        });

        // Form enter key handling
        ['login-username', 'login-password'].forEach(id => {
            document.getElementById(id)?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        });

        ['signup-username', 'signup-email', 'signup-password', 'confirm-password'].forEach(id => {
            document.getElementById(id)?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSignup();
            });
        });
    }

    showModal(type) {
        const modal = document.getElementById(`${type}-modal`);
        if (modal) {
            modal.style.display = 'flex';
            this.clearForm(type);
        }
    }

    hideModal(type) {
        const modal = document.getElementById(`${type}-modal`);
        if (modal) {
            modal.style.display = 'none';
            this.clearForm(type);
        }
    }

    hideAllModals() {
        this.hideModal('login');
        this.hideModal('signup');
    }

    clearForm(type) {
        const form = document.querySelector(`#${type}-modal .auth-form`);
        if (form) {
            form.querySelectorAll('input').forEach(input => {
                if (input.type !== 'checkbox') input.value = '';
            });
            this.clearError(type);
        }
    }

    togglePassword(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        const icon = toggle?.querySelector('i');

        if (input && icon) {
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        }
    }

    showError(type, message) {
        const errorDiv = document.getElementById(`${type}-error`);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }
    }

    clearError(type) {
        const errorDiv = document.getElementById(`${type}-error`);
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('show');
        }
    }

    showSuccess(message) {
        const successDiv = document.getElementById('success-message');
        const successText = document.getElementById('success-text');
        
        if (successDiv && successText) {
            successText.textContent = message;
            successDiv.style.display = 'block';
            
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    handleSignup() {
        const username = document.getElementById('signup-username')?.value.trim();
        const email = document.getElementById('signup-email')?.value.trim();
        const password = document.getElementById('signup-password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;
        const termsAccepted = document.getElementById('terms-checkbox')?.checked;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            this.showError('signup', 'All fields are required.');
            return;
        }

        if (username.length < 3) {
            this.showError('signup', 'Username must be at least 3 characters long.');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('signup', 'Please enter a valid email address.');
            return;
        }

        if (!this.validatePassword(password)) {
            this.showError('signup', 'Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('signup', 'Passwords do not match.');
            return;
        }

        if (!termsAccepted) {
            this.showError('signup', 'You must accept the Terms & Conditions.');
            return;
        }

        // Check if user already exists
        if (this.users[username]) {
            this.showError('signup', 'Username already exists. Please choose a different one.');
            return;
        }

        // Check if email already exists
        const existingUser = Object.values(this.users).find(user => user.email === email);
        if (existingUser) {
            this.showError('signup', 'An account with this email already exists.');
            return;
        }

        // Create new user
        this.users[username] = {
            username,
            email,
            password,
            createdAt: new Date().toISOString(),
            preferences: {
                darkMode: false,
                rememberMe: false
            }
        };

        // Save to session storage
        sessionStorage.setItem('weatherApp_users', JSON.stringify(this.users));
        
        this.hideModal('signup');
        this.showSuccess('Account created successfully! You can now sign in.');
        
        // Auto switch to login modal after a delay
        setTimeout(() => {
            this.showModal('login');
            document.getElementById('login-username').value = username;
        }, 1500);
    }

    handleLogin() {
        const username = document.getElementById('login-username')?.value.trim();
        const password = document.getElementById('login-password')?.value;
        const rememberMe = document.getElementById('remember-me')?.checked;

        // Validation
        if (!username || !password) {
            this.showError('login', 'Please enter both username and password.');
            return;
        }

        // Check credentials
        const user = this.users[username];
        if (!user || user.password !== password) {
            this.showError('login', 'Invalid username or password.');
            return;
        }

        // Update user preferences
        if (rememberMe) {
            user.preferences.rememberMe = true;
            sessionStorage.setItem('weatherApp_currentUser', username);
        }

        // Set current user
        this.currentUser = user;
        sessionStorage.setItem('weatherApp_users', JSON.stringify(this.users));
        
        this.hideModal('login');
        this.showSuccess(`Welcome back, ${user.username}!`);
        this.updateUI();
    }

    handleLogout() {
        if (this.currentUser) {
            this.currentUser.preferences.rememberMe = false;
            sessionStorage.removeItem('weatherApp_currentUser');
            sessionStorage.setItem('weatherApp_users', JSON.stringify(this.users));
        }
        
        this.currentUser = null;
        this.showSuccess('You have been logged out successfully.');
        this.updateUI();
    }

    checkLoginStatus() {
        const rememberedUser = sessionStorage.getItem('weatherApp_currentUser');
        if (rememberedUser && this.users[rememberedUser]) {
            this.currentUser = this.users[rememberedUser];
            this.updateUI();
        }
    }

    updateUI() {
        const authBtns = document.getElementById('auth-btns');
        const userProfile = document.getElementById('user-profile');
        const usernameDisplay = document.getElementById('username-display');

        if (this.currentUser) {
            // Show user profile, hide auth buttons
            if (authBtns) authBtns.style.display = 'none';
            if (userProfile) {
                userProfile.style.display = 'block';
                if (usernameDisplay) {
                    usernameDisplay.textContent = this.currentUser.username;
                }
            }
        } else {
            // Show auth buttons, hide user profile
            if (authBtns) authBtns.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateUserPreference(key, value) {
        if (this.currentUser) {
            this.currentUser.preferences[key] = value;
            sessionStorage.setItem('weatherApp_users', JSON.stringify(this.users));
        }
    }
}

// Initialize authentication system
const authManager = new AuthManager();

// Enhanced form animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation to submit buttons
    const submitButtons = document.querySelectorAll('.auth-submit-btn');
    submitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const span = this.querySelector('span');
            const icon = this.querySelector('i');
            
            if (span && icon) {
                const originalText = span.textContent;
                span.textContent = 'Processing...';
                icon.className = 'fas fa-spinner fa-spin';
                
                setTimeout(() => {
                    span.textContent = originalText;
                    icon.className = 'fas fa-arrow-right';
                }, 1000);
            }
        });
    });

    // Add focus animations to inputs
    const inputs = document.querySelectorAll('.input-wrapper input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.auth-btns button, .auth-submit-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add ripple effect CSS dynamically
const rippleCSS = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .auth-btns button,
    .auth-submit-btn {
        position: relative;
        overflow: hidden;
    }
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Enhanced keyboard navigation
document.addEventListener('keydown', function(e) {
    // Escape key closes modals
    if (e.key === 'Escape') {
        authManager.hideAllModals();
    }
    
    // Tab navigation improvements
    if (e.key === 'Tab') {
        const modals = document.querySelectorAll('.modal[style*="flex"]');
        modals.forEach(modal => {
            const focusableElements = modal.querySelectorAll(
                'input, button, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        });
    }
});

// Weather data personalization based on user login
const originalGetWeatherDetails = getWeatherDetails;
const personalizedGetWeatherDetails = (cityName, lat, lon) => {
    const user = authManager.getCurrentUser();
    if (user) {
        // Save user's last searched location
        authManager.updateUserPreference('lastLocation', { cityName, lat, lon });
    }
    return originalGetWeatherDetails(cityName, lat, lon);
};

// Auto-load user's last location on page load if logged in
window.addEventListener('load', function() {
    const user = authManager.getCurrentUser();
    if (user && user.preferences.lastLocation) {
        const { cityName, lat, lon } = user.preferences.lastLocation;
        setTimeout(() => {
            getWeatherDetails(cityName, lat, lon);
        }, 1000);
    }
});

// Sync dark mode preference with user account
const originalDarkModeToggle = darkModeToggle.addEventListener;
darkModeToggle.addEventListener('click', function() {
    const isDarkMode = body.classList.contains('dark-mode');
    authManager.updateUserPreference('darkMode', isDarkMode);
});

// Load user's dark mode preference on login
const originalUpdateUI = authManager.updateUI;
authManager.updateUI = function() {
    originalUpdateUI.call(this);
    
    if (this.currentUser && this.currentUser.preferences.darkMode) {
        if (!body.classList.contains('dark-mode')) {
            darkModeToggle.click();
        }
    }
};