// java-script file for the Weather Application 
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");


const API_KEY = "eb25bb98e70091ae7787a643b17b1686";  // API key for OpenWeatherMap API 

const createWeatherCard = (cityName ,weatherItem ,index) =>{
if (index === 0) {  //HTML for the main weather cards
    return  `<div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4>Temperature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind Speed : ${weatherItem.wind.speed} M/s</h4>
                <h4>Humidity :  ${weatherItem.main.humidity} %</h4>
            </div>
            <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
            <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    
} else {
    return ` <li class="card">
                <h3>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Desc : ${weatherItem.weather[0].description}</h4>
                <h4>Temperature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind Speed : ${weatherItem.wind.speed} M/s</h4>
                <h4>Humidity :  ${weatherItem.main.humidity} %</h4>
                
            </li>`;
}

    

}

const getWeatherDetails = (cityName ,lat ,lon) =>{
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`; // use 5 days forecast API of thet particular place.

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

        
        // filter the  Forecasts  to get the only one forecast per day..

        const uniqueForecasteDays=[];

        const fiveDaysForecast = data.list.filter(forecast =>{
            const forecastDate =new Date(forecast.dt_txt).getDate();
            if(!uniqueForecasteDays.includes(forecastDate)){
                return  uniqueForecasteDays.push(forecastDate);
            }
        });

        //clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML=  "";
        weatherCardsDiv.innerHTML=  "";

        //console.log(fiveDaysForecast);
        //  creating weather cards and adding them to the DOM

        fiveDaysForecast.forEach((weatherItem ,index) => {

            if(index === 0){

                currentWeatherDiv.insertAdjacentHTML("beforeend" ,createWeatherCard(cityName ,weatherItem , index));


            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend" ,createWeatherCard(cityName ,weatherItem , index));

            }

            
        });

    }).catch(() => {
        alert("An Error Occured while Fetching the Weather Forecast !")
    })
}

const getCityCoordinates = () =>{
    const cityName = cityInput.value.trim(); //get the users entered city name 
    if (!cityName) return ; // return if cityName is empty.

   // console.log(cityName);
   const GEOCODING_API_URL =  `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}` ; // it provide the location lattitude & longitude  -- by using the ---> OpenWeatherMap  API
    
//get entered city coordinates (lattitude ,longitude  and name ) from the API response .
   fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {

   // console.log(data)
    if(!data.length) return alert(`No Coordinates found for ${cityName}`);
    const { name ,lat ,lon } = data[0];
    getWeatherDetails(name,lat ,lon);

   }).catch(() => {
    alert("An Error Occured while Fetching the Coordinates!")
   });
}

const getUserCoordinates = ()=>{
    navigator.geolocation.getCurrentPosition(
        position =>{
            //console.log(position);
            const { latitude, longitude} =  position.coords;

            //Get city name for the coordinates using reverse geocoding API .
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}` ;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {

                // console.log(data)
                //  if(!data.length) return alert(`No City found for ${cityName}`);
                    const { name } = data[0];
                    getWeatherDetails(name,latitude ,longitude);

                // console.log(data);
             
                }).catch(() => {
                 alert("An Error Occured while Fetching the City!")
                });
        },
        error =>{
            //console.log(error);
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied . Please reset loacation permission to grant access again...")  
            } 
        }
    );
}

searchButton.addEventListener("click", getCityCoordinates);

locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" &&getCityCoordinates());

