/**
 * @file fileHandler.test.js
 * @description Unit tests for fileHandler utility
 */

const fs = require('fs');
const path = require('path');
const { saveJson, saveReport, readJson, buildWeatherReport } = require('../src/utils/fileHandler');

const TEST_OUTPUT = path.join(__dirname, '../output');

// Clean up test files after each test
afterEach(() => {
  const files = fs.readdirSync(TEST_OUTPUT).filter((f) => f.startsWith('test_'));
  files.forEach((f) => fs.unlinkSync(path.join(TEST_OUTPUT, f)));
});

describe('saveJson', () => {
  test('saves a JSON file and returns the path', () => {
    const filePath = saveJson('test_data', { hello: 'world' });
    expect(fs.existsSync(filePath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(content.hello).toBe('world');
  });

  test('creates output directory if it does not exist', () => {
    const filePath = saveJson('test_dir_create', { a: 1 });
    expect(fs.existsSync(filePath)).toBe(true);
  });
});

describe('saveReport', () => {
  test('saves a markdown report and returns the path', () => {
    const filePath = saveReport('test_report', '# Title\n\nSome content.');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('# Title');
  });
});

describe('readJson', () => {
  test('reads and parses a JSON file', () => {
    const filePath = saveJson('test_read', { key: 'value' });
    const data = readJson(filePath);
    expect(data.key).toBe('value');
  });

  test('throws an error for non-existent file', () => {
    expect(() => readJson('/tmp/does_not_exist_99999.json')).toThrow();
  });
});

describe('buildWeatherReport', () => {
  const mockWeather = {
    name: 'Indianapolis',
    main: { temp: 22, feels_like: 21, humidity: 60, temp_min: 18, temp_max: 25 },
    weather: [{ description: 'clear sky' }],
    wind: { speed: 3.5 },
    sys: { country: 'US' },
  };

  test('returns a markdown string with city name', () => {
    const report = buildWeatherReport(mockWeather);
    expect(report).toContain('Indianapolis');
    expect(report).toContain('# 🌤 Weather Report');
  });

  test('includes country section when countryData provided', () => {
    const country = { name: { common: 'United States' }, capital: ['Washington, D.C.'], region: 'Americas', population: 331000000, currencies: { USD: { name: 'US Dollar' } } };
    const report = buildWeatherReport(mockWeather, country);
    expect(report).toContain('Country Info');
    expect(report).toContain('Washington, D.C.');
  });

  test('includes forecast section when forecast provided', () => {
    const forecast = [{ date: '2025-01-10', temp: 20, description: 'sunny' }];
    const report = buildWeatherReport(mockWeather, null, forecast);
    expect(report).toContain('5-Day Forecast');
    expect(report).toContain('2025-01-10');
  });

  test('does not include forecast section when none provided', () => {
    const report = buildWeatherReport(mockWeather);
    expect(report).not.toContain('5-Day Forecast');
  });
});
