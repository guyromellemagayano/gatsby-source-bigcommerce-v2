"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _https = _interopRequireDefault(require("https"));

var _zlib = _interopRequireDefault(require("zlib"));

var _constants = require("../constants");

var _convertValues = require("./convertValues");

function handleBodyResponse(res, body, resolve, reject, logger) {
	try {
		var _JSONObject$error, _JSONObject$errors;

		if (!/application\/json/.test(res.headers["content-type"]) || body.trim() === "") {
			logger.error("The response body from the BigCommerce API is not in JSON format.");
			return resolve(body);
		}

		var JSONObject = (0, _convertValues.handleConversionStringToObject)(body);
		var JSONError = (_JSONObject$error = JSONObject === null || JSONObject === void 0 ? void 0 : JSONObject.error) !== null && _JSONObject$error !== void 0 ? _JSONObject$error : null;
		var JSONErrors = (_JSONObject$errors = JSONObject === null || JSONObject === void 0 ? void 0 : JSONObject.errors) !== null && _JSONObject$errors !== void 0 ? _JSONObject$errors : null;

		if (JSONError !== null || JSONErrors !== null) {
			var err = new Error(JSONError || (0, _convertValues.handleConversionObjectToString)(JSONErrors));
			return reject(err);
		}

		return resolve(JSONObject);
	} catch (err) {
		err.responseBody = body;
		return reject(err);
	}
}

var Request = (function () {
	function Request(hostname, _temp) {
		if (hostname === void 0) {
			hostname = null;
		}

		var _ref = _temp === void 0 ? {} : _temp,
			_ref$headers = _ref.headers,
			headers = _ref$headers === void 0 ? {} : _ref$headers,
			_ref$agent = _ref.agent,
			agent = _ref$agent === void 0 ? null : _ref$agent,
			_ref$logger = _ref.logger,
			logger = _ref$logger === void 0 ? null : _ref$logger;

		hostname == null && headers == null
			? (function () {
					var errMessage = new Error("The hostname and headers are required to make the call to the server.");
					throw errMessage;
			  })()
			: null;
		logger == null
			? (function () {
					var errMessage = new Error("The logger is required to make the call to the server. Something is wrong.");
					throw errMessage;
			  })()
			: null;
		this.hostname = hostname;
		this.headers = headers;
		this.agent = agent;
		this.logger = logger;
		this.protocol = "https:";
	}

	var _proto = Request.prototype;

	_proto.run = function run(method, path, data) {
		var _this = this;

		if (data === void 0) {
			data = null;
		}

		var dataString = data !== null ? (0, _convertValues.handleConversionObjectToString)(data) : null;
		var options = {
			path: path,
			protocol: this.protocol,
			hostname: this.hostname,
			port: 443,
			method: (0, _convertValues.handleConversionStringToUppercase)(method),
			gzip: true,
			headers: Object.assign(
				{
					"Content-Type": "application/json"
				},
				this.headers
			)
		};

		if (this.agent !== null) {
			options.agent = this.agent;
		}

		if (dataString !== null) {
			options.headers["Content-Length"] = Buffer.from(dataString).length;
		}

		return new Promise(function (resolve, reject) {
			var req = _https.default.request(options, function (res) {
				_this.logger.info("" + ("[" + method.toUpperCase() + "] " + _constants.HTTPS_PROTOCOL + _this.hostname + path));

				if (Math.round(res.statusCode / 100) === 2) {
					_this.logger.debug("" + (res.statusCode + " " + res.statusMessage));
				} else if (Math.round(res.statusCode / 100) === 4 || Math.round(res.statusCode / 100) === 5) {
					_this.logger.debug("" + (res.statusCode + " " + res.statusMessage));
				} else {
					_this.logger.debug("" + (res.statusCode + " " + res.statusMessage));
				}

				var body = "";
				var statusCode = res.statusCode;

				if (Math.round(statusCode / 100) === 4) {
					if (statusCode === 429) {
						var _res$headers$xRetry, _res$headers;

						var xRetryAfterHeader =
							(_res$headers$xRetry = res === null || res === void 0 ? void 0 : (_res$headers = res.headers) === null || _res$headers === void 0 ? void 0 : _res$headers["x-retry-after"]) !== null && _res$headers$xRetry !== void 0
								? _res$headers$xRetry
								: null;

						if (xRetryAfterHeader !== null) {
							_this.logger.info("The BigCommerce API rate limit has been reached. Please wait " + xRetryAfterHeader + " seconds before making another request.");
						}

						return setTimeout(function () {
							_this.logger.info("Restarting request...");

							_this.logger.info("" + ("[" + method.toUpperCase() + "] " + _constants.HTTPS_PROTOCOL + _this.hostname + path));

							_this.run(method, path, data).then(resolve).catch(reject);
						}, xRetryAfterHeader * 1000);
					}
				}

				res.on("data", function (chunk) {
					return (body += chunk);
				});
				res.on("end", function () {
					if (statusCode >= 400 && statusCode <= 600) {
						var errMessage = new Error("BigCommerce API request failed with status code " + statusCode + ".");
						errMessage.statusCode = statusCode;
						errMessage.body = body;
						return reject(errMessage);
					}

					return _zlib.default.gzip(body, function (err, data) {
						if (err) {
							return reject(err);
						}

						_zlib.default.gunzip(data, function (err, data) {
							if (err) {
								return reject(err);
							}

							return handleBodyResponse(res, data.toString("utf8"), resolve, reject, _this.logger);
						});
					});
				});
			});

			dataString !== null
				? (function () {
						_this.logger.info("Sending BigCommerce data...");

						_this.logger.info("" + ("[" + method.toUpperCase() + "] " + _constants.HTTPS_PROTOCOL + _this.hostname + path));

						req.write(dataString);

						_this.logger.info("Sending complete.");
				  })()
				: null;
			req.on("error", function (err) {
				return reject(err);
			});
			req.end();
		});
	};

	return Request;
})();

var _default = Request;
exports.default = _default;
//# sourceMappingURL=request.js.map
