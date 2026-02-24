// Re-exports the weatherApi and countriesApi tests for the required api.test.js file per project spec
// Full tests are in weatherApi.test.js and countriesApi.test.js
const { processForecast, calculateStats } = require('../src/api/weatherApi');
const { summarizeCountry } = require('../src/api/countriesApi');

test('processForecast handles empty list', () => {
  expect(processForecast({ list: [] })).toEqual([]);
});

test('calculateStats single city', () => {
  const data = [{ name: 'A', main: { temp: 10, humidity: 50 } }];
  const stats = calculateStats(data);
  expect(stats.hottest.city).toBe('A');
  expect(stats.coldest.city).toBe('A');
  expect(stats.averageTemp).toBe(10);
});

test('summarizeCountry handles empty currencies', () => {
  const result = summarizeCountry({ name: { common: 'TestLand' }, currencies: {} });
  expect(result.currency).toBe('N/A');
});
