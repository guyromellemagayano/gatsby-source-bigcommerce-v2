"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _crypto = _interopRequireDefault(require("crypto"));

var _constants = require("../constants");

var _convertValues = require("./convertValues");

var _request2 = _interopRequireDefault(require("./request"));

var BigCommerce = (function () {
	function BigCommerce(config) {
		if (!config) {
			var errMessage = new Error("Config missing. The config object is required to make any call to the " + "BigCommerce API");
			throw errMessage;
		}

		this.config = config;
		this.grantType = "authorization_code";
	}

	var _proto = BigCommerce.prototype;

	_proto.createAPIRequest = function createAPIRequest(endpoint) {
		var acceptHeader = this.config.responseType === "xml" ? "application/xml" : "application/json";
		return new _request2.default(endpoint, {
			headers: Object.assign({
				"Accept": acceptHeader,
				"X-Auth-Client": this.config.clientId,
				"X-Auth-Token": this.config.accessToken
			}),
			failOnLimitReached: this.config.failOnLimitReached,
			agent: this.config.agent
		});
	};

	_proto.verify = (function () {
		var _verify = (0, _asyncToGenerator2.default)(
			_regenerator.default.mark(function _callee(signedRequest) {
				var splitRequest, signature, json, data, expected;
				return _regenerator.default.wrap(
					function _callee$(_context) {
						while (1) {
							switch ((_context.prev = _context.next)) {
								case 0:
									!signedRequest ? console.error(_constants.FG_RED, "The signed request is required to verify the call.") : null;
									splitRequest = signedRequest.split(".");
									splitRequest.length < 2 ? console.error(_constants.FG_RED, "The signed request will come in two parts seperated by a .(full stop). " + "this signed request contains less than 2 parts.") : null;
									signature = Buffer.from(splitRequest[1], "base64").toString("utf8");
									json = Buffer.from(splitRequest[0], "base64").toString("utf8");
									data = (0, _convertValues.handleConversionStringToObject)(json);
									expected = _crypto.default.createHmac("sha256", this.config.secret).update(json).digest("hex");
									console.log(_constants.FG_BLUE, "\nJSON: " + json);
									console.log(_constants.FG_BLUE, "\nSIGNATURE: " + signature);
									console.log(_constants.FG_BLUE, "\nEXPECTED SIGNATURE: " + expected);
									expected.length !== signature.length || _crypto.default.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8")) ? console.error(_constants.FG_RED, "The signature is invalid.") : null;
									console.log(_constants.FG_GREEN, "The signature is valid.");
									return _context.abrupt("return", data);

								case 13:
								case "end":
									return _context.stop();
							}
						}
					},
					_callee,
					this
				);
			})
		);

		function verify(_x) {
			return _verify.apply(this, arguments);
		}

		return verify;
	})();

	_proto.authorize = (function () {
		var _authorize = (0, _asyncToGenerator2.default)(
			_regenerator.default.mark(function _callee2(query) {
				var _yield$query, code, scope, context, queryCode, queryScope, queryContext, payload, request, oauthToken;

				return _regenerator.default.wrap(
					function _callee2$(_context2) {
						while (1) {
							switch ((_context2.prev = _context2.next)) {
								case 0:
									!query ? console.error(_constants.FG_RED, "The URL query paramaters are required.") : null;
									_context2.next = 3;
									return query;

								case 3:
									_yield$query = _context2.sent;
									code = _yield$query.code;
									scope = _yield$query.scope;
									context = _yield$query.context;
									queryCode = code !== null && code !== void 0 ? code : null;
									queryScope = scope !== null && scope !== void 0 ? scope : null;
									queryContext = context !== null && context !== void 0 ? context : null;
									payload = {
										client_id: this.config.clientId,
										client_secret: this.config.secret,
										grant_type: this.grantType,
										code: queryCode,
										scope: queryScope,
										context: queryContext
									};
									request = this.createAPIRequest(_constants.REQUEST_BIGCOMMERCE_LOGIN_URL);
									oauthToken = "/oauth2/token";
									_context2.next = 15;
									return request.run("post", oauthToken, payload);

								case 15:
									return _context2.abrupt("return", _context2.sent);

								case 16:
								case "end":
									return _context2.stop();
							}
						}
					},
					_callee2,
					this
				);
			})
		);

		function authorize(_x2) {
			return _authorize.apply(this, arguments);
		}

		return authorize;
	})();

	_proto.request = (function () {
		var _request = (0, _asyncToGenerator2.default)(
			_regenerator.default.mark(function _callee3(type, path, data) {
				var extension, request, version, fullPath, response, _response$meta$pagina, totalPages, currentPage, promises, nextPage, endpointUrl, responses;

				return _regenerator.default.wrap(
					function _callee3$(_context3) {
						while (1) {
							switch ((_context3.prev = _context3.next)) {
								case 0:
									if (data === void 0) {
										data = null;
									}

									this.config.accessToken == null ? console.error(_constants.FG_RED, "The access token is required to make BigCommerce API requests.") : null;
									this.config.storeHash == null ? console.error(_constants.FG_RED, "The store hash is required to make BigCommerce API requests.") : null;
									extension = this.config.responseType === "xml" ? ".xml" : "";
									request = this.createAPIRequest(_constants.REQUEST_BIGCOMMERCE_API_URL);
									version = !path.includes("v3") ? path.replace(/(\?|$)/, extension + "$1") : path;
									fullPath = "/stores/" + this.config.storeHash;
									fullPath += version;
									_context3.next = 10;
									return request.run(type, fullPath, data);

								case 10:
									response = _context3.sent;

									if (!("meta" in response && "pagination" in response.meta)) {
										_context3.next = 22;
										break;
									}

									(_response$meta$pagina = response.meta.pagination), (totalPages = _response$meta$pagina.total_pages), (currentPage = _response$meta$pagina.current_page);

									if (!(totalPages > currentPage)) {
										_context3.next = 22;
										break;
									}

									promises = [];

									for (nextPage = currentPage + 1; nextPage <= totalPages; nextPage++) {
										endpointUrl = new URL(fullPath, "https://" + request.hostname);
										endpointUrl.searchParams.set("page", nextPage);
										promises.push(request.run(type, "" + endpointUrl.pathname + endpointUrl.search, data));
									}

									_context3.next = 18;
									return Promise.all(promises);

								case 18:
									responses = _context3.sent;
									responses.forEach(function (pageResponse) {
										response.data = response.data.concat(pageResponse.data);
									});
									response.meta.pagination.total_pages = totalPages;
									response.meta.pagination.current_page = totalPages;

								case 22:
									return _context3.abrupt("return", response);

								case 23:
								case "end":
									return _context3.stop();
							}
						}
					},
					_callee3,
					this
				);
			})
		);

		function request(_x3, _x4, _x5) {
			return _request.apply(this, arguments);
		}

		return request;
	})();

	_proto.get = (function () {
		var _get = (0, _asyncToGenerator2.default)(
			_regenerator.default.mark(function _callee4(path) {
				return _regenerator.default.wrap(
					function _callee4$(_context4) {
						while (1) {
							switch ((_context4.prev = _context4.next)) {
								case 0:
									_context4.next = 2;
									return this.request("get", path);

								case 2:
									return _context4.abrupt("return", _context4.sent);

								case 3:
								case "end":
									return _context4.stop();
							}
						}
					},
					_callee4,
					this
				);
			})
		);

		function get(_x6) {
			return _get.apply(this, arguments);
		}

		return get;
	})();

	_proto.post = (function () {
		var _post = (0, _asyncToGenerator2.default)(
			_regenerator.default.mark(function _callee5(path, data) {
				return _regenerator.default.wrap(
					function _callee5$(_context5) {
						while (1) {
							switch ((_context5.prev = _context5.next)) {
								case 0:
									_context5.next = 2;
									return this.request("post", path, data);

								case 2:
									return _context5.abrupt("return", _context5.sent);

								case 3:
								case "end":
									return _context5.stop();
							}
						}
					},
					_callee5,
					this
				);
			})
		);

		function post(_x7, _x8) {
			return _post.apply(this, arguments);
		}

		return post;
	})();

	_proto.put = (function () {
		var _put = (0, _asyncToGenerator2.default)(
			_regenerator.default.mark(function _callee6(path, data) {
				return _regenerator.default.wrap(
					function _callee6$(_context6) {
						while (1) {
							switch ((_context6.prev = _context6.next)) {
								case 0:
									_context6.next = 2;
									return this.request("put", path, data);

								case 2:
									return _context6.abrupt("return", _context6.sent);

								case 3:
								case "end":
									return _context6.stop();
							}
						}
					},
					_callee6,
					this
				);
			})
		);

		function put(_x9, _x10) {
			return _put.apply(this, arguments);
		}

		return put;
	})();

	_proto.delete = (function () {
		var _delete2 = (0, _asyncToGenerator2.default)(
			_regenerator.default.mark(function _callee7(path) {
				return _regenerator.default.wrap(
					function _callee7$(_context7) {
						while (1) {
							switch ((_context7.prev = _context7.next)) {
								case 0:
									_context7.next = 2;
									return this.request("delete", path);

								case 2:
									return _context7.abrupt("return", _context7.sent);

								case 3:
								case "end":
									return _context7.stop();
							}
						}
					},
					_callee7,
					this
				);
			})
		);

		function _delete(_x11) {
			return _delete2.apply(this, arguments);
		}

		return _delete;
	})();

	return BigCommerce;
})();

var _default = BigCommerce;
exports.default = _default;
//# sourceMappingURL=bigcommerce.js.map
