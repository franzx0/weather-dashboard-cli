/**
 * @file integration.test.js
 * @description Integration tests combining weather + countries data flow
 */

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { getCurrentWeather, processForecast, calculateStats } = require('../src/api/weatherApi');
const { getCountryByCode, summarizeCountry } = require('../src/api/countriesApi');
const { buildWeatherReport } = require('../src/utils/fileHandler');

const mock = new MockAdapter(axios);

beforeEach(() => {
  process.env.OPENWEATHER_API_KEY = 'integration-test-key';
});

afterEach(() => mock.reset());

const mockWeather = {
  name: 'Indianapolis',
  main: { temp: 22.5, feels_like: 21.0, humidity: 60, temp_min: 18.0, temp_max: 25.0 },
  weather: [{ description: 'clear sky', icon: '01d' }],
  wind: { speed: 3.5 },
  sys: { country: 'US' },
};

const mockCountry = {
  name: { common: 'United States' },
  capital: ['Washington, D.C.'],
  region: 'Americas',
  subregion: 'North America',
  population: 331000000,
  currencies: { USD: { name: 'United States dollar', symbol: '$' } },
  languages: { eng: 'English' },
  timezones: ['UTC-05:00'],
  flag: '🇺🇸',
};

describe('Full weather + country pipeline', () => {
  test('fetches weather then enriches with country data', async () => {
    mock.onGet(/\/weather/).reply(200, mockWeather);
    mock.onGet(/\/alpha\/US/).reply(200, [mockCountry]);

    const weather = await getCurrentWeather('Indianapolis');
    expect(weather.sys.country).toBe('US');

    const country = await getCountryByCode(weather.sys.country);
    const summary = summarizeCountry(country);
    expect(summary.name).toBe('United States');
    expect(summary.capital).toBe('Washington, D.C.');
  });

  test('builds a complete markdown report from combined data', async () => {
    mock.onGet(/\/weather/).reply(200, mockWeather);
    mock.onGet(/\/alpha\/US/).reply(200, [mockCountry]);

    const weather = await getCurrentWeather('Indianapolis');
    const country = await getCountryByCode(weather.sys.country);
    const report = buildWeatherReport(weather, country);

    expect(report).toContain('Indianapolis');
    expect(report).toContain('Country Info');
    expect(report).toContain('Washington, D.C.');
  });

  test('compare pipeline calculates stats across cities', async () => {
    const cities = [
      { name: 'Indianapolis', main: { temp: 22, humidity: 55 }, sys: { country: 'US' }, weather: [{ description: 'clear' }] },
      { name: 'Chicago', main: { temp: 15, humidity: 80 }, sys: { country: 'US' }, weather: [{ description: 'cloudy' }] },
      { name: 'Detroit', main: { temp: 18, humidity: 65 }, sys: { country: 'US' }, weather: [{ description: 'windy' }] },
    ];

    mock.onGet(/\/weather\?.*Indianapolis/).reply(200, cities[0]);
    mock.onGet(/\/weather\?.*Chicago/).reply(200, cities[1]);
    mock.onGet(/\/weather\?.*Detroit/).reply(200, cities[2]);

    const stats = calculateStats(cities);
    expect(stats.hottest.city).toBe('Indianapolis');
    expect(stats.coldest.city).toBe('Chicago');
    expect(stats.averageTemp).toBe(18.3);
  });

  test('handles partial API failure gracefully', async () => {
    mock.onGet(/\/weather/).reply(200, mockWeather);
    mock.onGet(/\/alpha\/US/).reply(404, {});

    const weather = await getCurrentWeather('Indianapolis');
    // Country fetch would fail - ensure downstream code handles null
    const country = null;
    const report = buildWeatherReport(weather, country);
    expect(report).toContain('Indianapolis');
    expect(report).not.toContain('Country Info');
  });
});
