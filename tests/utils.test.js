// Additional utils tests per project spec
const logger = require('../src/utils/logger');

test('logger.info does not throw', () => {
  expect(() => logger.info('test info')).not.toThrow();
});

test('logger.warn does not throw', () => {
  expect(() => logger.warn('test warning')).not.toThrow();
});

test('logger.error does not throw', () => {
  expect(() => logger.error('test error')).not.toThrow();
});

test('logger.success does not throw', () => {
  expect(() => logger.success('test success')).not.toThrow();
});

test('logger.debug does not throw', () => {
  expect(() => logger.debug('test debug')).not.toThrow();
});
