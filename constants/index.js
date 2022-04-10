"use strict";

exports.__esModule = true;
exports.REQUEST_BIGCOMMERCE_LOGIN_URL = exports.REQUEST_BIGCOMMERCE_API_URL = exports.REQUEST_BIGCOMMERCE_API_PORT = exports.IS_PROD = exports.IS_DEV = exports.HTTPS_PROTOCOL = void 0;
var IS_DEV = process.env.NODE_ENV === "development";
exports.IS_DEV = IS_DEV;
var IS_PROD = process.env.NODE_ENV === "production";
exports.IS_PROD = IS_PROD;
var HTTPS_PROTOCOL = "https://";
exports.HTTPS_PROTOCOL = HTTPS_PROTOCOL;
var REQUEST_BIGCOMMERCE_LOGIN_URL = "login.bigcommerce.com";
exports.REQUEST_BIGCOMMERCE_LOGIN_URL = REQUEST_BIGCOMMERCE_LOGIN_URL;
var REQUEST_BIGCOMMERCE_API_URL = "api.bigcommerce.com";
exports.REQUEST_BIGCOMMERCE_API_URL = REQUEST_BIGCOMMERCE_API_URL;
var REQUEST_BIGCOMMERCE_API_PORT = 443;
exports.REQUEST_BIGCOMMERCE_API_PORT = REQUEST_BIGCOMMERCE_API_PORT;
//# sourceMappingURL=index.js.map
