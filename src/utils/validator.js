/**
 * @file validator.js
 * @description Input validation using Joi for CLI args and API responses
 */

const Joi = require('joi');

/**
 * Schema for validating --city command-line argument
 */
const citySchema = Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s\-',.]+$/).required();

/**
 * Schema for validating --compare argument (comma-separated cities)
 */
const compareSchema = Joi.string()
  .pattern(/^[a-zA-Z\s\-',.]+(,[a-zA-Z\s\-',.]+)+$/)
  .required();

/**
 * Schema for validating --forecast argument
 */
const forecastDaysSchema = Joi.number().integer().min(1).max(7).required();

/**
 * Schema for validating weather API response
 */
const weatherResponseSchema = Joi.object({
  name: Joi.string().required(),
  main: Joi.object({
    temp: Joi.number().required(),
    feels_like: Joi.number().required(),
    humidity: Joi.number().required(),
    temp_min: Joi.number().required(),
    temp_max: Joi.number().required(),
  }).required(),
  weather: Joi.array()
    .items(
      Joi.object({
        description: Joi.string().required(),
        icon: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
  wind: Joi.object({
    speed: Joi.number().required(),
  }).required(),
  sys: Joi.object({
    country: Joi.string().required(),
  }).required(),
}).unknown(true);

/**
 * Validate a city name
 * @param {string} city - City name to validate
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateCity = (city) => {
  const { error } = citySchema.validate(city);
  return { valid: !error, error: error ? error.message : null };
};

/**
 * Validate a comma-separated list of cities
 * @param {string} cities - Comma-separated city names
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateCompare = (cities) => {
  const { error } = compareSchema.validate(cities);
  return { valid: !error, error: error ? error.message : null };
};

/**
 * Validate the forecast days argument
 * @param {number} days - Number of forecast days
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateForecastDays = (days) => {
  const { error } = forecastDaysSchema.validate(days);
  return { valid: !error, error: error ? error.message : null };
};

/**
 * Validate a weather API response object
 * @param {object} data - API response to validate
 * @returns {{ valid: boolean, error: string|null }}
 */
const validateWeatherResponse = (data) => {
  const { error } = weatherResponseSchema.validate(data);
  return { valid: !error, error: error ? error.message : null };
};

module.exports = {
  validateCity,
  validateCompare,
  validateForecastDays,
  validateWeatherResponse,
};
