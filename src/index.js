/**
 * @file index.js
 * @description Main entry point for the Weather Dashboard CLI
 *
 * Usage examples:
 *   node src/index.js --city "Indianapolis" --save
 *   node src/index.js --city "London" --forecast 5 --save
 *   node src/index.js --compare "Indianapolis,Chicago,Detroit"
 *   node src/index.js --city "Tokyo" --units imperial
 */

require('dotenv').config();
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { table } = require('table');

const { getCurrentWeather, getForecast, processForecast, calculateStats } = require('./api/weatherApi');
const { getCountryByCode, summarizeCountry } = require('./api/countriesApi');
const { validateCity, validateCompare, validateForecastDays } = require('./utils/validator');
const { saveJson, saveReport, buildWeatherReport } = require('./utils/fileHandler');
const logger = require('./utils/logger');

const program = new Command();

program
  .name('weather-dashboard')
  .description('🌤 A CLI weather dashboard using OpenWeatherMap & REST Countries APIs')
  .version('1.0.0');

// ─────────────────────────────────────────────
// Command: --city  (current weather for a city)
// ─────────────────────────────────────────────
program
  .option('-c, --city <city>', 'Fetch current weather for a city')
  .option('-f, --forecast <days>', 'Include N-day forecast (1-7)', parseInt)
  .option('-u, --units <units>', 'Units: metric | imperial | standard', 'metric')
  .option('-s, --save', 'Save results to output/ directory')
  .option('--compare <cities>', 'Compare weather across comma-separated cities')
  .addHelpText(
    'after',
    `
Examples:
  $ node src/index.js --city "Indianapolis" --save
  $ node src/index.js --city "London" --forecast 5 --save
  $ node src/index.js --compare "Indianapolis,Chicago,Detroit"
  $ node src/index.js --city "Tokyo" --units imperial
`
  );

program.parse(process.argv);
const opts = program.opts();

// ─────────────────────────────────────────────
// Helper: display weather in a nice table
// ─────────────────────────────────────────────
const displayWeather = (data, countryInfo) => {
  const { name, main, weather, wind, sys } = data;
  const unitSymbol = opts.units === 'imperial' ? '°F' : opts.units === 'standard' ? 'K' : '°C';

  console.log(chalk.bold.cyan(`\n🌍 ${name}, ${sys.country}`));
  console.log(chalk.dim('─'.repeat(40)));

  const rows = [
    [chalk.bold('Property'), chalk.bold('Value')],
    ['Condition', weather[0].description],
    ['Temperature', `${main.temp}${unitSymbol} (feels like ${main.feels_like}${unitSymbol})`],
    ['High / Low', `${main.temp_max}${unitSymbol} / ${main.temp_min}${unitSymbol}`],
    ['Humidity', `${main.humidity}%`],
    ['Wind Speed', `${wind.speed} m/s`],
  ];

  if (countryInfo) {
    rows.push(['Capital', countryInfo.capital]);
    rows.push(['Population', countryInfo.population.toLocaleString()]);
    rows.push(['Currency', countryInfo.currency]);
    rows.push(['Timezone', countryInfo.timezone]);
  }

  console.log(table(rows));
};

// ─────────────────────────────────────────────
// Helper: display forecast
// ─────────────────────────────────────────────
const displayForecast = (forecastDays, days, unitSymbol) => {
  const limited = forecastDays.slice(0, days);
  console.log(chalk.bold.cyan(`\n📅 ${days}-Day Forecast`));
  const rows = [
    [chalk.bold('Date'), chalk.bold('Temp'), chalk.bold('Feels Like'), chalk.bold('Humidity'), chalk.bold('Description')],
    ...limited.map((d) => [
      d.date,
      `${d.temp}${unitSymbol}`,
      `${d.feels_like}${unitSymbol}`,
      `${d.humidity}%`,
      d.description,
    ]),
  ];
  console.log(table(rows));
};

