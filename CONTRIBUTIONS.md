# Team Contributions

## Project: Weather Dashboard CLI

---

## Team Member Breakdown

### Alex - API Integration & CLI Entry Point (~30%)
**Branches created:** `feature/weather-api`, `feature/cli-commands`

**Contributions:**
- Implemented `src/api/weatherApi.js` — full OpenWeatherMap integration with error handling, rate limit detection, and forecast processing
- Implemented `src/index.js` — CLI using commander.js with `--city`, `--forecast`, `--compare`, `--save`, and `--units` flags
- Added `WeatherApiError` custom error class
- `calculateStats()` function for multi-city comparisons



### Alex - Data Processing & Validation (~25%)
**Branches created:** `feature/countries-api`, `feature/validation`

**Contributions:**
- Implemented `src/api/countriesApi.js` — REST Countries API integration with `getCountryByCode`, `getCountryByName`, and `summarizeCountry`
- Implemented `src/utils/validator.js` — Joi schemas for city names, compare strings, forecast days, and API responses
- Added `CountriesApiError` custom error class



### Alex - Testing & File Handling (~25%)
**Branches created:** `feature/file-handler`, `feature/tests`

**Contributions:**
- Implemented `src/utils/fileHandler.js` — JSON save, markdown report generation, file reading
- Wrote all Jest test suites: `validator.test.js`, `weatherApi.test.js`, `countriesApi.test.js`, `fileHandler.test.js`, `integration.test.js`
- Set up `axios-mock-adapter` for HTTP mocking
- Configured Jest coverage thresholds in `package.json`



### Alex - Configuration, Logging & Documentation (~20%)
**Branches created:** `feature/config-logger`, `docs/readme`

**Contributions:**
- Implemented `src/utils/logger.js` — leveled logging with chalk (info, success, warn, error, debug)
- Implemented `src/config/config.js` — centralized environment variable config
- Created `README.md`, `.env.example`, `.gitignore`, `LICENSE`, `CONTRIBUTIONS.md`
- Set up repository structure, initial commit, and `.env.example`



## Collaboration Process

- **GitHub** for version control and pull requests
- **Feature branches** for all new work — no direct commits to `main`
- **Conventional commits** — messages follow the format: `feat:`, `fix:`, `test:`, `docs:`, `chore:`



## Work Distribution Summary

| Member | Approx. % | Primary Files |
|--------|-----------|---------------|
| Alex | 30% | `weatherApi.js`, `index.js` |
| Alex | 25% | `countriesApi.js`, `validator.js` |
| Alex | 25% | `fileHandler.js`, `tests/*.test.js` |
| Alex | 20% | `logger.js`, `config.js`, docs |
