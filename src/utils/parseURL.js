/**
 * @description Parse URLs
 * @param {string} url
 * @returns {Object} Parsed URL
 */
const parseURL = (url) => new URL(url);

/**
 * @description Return the current URL host
 * @param {string} url
 * @returns {string} Current URL host
 */
export const getURLHost = (url) => parseURL(url).host;

/**
 * @description Return the current URL hostname
 * @param {string} url
 * @returns {string} Current URL hostname
 */
export const getURLHostname = (url) => parseURL(url).hostname;

/**
 * @description Return the current URL pathname
 * @param {string} url
 * @returns {string} Current URL pathname
 */
export const getURLPathname = (url) => (url ? parseURL(url).pathname : "#");

/**
 * @description Return the current URL protocol
 * @param {string} url
 * @returns {string} Current URL protocol
 */
export const getURLProtocol = (url) => parseURL(url).protocol;

/**
 * @description Return the current URL search
 * @param {string} url
 * @returns {string} Current URL search
 */
export const getURLSearch = (url) => parseURL(url).search;

/**
 * @description Return the current URL hash
 * @param {string} url
 * @returns {string} Current URL hash
 */
export const getURLHash = (url) => parseURL(url).hash;

/**
 * @description Return the current URL origin
 * @param {string} url
 * @returns {string} Current URL origin
 */
export const getURLOrigin = (url) => parseURL(url).origin;

/**
 * @description Return the current URL port
 * @param {string} url
 * @returns {string} Current URL port
 */
export const getURLPort = (url) => parseURL(url).port;

/**
 * @description Return the current URL searchParams
 * @param {string} url
 * @returns {string} Current URL searchParams
 */
export const getURLSearchParams = (url) => parseURL(url).searchParams;
