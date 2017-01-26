import {
  isArray,
  isFunction,
  reduceRight
} from 'lodash';

export default class Middleware {
  middleware = [];

  constructor(middleware) {
    this.use(middleware);
  }

  /**
   * Add middleware
   * @param  {Function} middleware
   */
  use(middleware = []) {
    if (!isArray(middleware)) {
      middleware = [middleware];
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const fn of middleware) {
      if (!isFunction(fn)) {
        throw new TypeError('Middleware must be composed of functions!');
      }
    }
    this.middleware = [...this.middleware, ...middleware];
  }

  /**
   * Compose all middleware
   * @return {Function}
   */
  compose(...args) {
    let lastResult;
    return reduceRight(this.middleware, (mw, fn) => {
      const next = async function next(...result) {
        if (!result.length) {
          result = args;
        }
        lastResult = result[0];
        await mw.call(this, ...result);
      };
      return async function composed(...result) {
        if (!result.length) {
          result = args;
        }
        await fn.call(this, next, ...result);
        return lastResult;
      };
    }, () => null)();
  }
}
