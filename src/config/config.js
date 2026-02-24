/**
 * @file config.js
 * @description Centralized configuration loaded from environment variables
 */

require('dotenv').config();

const config = {
  weather: {
    apiKey: process.env.OPENWEATHER_API_KEY || '',
    baseUrl: process.env.WEATHER_API_BASE || 'https://api.openweathermap.org/data/2.5',
  },
  countries: {
    baseUrl: process.env.COUNTRIES_API_BASE || 'https://restcountries.com/v3.1',
  },
  defaults: {
    units: process.env.DEFAULT_UNITS || 'metric',
    forecastDays: parseInt(process.env.DEFAULT_FORECAST_DAYS) || 5,
  },
};

module.exports = config;
