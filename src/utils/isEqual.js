import _ from "lodash";
import { isEmpty } from "./typeCheck";

/**
 * @description Check if the given parameters are equal
 * @param {Object|Array|String|Number} e
 * @param {Object|Array|String|Number} f
 * @returns {Boolean} True if the given parameters are equal
 */
export const isEqual = (e, f) => !isEmpty(e) && !isEmpty(f) && _.isEqual(e, f);
