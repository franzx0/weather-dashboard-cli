/**
 * @file logger.js
 * @description Simple logging utility with severity levels and colored output
 */

const chalk = require('chalk');

/**
 * Log an informational message
 * @param {string} message - The message to log
 */
const info = (message) => {
  console.log(chalk.blue('[INFO]'), message);
};

/**
 * Log a success message
 * @param {string} message - The message to log
 */
const success = (message) => {
  console.log(chalk.green('[SUCCESS]'), message);
};

/**
 * Log a warning message
 * @param {string} message - The message to log
 */
const warn = (message) => {
  console.warn(chalk.yellow('[WARN]'), message);
};

/**
 * Log an error message
 * @param {string} message - The message to log
 * @param {Error} [error] - Optional error object for stack trace
 */
const error = (message, err) => {
  console.error(chalk.red('[ERROR]'), message);
  if (err && process.env.DEBUG === 'true') {
    console.error(chalk.red(err.stack));
  }
};

/**
 * Log a debug message (only shown when DEBUG=true)
 * @param {string} message - The message to log
 */
const debug = (message) => {
  if (process.env.DEBUG === 'true') {
    console.log(chalk.gray('[DEBUG]'), message);
  }
};

module.exports = { info, success, warn, error, debug };
