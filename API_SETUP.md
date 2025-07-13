# API Configuration

## Overview
This application uses several external APIs that require API keys for functionality:

1. **OpenWeatherMap API** - For weather data and forecasts
2. **Windy API** - For interactive weather maps
3. **Google Gemini API** - For chatbot functionality

## Configuration
API keys are configured in `config.js`. For production deployments:

1. Create a copy of `config.js` as `config.local.js`
2. Update the API keys in `config.local.js` with your own keys
3. Ensure `config.local.js` is not committed to version control

## Getting API Keys

### OpenWeatherMap API
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key from the dashboard
3. Replace the `WEATHER_API_KEY` in your config

### Windy API
1. Sign up at [Windy API](https://api.windy.com/)
2. Get your API key from the dashboard
3. Replace the `WINDY_API_KEY` in your config

### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Replace the `GEMINI_API_KEY` in your config

## Security Note
- Never commit API keys to version control
- Use environment variables in production
- Consider using a server-side proxy for API calls to hide keys from client-side code