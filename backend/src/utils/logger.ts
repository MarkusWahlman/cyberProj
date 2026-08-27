/**
 * Temporary simple logger implementation.
 * To be replaced with Winston + Loki in the future.
 */
const logger = {
  info: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(...args);
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(...args);
  },
  debug: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.debug(...args);
  }
};

export default logger;
