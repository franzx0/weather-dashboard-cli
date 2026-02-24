/**
 * @file validator.test.js
 * @description Unit tests for the validator utility
 */

const {
  validateCity,
  validateCompare,
  validateForecastDays,
  validateWeatherResponse,
} = require('../src/utils/validator');

describe('validateCity', () => {
  test('accepts a valid city name', () => {
    const result = validateCity('Indianapolis');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('accepts city names with spaces', () => {
    const result = validateCity('New York');
    expect(result.valid).toBe(true);
  });

  test('accepts city names with hyphens', () => {
    const result = validateCity('Winston-Salem');
    expect(result.valid).toBe(true);
  });

  test('rejects empty string', () => {
    const result = validateCity('');
    expect(result.valid).toBe(false);
    expect(result.error).not.toBeNull();
  });

  test('rejects single character', () => {
    const result = validateCity('A');
    expect(result.valid).toBe(false);
  });

  test('rejects city names with numbers', () => {
    const result = validateCity('City123');
    expect(result.valid).toBe(false);
  });

  test('rejects null', () => {
    const result = validateCity(null);
    expect(result.valid).toBe(false);
  });
});

describe('validateCompare', () => {
  test('accepts two cities', () => {
    const result = validateCompare('Indianapolis,Chicago');
    expect(result.valid).toBe(true);
  });

  test('accepts three cities', () => {
    const result = validateCompare('Indianapolis,Chicago,Detroit');
    expect(result.valid).toBe(true);
  });

  test('rejects single city (no comma)', () => {
    const result = validateCompare('Indianapolis');
    expect(result.valid).toBe(false);
  });

  test('rejects empty string', () => {
    const result = validateCompare('');
    expect(result.valid).toBe(false);
  });
});

describe('validateForecastDays', () => {
  test('accepts 1', () => expect(validateForecastDays(1).valid).toBe(true));
  test('accepts 5', () => expect(validateForecastDays(5).valid).toBe(true));
  test('accepts 7', () => expect(validateForecastDays(7).valid).toBe(true));

  test('rejects 0', () => expect(validateForecastDays(0).valid).toBe(false));
  test('rejects 8', () => expect(validateForecastDays(8).valid).toBe(false));
  test('rejects -1', () => expect(validateForecastDays(-1).valid).toBe(false));
  test('rejects non-integer', () => expect(validateForecastDays(2.5).valid).toBe(false));
});

describe('validateWeatherResponse', () => {
  const validResponse = {
    name: 'Indianapolis',
    main: { temp: 22, feels_like: 21, humidity: 60, temp_min: 18, temp_max: 25 },
    weather: [{ description: 'clear sky', icon: '01d' }],
    wind: { speed: 3.5 },
    sys: { country: 'US' },
  };

  test('validates a correct weather response', () => {
    const result = validateWeatherResponse(validResponse);
    expect(result.valid).toBe(true);
  });

  test('rejects missing main field', () => {
    const bad = { ...validResponse };
    delete bad.main;
    expect(validateWeatherResponse(bad).valid).toBe(false);
  });

  test('rejects empty weather array', () => {
    const bad = { ...validResponse, weather: [] };
    expect(validateWeatherResponse(bad).valid).toBe(false);
  });

  test('rejects missing name', () => {
    const bad = { ...validResponse };
    delete bad.name;
    expect(validateWeatherResponse(bad).valid).toBe(false);
  });
});
