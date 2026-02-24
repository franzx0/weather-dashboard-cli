/**
 * @file weatherApi.js
 * @description OpenWeatherMap API integration module
 */

const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Custom error class for weather API errors
 */
class WeatherApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'WeatherApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Fetch current weather for a given city
 * @param {string} city - City name
 * @param {string} [units='metric'] - Units: metric, imperial, or standard
 * @returns {Promise<object>} Weather data object
 */
const getCurrentWeather = async (city, units = config.defaults.units) => {
  if (!config.weather.apiKey) {
    throw new WeatherApiError('OPENWEATHER_API_KEY is not set in .env file', 401);
  }

  try {
    logger.debug(`Fetching current weather for: ${city}`);
    const response = await axios.get(`${config.weather.baseUrl}/weather`, {
      params: {
        q: city,
        appid: config.weather.apiKey,
        units,
      },
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      if (status === 404) throw new WeatherApiError(`City not found: "${city}"`, 404);
      if (status === 401) throw new WeatherApiError('Invalid API key. Check your OPENWEATHER_API_KEY.', 401);
      if (status === 429) throw new WeatherApiError('Rate limit exceeded. Please wait before retrying.', 429);
      throw new WeatherApiError(`API error ${status}: ${err.response.data?.message || 'Unknown error'}`, status);
    }
    if (err.code === 'ECONNABORTED') throw new WeatherApiError('Request timed out. Check your internet connection.', 408);
    throw new WeatherApiError(`Network error: ${err.message}`, 0);
  }
};

/**
 * Fetch 5-day / 3-hour forecast for a city
 * @param {string} city - City name
 * @param {string} [units='metric'] - Units: metric, imperial, or standard
 * @returns {Promise<object>} Forecast data object
 */
const getForecast = async (city, units = config.defaults.units) => {
  if (!config.weather.apiKey) {
    throw new WeatherApiError('OPENWEATHER_API_KEY is not set in .env file', 401);
  }

  try {
    logger.debug(`Fetching forecast for: ${city}`);
    const response = await axios.get(`${config.weather.baseUrl}/forecast`, {
      params: {
        q: city,
        appid: config.weather.apiKey,
        units,
      },
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      if (status === 404) throw new WeatherApiError(`City not found: "${city}"`, 404);
      if (status === 401) throw new WeatherApiError('Invalid API key. Check your OPENWEATHER_API_KEY.', 401);
      if (status === 429) throw new WeatherApiError('Rate limit exceeded. Please wait before retrying.', 429);
      throw new WeatherApiError(`API error ${status}`, status);
    }
    throw new WeatherApiError(`Network error: ${err.message}`, 0);
  }
};

/**
 * Process raw forecast data into a simplified daily summary
 * @param {object} rawForecast - Raw forecast response from OpenWeatherMap
 * @returns {Array<object>} Array of daily forecast summaries
 */
const processForecast = (rawForecast) => {
  if (!rawForecast || !rawForecast.list) return [];

  // Group by date and take noon reading for each day
  const byDate = {};
  rawForecast.list.forEach((entry) => {
    const date = entry.dt_txt.split(' ')[0];
    const hour = entry.dt_txt.split(' ')[1];
    if (!byDate[date] || hour === '12:00:00') {
      byDate[date] = entry;
    }
  });

  return Object.entries(byDate).map(([date, entry]) => ({
    date,
    temp: Math.round(entry.main.temp),
    feels_like: Math.round(entry.main.feels_like),
    humidity: entry.main.humidity,
    description: entry.weather[0].description,
    wind_speed: entry.wind.speed,
  }));
};

/**
 * Calculate statistics across multiple weather readings
 * @param {Array<object>} weatherDataArray - Array of current weather objects
 * @returns {object} Statistics: hottest, coldest, most humid city
 */
const calculateStats = (weatherDataArray) => {
  if (!weatherDataArray || weatherDataArray.length === 0) return null;

  const hottest = weatherDataArray.reduce((a, b) => (a.main.temp > b.main.temp ? a : b));
  const coldest = weatherDataArray.reduce((a, b) => (a.main.temp < b.main.temp ? a : b));
  const mostHumid = weatherDataArray.reduce((a, b) => (a.main.humidity > b.main.humidity ? a : b));
  const avgTemp = weatherDataArray.reduce((sum, d) => sum + d.main.temp, 0) / weatherDataArray.length;

  return {
    hottest: { city: hottest.name, temp: hottest.main.temp },
    coldest: { city: coldest.name, temp: coldest.main.temp },
    mostHumid: { city: mostHumid.name, humidity: mostHumid.main.humidity },
    averageTemp: Math.round(avgTemp * 10) / 10,
  };
};

module.exports = { getCurrentWeather, getForecast, processForecast, calculateStats, WeatherApiError };
