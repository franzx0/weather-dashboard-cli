/**
 * @file weatherApi.test.js
 * @description Unit tests for weatherApi module with mocked HTTP calls
 */

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {
  getCurrentWeather,
  getForecast,
  processForecast,
  calculateStats,
  WeatherApiError,
} = require('../src/api/weatherApi');

// Mock axios
const mock = new MockAdapter(axios);

// Restore mocks after each test
afterEach(() => {
  mock.reset();
});

const mockWeatherResponse = {
  name: 'Indianapolis',
  main: { temp: 22.5, feels_like: 21.0, humidity: 60, temp_min: 18.0, temp_max: 25.0 },
  weather: [{ description: 'clear sky', icon: '01d' }],
  wind: { speed: 3.5 },
  sys: { country: 'US' },
};

describe('getCurrentWeather', () => {
  beforeEach(() => {
    process.env.OPENWEATHER_API_KEY = 'test-key-123';
  });

  test('returns weather data for a valid city', async () => {
    mock.onGet(/\/weather/).reply(200, mockWeatherResponse);
    const data = await getCurrentWeather('Indianapolis');
    expect(data.name).toBe('Indianapolis');
    expect(data.main.temp).toBe(22.5);
  });

  test('throws WeatherApiError for 404 city not found', async () => {
    mock.onGet(/\/weather/).reply(404, { message: 'city not found' });
    await expect(getCurrentWeather('FakeCity999')).rejects.toThrow(WeatherApiError);
    await expect(getCurrentWeather('FakeCity999')).rejects.toThrow('City not found');
  });

  test('throws WeatherApiError for 401 invalid API key', async () => {
    mock.onGet(/\/weather/).reply(401, { message: 'Invalid API key' });
    await expect(getCurrentWeather('Indianapolis')).rejects.toThrow('Invalid API key');
  });

  test('throws WeatherApiError for 429 rate limit', async () => {
    mock.onGet(/\/weather/).reply(429, {});
    await expect(getCurrentWeather('Indianapolis')).rejects.toThrow('Rate limit exceeded');
  });

  test('throws WeatherApiError when API key is missing', async () => {
  const savedKey = process.env.OPENWEATHER_API_KEY;
  process.env.OPENWEATHER_API_KEY = '';
  jest.resetModules();
  const { getCurrentWeather: getWeather } = require('../src/api/weatherApi');
  await expect(getWeather('Indianapolis')).rejects.toThrow('OPENWEATHER_API_KEY');
  process.env.OPENWEATHER_API_KEY = savedKey;
  });

  test('throws WeatherApiError on network error', async () => {
    mock.onGet(/\/weather/).networkError();
    await expect(getCurrentWeather('Indianapolis')).rejects.toThrow(WeatherApiError);
  });
});

describe('processForecast', () => {
  const rawForecast = {
    list: [
      { dt_txt: '2025-01-10 09:00:00', main: { temp: 20, feels_like: 19, humidity: 55 }, weather: [{ description: 'cloudy' }], wind: { speed: 2 } },
      { dt_txt: '2025-01-10 12:00:00', main: { temp: 23, feels_like: 22, humidity: 50 }, weather: [{ description: 'sunny' }], wind: { speed: 3 } },
      { dt_txt: '2025-01-11 12:00:00', main: { temp: 18, feels_like: 17, humidity: 70 }, weather: [{ description: 'rainy' }], wind: { speed: 5 } },
    ],
  };

  test('returns an array of daily summaries', () => {
    const result = processForecast(rawForecast);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  test('prefers noon reading for each date', () => {
    const result = processForecast(rawForecast);
    expect(result[0].description).toBe('sunny');
    expect(result[0].temp).toBe(23);
  });

  test('returns empty array for null input', () => {
    expect(processForecast(null)).toEqual([]);
  });

  test('returns empty array for missing list', () => {
    expect(processForecast({})).toEqual([]);
  });

  test('includes required fields in each entry', () => {
    const result = processForecast(rawForecast);
    const entry = result[0];
    expect(entry).toHaveProperty('date');
    expect(entry).toHaveProperty('temp');
    expect(entry).toHaveProperty('humidity');
    expect(entry).toHaveProperty('description');
  });
});

describe('calculateStats', () => {
  const weatherArray = [
    { name: 'Indianapolis', main: { temp: 22, humidity: 55 } },
    { name: 'Chicago', main: { temp: 15, humidity: 80 } },
    { name: 'Detroit', main: { temp: 18, humidity: 65 } },
  ];

  test('returns correct hottest city', () => {
    const stats = calculateStats(weatherArray);
    expect(stats.hottest.city).toBe('Indianapolis');
    expect(stats.hottest.temp).toBe(22);
  });

  test('returns correct coldest city', () => {
    const stats = calculateStats(weatherArray);
    expect(stats.coldest.city).toBe('Chicago');
  });

  test('returns correct most humid city', () => {
    const stats = calculateStats(weatherArray);
    expect(stats.mostHumid.city).toBe('Chicago');
    expect(stats.mostHumid.humidity).toBe(80);
  });

  test('calculates correct average temperature', () => {
    const stats = calculateStats(weatherArray);
    expect(stats.averageTemp).toBe(18.3);
  });

  test('returns null for empty array', () => {
    expect(calculateStats([])).toBeNull();
  });

  test('returns null for null input', () => {
    expect(calculateStats(null)).toBeNull();
  });
});
