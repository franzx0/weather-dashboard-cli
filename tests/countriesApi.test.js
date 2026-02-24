/**
 * @file countriesApi.test.js
 * @description Unit tests for countriesApi module
 */

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const {
  getCountryByCode,
  getCountryByName,
  summarizeCountry,
  CountriesApiError,
} = require('../src/api/countriesApi');

const mock = new MockAdapter(axios);

afterEach(() => mock.reset());

const mockCountry = {
  name: { common: 'United States', official: 'United States of America' },
  capital: ['Washington, D.C.'],
  region: 'Americas',
  subregion: 'North America',
  population: 331000000,
  currencies: { USD: { name: 'United States dollar', symbol: '$' } },
  languages: { eng: 'English' },
  timezones: ['UTC-12:00'],
  flag: '🇺🇸',
};

describe('getCountryByCode', () => {
  test('returns country data for valid code', async () => {
    mock.onGet(/\/alpha\/US/).reply(200, [mockCountry]);
    const result = await getCountryByCode('US');
    expect(result.name.common).toBe('United States');
  });

  test('throws CountriesApiError for 404', async () => {
    mock.onGet(/\/alpha\/XX/).reply(404, {});
    await expect(getCountryByCode('XX')).rejects.toThrow(CountriesApiError);
  });

  test('throws CountriesApiError on network error', async () => {
    mock.onGet(/\/alpha\/US/).networkError();
    await expect(getCountryByCode('US')).rejects.toThrow(CountriesApiError);
  });
});

describe('getCountryByName', () => {
  test('returns first country for a name match', async () => {
    mock.onGet(/\/name\/United States/).reply(200, [mockCountry]);
    const result = await getCountryByName('United States');
    expect(result.name.common).toBe('United States');
  });

  test('returns null for 404 without throwing', async () => {
    mock.onGet(/\/name\/Neverland/).reply(404, {});
    const result = await getCountryByName('Neverland');
    expect(result).toBeNull();
  });
});

describe('summarizeCountry', () => {
  test('extracts expected fields', () => {
    const summary = summarizeCountry(mockCountry);
    expect(summary.name).toBe('United States');
    expect(summary.capital).toBe('Washington, D.C.');
    expect(summary.region).toBe('Americas');
    expect(summary.population).toBe(331000000);
    expect(summary.currency).toBe('United States dollar');
    expect(summary.languages).toBe('English');
  });

  test('returns null for null input', () => {
    expect(summarizeCountry(null)).toBeNull();
  });

  test('handles missing optional fields gracefully', () => {
    const minimal = { name: { common: 'Test' } };
    const summary = summarizeCountry(minimal);
    expect(summary.name).toBe('Test');
    expect(summary.capital).toBe('N/A');
    expect(summary.currency).toBe('N/A');
  });
});
