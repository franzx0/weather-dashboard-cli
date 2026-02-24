/**
 * @file countriesApi.js
 * @description REST Countries API integration module
 */

const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Custom error class for Countries API errors
 */
class CountriesApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'CountriesApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Fetch country info by country code (e.g., "US", "GB")
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {Promise<object>} Country data object
 */
const getCountryByCode = async (countryCode) => {
  try {
    logger.debug(`Fetching country info for code: ${countryCode}`);
    const response = await axios.get(
      `${config.countries.baseUrl}/alpha/${countryCode}`,
      { timeout: 10000 }
    );
    // REST Countries returns an array
    return Array.isArray(response.data) ? response.data[0] : response.data;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      if (status === 404) throw new CountriesApiError(`Country not found for code: "${countryCode}"`, 404);
      throw new CountriesApiError(`Countries API error ${status}`, status);
    }
    throw new CountriesApiError(`Network error: ${err.message}`, 0);
  }
};

/**
 * Fetch country info by country name
 * @param {string} name - Country name
 * @returns {Promise<object>} Country data object
 */
const getCountryByName = async (name) => {
  try {
    logger.debug(`Fetching country info for name: ${name}`);
    const response = await axios.get(
      `${config.countries.baseUrl}/name/${encodeURIComponent(name)}`,
      { timeout: 10000, params: { fullText: false } }
    );
    return Array.isArray(response.data) ? response.data[0] : response.data;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      if (status === 404) {
        logger.warn(`Country info not found for: "${name}" — skipping`);
        return null;
      }
      throw new CountriesApiError(`Countries API error ${status}`, status);
    }
    throw new CountriesApiError(`Network error: ${err.message}`, 0);
  }
};

/**
 * Extract a simplified summary from raw country data
 * @param {object} countryData - Raw country data from REST Countries API
 * @returns {object} Simplified country summary
 */
const summarizeCountry = (countryData) => {
  if (!countryData) return null;
  return {
    name: countryData.name?.common || 'Unknown',
    capital: countryData.capital?.[0] || 'N/A',
    region: countryData.region || 'N/A',
    subregion: countryData.subregion || 'N/A',
    population: countryData.population || 0,
    currency: Object.values(countryData.currencies || {})[0]?.name || 'N/A',
    languages: Object.values(countryData.languages || {}).join(', ') || 'N/A',
    timezone: countryData.timezones?.[0] || 'N/A',
    flag: countryData.flag || '',
  };
};

module.exports = { getCountryByCode, getCountryByName, summarizeCountry, CountriesApiError };
