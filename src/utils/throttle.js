import _ from "lodash";

/**
 * @description Perform throttle operation
 * @param {Function} func
 * @param {Number} delay
 * @returns {Function} Debounced function
 */
export const throttle = (func, delay) => _.throttle(func, delay);
