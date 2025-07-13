// Configuration file for API keys
// In production, these should be environment variables or server-side configuration
const CONFIG = {
    WEATHER_API_KEY: "eb25bb98e70091ae7787a643b17b1686", // OpenWeatherMap API key
    WINDY_API_KEY: "H3MzWInDcItupZcD6PvvOdQ92hG6mNKw", // Windy API key
    GEMINI_API_KEY: "AIzaSyDTWcyCwDbOL7kpbdmFXkolBavwRpP-sZA" // Google Gemini API key
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}