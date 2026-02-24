/**
 * @file fileHandler.js
 * @description Handles saving JSON data and generating text/markdown reports
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const OUTPUT_DIR = path.join(process.cwd(), 'output');

/**
 * Ensure the output directory exists
 */
const ensureOutputDir = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
};

/**
 * Save data as a JSON file in the output directory
 * @param {string} filename - Name of the file (without extension)
 * @param {object} data - Data to serialize and save
 * @returns {string} Full path to saved file
 */
const saveJson = (filename, data) => {
  try {
    ensureOutputDir();
    const filePath = path.join(OUTPUT_DIR, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    logger.success(`Data saved to ${filePath}`);
    return filePath;
  } catch (err) {
    logger.error(`Failed to save JSON file: ${filename}`, err);
    throw new Error(`File save failed: ${err.message}`);
  }
};

/**
 * Generate a markdown summary report and save it
 * @param {string} filename - Name of the file (without extension)
 * @param {string} content - Markdown content to write
 * @returns {string} Full path to saved file
 */
const saveReport = (filename, content) => {
  try {
    ensureOutputDir();
    const filePath = path.join(OUTPUT_DIR, `${filename}.md`);
    fs.writeFileSync(filePath, content, 'utf8');
    logger.success(`Report saved to ${filePath}`);
    return filePath;
  } catch (err) {
    logger.error(`Failed to save report: ${filename}`, err);
    throw new Error(`Report save failed: ${err.message}`);
  }
};

/**
 * Read a JSON file and parse it
 * @param {string} filePath - Absolute path to the JSON file
 * @returns {object} Parsed JSON data
 */
const readJson = (filePath) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    logger.error(`Failed to read JSON file: ${filePath}`, err);
    throw new Error(`File read failed: ${err.message}`);
  }
};

/**
 * Build a markdown weather report string
 * @param {object} weatherData - Current weather data object
 * @param {object|null} countryData - Country info data object (optional)
 * @param {Array|null} forecast - Forecast array (optional)
 * @returns {string} Markdown formatted report
 */
const buildWeatherReport = (weatherData, countryData = null, forecast = null) => {
  const now = new Date().toLocaleString();
  const { name, main, weather, wind, sys } = weatherData;

  let md = `# 🌤 Weather Report\n\n`;
  md += `**Generated:** ${now}\n\n`;
  md += `## Current Conditions — ${name}, ${sys.country}\n\n`;
  md += `| Property | Value |\n|---|---|\n`;
  md += `| Description | ${weather[0].description} |\n`;
  md += `| Temperature | ${main.temp}°C (feels like ${main.feels_like}°C) |\n`;
  md += `| High / Low | ${main.temp_max}°C / ${main.temp_min}°C |\n`;
  md += `| Humidity | ${main.humidity}% |\n`;
  md += `| Wind Speed | ${wind.speed} m/s |\n\n`;

  if (countryData) {
    md += `## Country Info — ${countryData.name?.common || name}\n\n`;
    md += `| Property | Value |\n|---|---|\n`;
    md += `| Capital | ${countryData.capital?.[0] || 'N/A'} |\n`;
    md += `| Region | ${countryData.region || 'N/A'} |\n`;
    md += `| Population | ${(countryData.population || 0).toLocaleString()} |\n`;
    md += `| Currency | ${Object.values(countryData.currencies || {})[0]?.name || 'N/A'} |\n\n`;
  }

  if (forecast && forecast.length > 0) {
    md += `## 5-Day Forecast\n\n`;
    md += `| Date | Temp | Description |\n|---|---|---|\n`;
    forecast.forEach((day) => {
      md += `| ${day.date} | ${day.temp}°C | ${day.description} |\n`;
    });
  }

  return md;
};

module.exports = { saveJson, saveReport, readJson, buildWeatherReport };