// ─────────────────────────────────────────────
// Main logic
// ─────────────────────────────────────────────
(async () => {
  try {
    // ── COMPARE mode ──────────────────────────
    if (opts.compare) {
      const validation = validateCompare(opts.compare);
      if (!validation.valid) {
        logger.error(`Invalid --compare value: ${validation.error}`);
        process.exit(1);
      }

      const cities = opts.compare.split(',').map((c) => c.trim());
      const spinner = ora(`Fetching weather for ${cities.length} cities...`).start();

      const results = [];
      for (const city of cities) {
        try {
          const data = await getCurrentWeather(city, opts.units);
          results.push(data);
        } catch (err) {
          spinner.warn(`Skipping ${city}: ${err.message}`);
        }
      }
      spinner.succeed('Comparison data fetched!');

      if (results.length === 0) {
        logger.error('No valid cities found. Exiting.');
        process.exit(1);
      }

      const unitSymbol = opts.units === 'imperial' ? '°F' : opts.units === 'standard' ? 'K' : '°C';

      console.log(chalk.bold.cyan('\n🌍 City Weather Comparison'));
      const rows = [
        [chalk.bold('City'), chalk.bold('Country'), chalk.bold('Temp'), chalk.bold('Humidity'), chalk.bold('Condition')],
        ...results.map((d) => [
          d.name,
          d.sys.country,
          `${d.main.temp}${unitSymbol}`,
          `${d.main.humidity}%`,
          d.weather[0].description,
        ]),
      ];
      console.log(table(rows));

      const stats = calculateStats(results);
      if (stats) {
        console.log(chalk.bold.yellow('📊 Statistics:'));
        console.log(`  🔥 Hottest:     ${stats.hottest.city} (${stats.hottest.temp}${unitSymbol})`);
        console.log(`  ❄️  Coldest:     ${stats.coldest.city} (${stats.coldest.temp}${unitSymbol})`);
        console.log(`  💧 Most Humid:  ${stats.mostHumid.city} (${stats.mostHumid.humidity}%)`);
        console.log(`  📈 Avg Temp:    ${stats.averageTemp}${unitSymbol}\n`);
      }

      if (opts.save) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        saveJson(`comparison_${timestamp}`, { cities: results, stats });
        logger.success('Comparison data saved.');
      }

      return;
    }

    // ── SINGLE CITY mode ──────────────────────
    if (opts.city) {
      const validation = validateCity(opts.city);
      if (!validation.valid) {
        logger.error(`Invalid city name: ${validation.error}`);
        process.exit(1);
      }

      if (opts.forecast !== undefined) {
        const fv = validateForecastDays(opts.forecast);
        if (!fv.valid) {
          logger.error(`Invalid --forecast value: ${fv.error}`);
          process.exit(1);
        }
      }

      const spinner = ora(`Fetching weather for ${opts.city}...`).start();

      let weatherData, countryData, forecastData;

      try {
        weatherData = await getCurrentWeather(opts.city, opts.units);
        spinner.text = 'Fetching country info...';
        countryData = await getCountryByCode(weatherData.sys.country);
      } catch (err) {
        spinner.fail(`Failed: ${err.message}`);
        process.exit(1);
      }

      if (opts.forecast) {
        try {
          spinner.text = `Fetching ${opts.forecast}-day forecast...`;
          const rawForecast = await getForecast(opts.city, opts.units);
          forecastData = processForecast(rawForecast);
        } catch (err) {
          spinner.warn(`Forecast fetch failed: ${err.message}`);
        }
      }

      spinner.succeed('All data fetched!');

      const countryInfo = summarizeCountry(countryData);
      displayWeather(weatherData, countryInfo);

      if (opts.forecast && forecastData) {
        const unitSymbol = opts.units === 'imperial' ? '°F' : opts.units === 'standard' ? 'K' : '°C';
        displayForecast(forecastData, opts.forecast, unitSymbol);
      }

      if (opts.save) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const citySlug = opts.city.toLowerCase().replace(/\s+/g, '_');

        saveJson(`weather_${citySlug}_${timestamp}`, {
          current: weatherData,
          country: countryInfo,
          forecast: forecastData || null,
        });

        const reportContent = buildWeatherReport(weatherData, countryData, forecastData);
        saveReport(`report_${citySlug}_${timestamp}`, reportContent);
      }

      return;
    }

    // ── No valid command ───────────────────────
    program.help();
  } catch (err) {
    logger.error('Unexpected error', err);
    process.exit(1);
  }
})();
