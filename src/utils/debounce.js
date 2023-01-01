import _ from "lodash";

/**
 * @description Perform debounce operation
 * @param {Function} func
 * @param {Number} delay
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => _.debounce(func, delay);
