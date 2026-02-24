# 🌤 Weather Dashboard CLI

A command-line weather dashboard built with Node.js that fetches real-time weather data from **OpenWeatherMap** and enriches it with country info from the **REST Countries API**.

## Team Members

| Name | Role |
|------|------|
| Member 1 | API Integration & CLI |
| Member 2 | Data Processing & Validation |
| Member 3 | Testing & File Handling |
| Member 4 | Documentation & Git Workflow |

---

## Features

- **Current weather** for any city (temperature, humidity, wind, conditions)
- **5-day forecast** with daily summaries
- **City comparison** — compare weather across multiple cities with statistics (hottest, coldest, most humid, average temp)
- **Country enrichment** — automatically fetches capital, population, currency & timezone via REST Countries API
- **Save results** to JSON files and generate Markdown reports
- **Colorized CLI** output with loading spinners and tables

---

## APIs Used

| API | Purpose | Auth |
|-----|---------|------|
| [OpenWeatherMap](https://openweathermap.org/api) | Weather data & forecasts | Free API key required |
| [REST Countries](https://restcountries.com/) | Country info enrichment | None (public) |

---

## Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-team/weather-dashboard-cli.git
cd weather-dashboard-cli

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your OpenWeatherMap API key
```

### Getting a free API key
1. Sign up at https://openweathermap.org/api
2. Copy your API key from the dashboard
3. Paste it into `.env` as `OPENWEATHER_API_KEY=your_key_here`

---

## Usage

### Current weather for a city
```bash
node src/index.js --city "Indianapolis"
```

### Current weather + save to file
```bash
node src/index.js --city "London" --save
```

### Current weather + 5-day forecast + save
```bash
node src/index.js --city "Tokyo" --forecast 5 --save
```

### Compare multiple cities
```bash
node src/index.js --compare "Indianapolis,Chicago,Detroit"
```

### Use imperial units (Fahrenheit)
```bash
node src/index.js --city "New York" --units imperial
```

### All options
```
Options:
  -c, --city <city>        Fetch current weather for a city
  -f, --forecast <days>    Include N-day forecast (1-7)
  -u, --units <units>      Units: metric | imperial | standard (default: metric)
  -s, --save               Save results to output/ directory
  --compare <cities>       Compare weather across comma-separated cities
  -V, --version            Output the version number
  -h, --help               Display help
```

---

## Output

When `--save` is used, files are written to the `output/` directory:
- `weather_<city>_<timestamp>.json` — raw + processed data
- `report_<city>_<timestamp>.md` — formatted markdown report
- `comparison_<timestamp>.json` — comparison data with statistics

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Watch mode during development
npm run test:watch
```

### Test structure
- `tests/validator.test.js` — CLI argument and API response validation
- `tests/weatherApi.test.js` — Weather API functions with mocked HTTP calls
- `tests/countriesApi.test.js` — Countries API functions with mocked HTTP calls
- `tests/fileHandler.test.js` — File save, read, and report generation
- `tests/integration.test.js` — End-to-end pipeline integration tests

---

## Technologies Used

| Package | Purpose |
|---------|---------|
| `axios` | HTTP requests |
| `dotenv` | Environment variable management |
| `joi` | Schema validation |
| `commander` | CLI argument parsing |
| `chalk` | Colored terminal output |
| `ora` | Loading spinners |
| `table` | Pretty-printed tables |
| `jest` | Testing framework |
| `axios-mock-adapter` | Mock HTTP calls in tests |

---

## Project Structure

```
weather-dashboard-cli/
├── .env.example          # Example environment variables
├── .gitignore
├── LICENSE               # MIT License
├── README.md
├── CONTRIBUTIONS.md
├── package.json
├── src/
│   ├── index.js          # Main CLI entry point
│   ├── api/
│   │   ├── weatherApi.js     # OpenWeatherMap integration
│   │   └── countriesApi.js   # REST Countries integration
│   ├── utils/
│   │   ├── validator.js      # Joi-based validation
│   │   ├── fileHandler.js    # JSON save, report generation
│   │   └── logger.js         # Leveled logging with chalk
│   └── config/
│       └── config.js         # Centralized environment config
├── tests/
│   ├── validator.test.js
│   ├── weatherApi.test.js
│   ├── countriesApi.test.js
│   ├── fileHandler.test.js
│   └── integration.test.js
└── output/               # Generated output files (gitignored)
```

---

## Known Limitations

- OpenWeatherMap free tier has a 60 calls/minute rate limit
- Forecast data is based on 3-hour intervals; daily summaries use the noon reading
- REST Countries API may not have data for all country codes returned by OpenWeatherMap

## Future Enhancements

- Add CSV export option
- Interactive city selection with `inquirer`
- Weather alerts and warnings
- Historical weather data
- ASCII weather art display
- Support for lat/lon coordinates

