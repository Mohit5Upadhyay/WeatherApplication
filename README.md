# Weather App
A simple weather application that allows users to search for weather information by city name or automatically get weather data based on their current location using geolocation. This app fetches data from a weather API and displays the current temperature, weather conditions, and more.

## Features
- Search weather by city name.
- Get weather details based on user's current location.
- Displays temperature, weather condition, and city name.
- Responsive and clean UI.

## Technologies Used
- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Weather API (like OpenWeatherMap API)

## Getting Started
To get a local copy up and running, follow these steps:

### Prerequisites
- You need to have a web browser installed (Chrome, Firefox, etc.)
- Basic understanding of HTML, CSS, and JavaScript.

### API Key
This application uses the [OpenWeatherMap API](https://openweathermap.org/api). To use it, you need an API key:
1. Go to [OpenWeatherMap](https://home.openweathermap.org/users/sign_up) and sign up.
2. After signing up, go to the API section and generate a new API key.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/weather-app.git ```
2. Navigate to the project directory:
   ```bash
   cd weather-app ```
3. Open the index.html file in your preferred web browser.
4. Add your API key to the JavaScript code where the API call is made.

### API Usage
This app utilizes the OpenWeatherMap API to fetching real-time weather data.
1. API Endpoint (City Name):
```bash
https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key} 
```
2. API Endpoint (Coordinates):
``` bash 
https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={API key}
```

### Setup Instructions
1. Open the app.js file located in the root directory.
2. Replace the API_KEY placeholder with your actual OpenWeatherMap API key:
``` bash 
const apiKey = 'YOUR_API_KEY';
```

### Usage
1. Enter the name of a city in the input field and click the "Search" button to get weather data for that city.
2. Alternatively, click the "Use My Location" button to fetch weather data based on your current geolocation.

# Project Link : [Click here](https://mohit5upadhyay.github.io/WeatherApplication/)


