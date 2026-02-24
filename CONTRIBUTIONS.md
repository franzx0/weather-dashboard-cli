# Team Contributions

## Project: Weather Dashboard CLI

---

## Team Member Breakdown

### Member 1 — API Integration & CLI Entry Point (~30%)
**Branches created:** `feature/weather-api`, `feature/cli-commands`

**Contributions:**
- Implemented `src/api/weatherApi.js` — full OpenWeatherMap integration with error handling, rate limit detection, and forecast processing
- Implemented `src/index.js` — CLI using commander.js with `--city`, `--forecast`, `--compare`, `--save`, and `--units` flags
- Added `WeatherApiError` custom error class
- `calculateStats()` function for multi-city comparisons

---

### Member 2 — Data Processing & Validation (~25%)
**Branches created:** `feature/countries-api`, `feature/validation`

**Contributions:**
- Implemented `src/api/countriesApi.js` — REST Countries API integration with `getCountryByCode`, `getCountryByName`, and `summarizeCountry`
- Implemented `src/utils/validator.js` — Joi schemas for city names, compare strings, forecast days, and API responses
- Added `CountriesApiError` custom error class

---

### Member 3 — Testing & File Handling (~25%)
**Branches created:** `feature/file-handler`, `feature/tests`

**Contributions:**
- Implemented `src/utils/fileHandler.js` — JSON save, markdown report generation, file reading
- Wrote all Jest test suites: `validator.test.js`, `weatherApi.test.js`, `countriesApi.test.js`, `fileHandler.test.js`, `integration.test.js`
- Set up `axios-mock-adapter` for HTTP mocking
- Configured Jest coverage thresholds in `package.json`

---

### Member 4 — Configuration, Logging & Documentation (~20%)
**Branches created:** `feature/config-logger`, `docs/readme`

**Contributions:**
- Implemented `src/utils/logger.js` — leveled logging with chalk (info, success, warn, error, debug)
- Implemented `src/config/config.js` — centralized environment variable config
- Created `README.md`, `.env.example`, `.gitignore`, `LICENSE`, `CONTRIBUTIONS.md`
- Set up repository structure, initial commit, and `.env.example`

---

## Collaboration Process

- **GitHub** for version control and pull requests
- **Feature branches** for all new work — no direct commits to `main`
- **Pull request reviews** — each PR required at least one team member review before merging
- **Conventional commits** — messages follow the format: `feat:`, `fix:`, `test:`, `docs:`, `chore:`
- **Communication** via team chat (Discord/Slack) for coordination

---

## Work Distribution Summary

| Member | Approx. % | Primary Files |
|--------|-----------|---------------|
| Member 1 | 30% | `weatherApi.js`, `index.js` |
| Member 2 | 25% | `countriesApi.js`, `validator.js` |
| Member 3 | 25% | `fileHandler.js`, `tests/*.test.js` |
| Member 4 | 20% | `logger.js`, `config.js`, docs |
