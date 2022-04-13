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
			var errMessage = new Error("Config missing. The config object is required to make any call to the BigCommerce API");
			throw errMessage;
		}

		this.config = config;
		this.grantType = "authorization_code";
	}

	var _proto = BigCommerce.prototype;

	_proto.createAPIRequest = function createAPIRequest(endpoint) {
		var accept = this.config.responseType === "xml" ? "application/xml" : "application/json";
		return new _request2.default(endpoint, {
			headers: Object.assign(
				{
					"Accept": accept,
					"X-Auth-Client": this.config.clientId,
					"X-Auth-Token": this.config.accessToken
				},
				this.config.headers
			),
			logger: this.config.logger,
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
									!signedRequest ? this.config.logger.error("The signed request is required to verify the call.") : null;
									splitRequest = signedRequest.split(".");
									splitRequest.length < 2 ? this.config.logger.error("The signed request will come in two parts seperated by a .(full stop). " + "this signed request contains less than 2 parts.") : null;
									signature = Buffer.from(splitRequest[1], "base64").toString("utf8");
									json = Buffer.from(splitRequest[0], "base64").toString("utf8");
									data = (0, _convertValues.handleConversionStringToObject)(json);
									expected = _crypto.default.createHmac("sha256", this.config.secret).update(json).digest("hex");
									this.config.logger.info("JSON: " + json);
									this.config.logger.info("SIGNATURE: " + signature);
									this.config.logger.info("EXPECTED SIGNATURE: " + expected);
									expected.length !== signature.length || _crypto.default.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8")) ? this.config.logger.error("The signature is invalid.") : null;
									this.config.logger.info("The signature is valid.");
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
									!query ? this.config.logger.error("The URL query paramaters are required.") : null;
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

									this.config.accessToken == null ? this.config.logger.error("The access token is required to make BigCommerce API requests.") : null;
									this.config.storeHash == null ? this.config.logger.error("The store hash is required to make BigCommerce API requests.") : null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy9iaWdjb21tZXJjZS5qcyJdLCJuYW1lcyI6WyJCaWdDb21tZXJjZSIsImNvbmZpZyIsImVyck1lc3NhZ2UiLCJFcnJvciIsImdyYW50VHlwZSIsImNyZWF0ZUFQSVJlcXVlc3QiLCJlbmRwb2ludCIsImFjY2VwdCIsInJlc3BvbnNlVHlwZSIsIlJlcXVlc3QiLCJoZWFkZXJzIiwiT2JqZWN0IiwiYXNzaWduIiwiY2xpZW50SWQiLCJhY2Nlc3NUb2tlbiIsImxvZ2dlciIsImFnZW50IiwidmVyaWZ5Iiwic2lnbmVkUmVxdWVzdCIsImVycm9yIiwic3BsaXRSZXF1ZXN0Iiwic3BsaXQiLCJsZW5ndGgiLCJzaWduYXR1cmUiLCJCdWZmZXIiLCJmcm9tIiwidG9TdHJpbmciLCJqc29uIiwiZGF0YSIsImV4cGVjdGVkIiwiY3J5cHRvIiwiY3JlYXRlSG1hYyIsInNlY3JldCIsInVwZGF0ZSIsImRpZ2VzdCIsImluZm8iLCJ0aW1pbmdTYWZlRXF1YWwiLCJhdXRob3JpemUiLCJxdWVyeSIsImNvZGUiLCJzY29wZSIsImNvbnRleHQiLCJxdWVyeUNvZGUiLCJxdWVyeVNjb3BlIiwicXVlcnlDb250ZXh0IiwicGF5bG9hZCIsImNsaWVudF9pZCIsImNsaWVudF9zZWNyZXQiLCJncmFudF90eXBlIiwicmVxdWVzdCIsIlJFUVVFU1RfQklHQ09NTUVSQ0VfTE9HSU5fVVJMIiwib2F1dGhUb2tlbiIsInJ1biIsInR5cGUiLCJwYXRoIiwic3RvcmVIYXNoIiwiZXh0ZW5zaW9uIiwiUkVRVUVTVF9CSUdDT01NRVJDRV9BUElfVVJMIiwidmVyc2lvbiIsImluY2x1ZGVzIiwicmVwbGFjZSIsImZ1bGxQYXRoIiwicmVzcG9uc2UiLCJtZXRhIiwicGFnaW5hdGlvbiIsInRvdGFsUGFnZXMiLCJ0b3RhbF9wYWdlcyIsImN1cnJlbnRQYWdlIiwiY3VycmVudF9wYWdlIiwicHJvbWlzZXMiLCJuZXh0UGFnZSIsImVuZHBvaW50VXJsIiwiVVJMIiwiaG9zdG5hbWUiLCJzZWFyY2hQYXJhbXMiLCJzZXQiLCJwdXNoIiwicGF0aG5hbWUiLCJzZWFyY2giLCJQcm9taXNlIiwiYWxsIiwicmVzcG9uc2VzIiwiZm9yRWFjaCIsInBhZ2VSZXNwb25zZSIsImNvbmNhdCIsImdldCIsInBvc3QiLCJwdXQiLCJkZWxldGUiXSwibWFwcGluZ3MiOiJBQUNBOzs7Ozs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUNBOztJQUVNQSxXO0FBQ0wsdUJBQVlDLE1BQVosRUFBb0I7QUFDbkIsUUFBSSxDQUFDQSxNQUFMLEVBQWE7QUFDWixVQUFNQyxVQUFVLEdBQUcsSUFBSUMsS0FBSixDQUFVLHVGQUFWLENBQW5CO0FBRUEsWUFBTUQsVUFBTjtBQUNBOztBQUVELFNBQUtELE1BQUwsR0FBY0EsTUFBZDtBQUNBLFNBQUtHLFNBQUwsR0FBaUIsb0JBQWpCO0FBQ0E7Ozs7U0FHREMsZ0IsR0FBQSwwQkFBaUJDLFFBQWpCLEVBQTJCO0FBQzFCLFFBQU1DLE1BQU0sR0FBRyxLQUFLTixNQUFMLENBQVlPLFlBQVosS0FBNkIsS0FBN0IsR0FBcUMsaUJBQXJDLEdBQXlELGtCQUF4RTtBQUVBLFdBQU8sSUFBSUMsaUJBQUosQ0FBWUgsUUFBWixFQUFzQjtBQUM1QkksTUFBQUEsT0FBTyxFQUFFQyxNQUFNLENBQUNDLE1BQVAsQ0FDUjtBQUNDLGtCQUFVTCxNQURYO0FBRUMseUJBQWlCLEtBQUtOLE1BQUwsQ0FBWVksUUFGOUI7QUFHQyx3QkFBZ0IsS0FBS1osTUFBTCxDQUFZYTtBQUg3QixPQURRLEVBTVIsS0FBS2IsTUFBTCxDQUFZUyxPQU5KLENBRG1CO0FBUzVCSyxNQUFBQSxNQUFNLEVBQUUsS0FBS2QsTUFBTCxDQUFZYyxNQVRRO0FBVTVCQyxNQUFBQSxLQUFLLEVBQUUsS0FBS2YsTUFBTCxDQUFZZTtBQVZTLEtBQXRCLENBQVA7QUFZQSxHOztTQUdLQyxNOzRFQUFOLGlCQUFhQyxhQUFiO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVDLGVBQUNBLGFBQUQsR0FBaUIsS0FBS2pC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SUFBcEIsRUFBMEIxQixJQUExQixDQURkOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSzs7Ozs7Ozs7O1NBS000RCxNOzZFQUFOLGtCQUFhbEMsSUFBYjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFDYyxLQUFLTCxPQUFMLENBQWEsUUFBYixFQUF1QkssSUFBdkIsQ0FEZDs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEs7Ozs7Ozs7Ozs7OztlQUtjdEQsVyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IGNyeXB0byBmcm9tIFwiY3J5cHRvXCI7XG5pbXBvcnQgeyBSRVFVRVNUX0JJR0NPTU1FUkNFX0FQSV9VUkwsIFJFUVVFU1RfQklHQ09NTUVSQ0VfTE9HSU5fVVJMIH0gZnJvbSBcIi4uL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgaGFuZGxlQ29udmVyc2lvblN0cmluZ1RvT2JqZWN0IH0gZnJvbSBcIi4vY29udmVydFZhbHVlc1wiO1xuaW1wb3J0IFJlcXVlc3QgZnJvbSBcIi4vcmVxdWVzdFwiO1xuXG5jbGFzcyBCaWdDb21tZXJjZSB7XG5cdGNvbnN0cnVjdG9yKGNvbmZpZykge1xuXHRcdGlmICghY29uZmlnKSB7XG5cdFx0XHRjb25zdCBlcnJNZXNzYWdlID0gbmV3IEVycm9yKFwiQ29uZmlnIG1pc3NpbmcuIFRoZSBjb25maWcgb2JqZWN0IGlzIHJlcXVpcmVkIHRvIG1ha2UgYW55IGNhbGwgdG8gdGhlIEJpZ0NvbW1lcmNlIEFQSVwiKTtcblxuXHRcdFx0dGhyb3cgZXJyTWVzc2FnZTtcblx0XHR9XG5cblx0XHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcblx0XHR0aGlzLmdyYW50VHlwZSA9IFwiYXV0aG9yaXphdGlvbl9jb2RlXCI7XG5cdH1cblxuXHQvLyBIYW5kbGUgY3JlYXRpbmcgQVBJIHJlcXVlc3Rcblx0Y3JlYXRlQVBJUmVxdWVzdChlbmRwb2ludCkge1xuXHRcdGNvbnN0IGFjY2VwdCA9IHRoaXMuY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gXCJ4bWxcIiA/IFwiYXBwbGljYXRpb24veG1sXCIgOiBcImFwcGxpY2F0aW9uL2pzb25cIjtcblxuXHRcdHJldHVybiBuZXcgUmVxdWVzdChlbmRwb2ludCwge1xuXHRcdFx0aGVhZGVyczogT2JqZWN0LmFzc2lnbihcblx0XHRcdFx0e1xuXHRcdFx0XHRcdFwiQWNjZXB0XCI6IGFjY2VwdCxcblx0XHRcdFx0XHRcIlgtQXV0aC1DbGllbnRcIjogdGhpcy5jb25maWcuY2xpZW50SWQsXG5cdFx0XHRcdFx0XCJYLUF1dGgtVG9rZW5cIjogdGhpcy5jb25maWcuYWNjZXNzVG9rZW5cblx0XHRcdFx0fSxcblx0XHRcdFx0dGhpcy5jb25maWcuaGVhZGVyc1xuXHRcdFx0KSxcblx0XHRcdGxvZ2dlcjogdGhpcy5jb25maWcubG9nZ2VyLFxuXHRcdFx0YWdlbnQ6IHRoaXMuY29uZmlnLmFnZW50XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBIYW5kbGUgdmVyZml5IHNpZ25lZCByZXF1ZXN0XG5cdGFzeW5jIHZlcmlmeShzaWduZWRSZXF1ZXN0KSB7XG5cdFx0Ly8gSWYgYHNpZ25lZFJlcXVlc3RgIGlzIFwidW5kZWZpbmVkXCIsIHRocm93IGFuIGVycm9yXG5cdFx0IXNpZ25lZFJlcXVlc3QgPyB0aGlzLmNvbmZpZy5sb2dnZXIuZXJyb3IoXCJUaGUgc2lnbmVkIHJlcXVlc3QgaXMgcmVxdWlyZWQgdG8gdmVyaWZ5IHRoZSBjYWxsLlwiKSA6IG51bGw7XG5cblx0XHRjb25zdCBzcGxpdFJlcXVlc3QgPSBzaWduZWRSZXF1ZXN0LnNwbGl0KFwiLlwiKTtcblxuXHRcdC8vIElmIGBzcGxpdFJlcXVlc3RgIGxlbmd0aCBpcyBsZXNzIHRoYW4gMiwgdGhyb3cgYW4gZXJyb3Jcblx0XHRzcGxpdFJlcXVlc3QubGVuZ3RoIDwgMiA/IHRoaXMuY29uZmlnLmxvZ2dlci5lcnJvcihcIlRoZSBzaWduZWQgcmVxdWVzdCB3aWxsIGNvbWUgaW4gdHdvIHBhcnRzIHNlcGVyYXRlZCBieSBhIC4oZnVsbCBzdG9wKS4gXCIgKyBcInRoaXMgc2lnbmVkIHJlcXVlc3QgY29udGFpbnMgbGVzcyB0aGFuIDIgcGFydHMuXCIpIDogbnVsbDtcblxuXHRcdC8vIENoZWNrIGFuZCB2ZXJpZnkgdmFsaWRpdHkgb2Ygc2lnbmF0dXJlc1xuXHRcdGNvbnN0IHNpZ25hdHVyZSA9IEJ1ZmZlci5mcm9tKHNwbGl0UmVxdWVzdFsxXSwgXCJiYXNlNjRcIikudG9TdHJpbmcoXCJ1dGY4XCIpO1xuXHRcdGNvbnN0IGpzb24gPSBCdWZmZXIuZnJvbShzcGxpdFJlcXVlc3RbMF0sIFwiYmFzZTY0XCIpLnRvU3RyaW5nKFwidXRmOFwiKTtcblx0XHRjb25zdCBkYXRhID0gaGFuZGxlQ29udmVyc2lvblN0cmluZ1RvT2JqZWN0KGpzb24pO1xuXHRcdGNvbnN0IGV4cGVjdGVkID0gY3J5cHRvLmNyZWF0ZUhtYWMoXCJzaGEyNTZcIiwgdGhpcy5jb25maWcuc2VjcmV0KS51cGRhdGUoanNvbikuZGlnZXN0KFwiaGV4XCIpO1xuXG5cdFx0dGhpcy5jb25maWcubG9nZ2VyLmluZm8oXCJKU09OOiBcIiArIGpzb24pO1xuXHRcdHRoaXMuY29uZmlnLmxvZ2dlci5pbmZvKFwiU0lHTkFUVVJFOiBcIiArIHNpZ25hdHVyZSk7XG5cdFx0dGhpcy5jb25maWcubG9nZ2VyLmluZm8oXCJFWFBFQ1RFRCBTSUdOQVRVUkU6IFwiICsgZXhwZWN0ZWQpO1xuXG5cdFx0Ly8gSWYgdGhlIGV4cGVjdGVkIGxlbmd0aCBvZiBzaWduYXR1cmUgZG9lc24ndCBtYXRjaCB0aGUgY3VycmVudCBzaWduYXR1cmUgbGVuZ3RoLCB0aHJvdyBhbiBlcnJvciwgb3RoZXJ3aXNlIHJldHVybiBkYXRhXG5cdFx0ZXhwZWN0ZWQubGVuZ3RoICE9PSBzaWduYXR1cmUubGVuZ3RoIHx8IGNyeXB0by50aW1pbmdTYWZlRXF1YWwoQnVmZmVyLmZyb20oZXhwZWN0ZWQsIFwidXRmOFwiKSwgQnVmZmVyLmZyb20oc2lnbmF0dXJlLCBcInV0ZjhcIikpID8gdGhpcy5jb25maWcubG9nZ2VyLmVycm9yKFwiVGhlIHNpZ25hdHVyZSBpcyBpbnZhbGlkLlwiKSA6IG51bGw7XG5cblx0XHQvLyBTZW5kIGxvZyBtZXNzYWdlIHdoZW4gc2lnbmF0dXJlIGlzIHZhbGlkXG5cdFx0dGhpcy5jb25maWcubG9nZ2VyLmluZm8oXCJUaGUgc2lnbmF0dXJlIGlzIHZhbGlkLlwiKTtcblxuXHRcdHJldHVybiBkYXRhO1xuXHR9XG5cblx0Ly8gSGFuZGxlIGF1dGhlbnRpY2F0aW9uIHJlcXVlc3Rcblx0YXN5bmMgYXV0aG9yaXplKHF1ZXJ5KSB7XG5cdFx0Ly8gaWYgYHF1ZXJ5YCBpcyB1bmRlZmluZWQsIHRocm93IGFuIGVycm9yXG5cdFx0IXF1ZXJ5ID8gdGhpcy5jb25maWcubG9nZ2VyLmVycm9yKFwiVGhlIFVSTCBxdWVyeSBwYXJhbWF0ZXJzIGFyZSByZXF1aXJlZC5cIikgOiBudWxsO1xuXG5cdFx0Ly8gUXVlcnkgcHJvcHNcblx0XHRjb25zdCB7IGNvZGUsIHNjb3BlLCBjb250ZXh0IH0gPSBhd2FpdCBxdWVyeTtcblx0XHRjb25zdCBxdWVyeUNvZGUgPSBjb2RlID8/IG51bGw7XG5cdFx0Y29uc3QgcXVlcnlTY29wZSA9IHNjb3BlID8/IG51bGw7XG5cdFx0Y29uc3QgcXVlcnlDb250ZXh0ID0gY29udGV4dCA/PyBudWxsO1xuXG5cdFx0Ly8gSW5pdCBwYXlsb2FkXG5cdFx0Y29uc3QgcGF5bG9hZCA9IHtcblx0XHRcdGNsaWVudF9pZDogdGhpcy5jb25maWcuY2xpZW50SWQsXG5cdFx0XHRjbGllbnRfc2VjcmV0OiB0aGlzLmNvbmZpZy5zZWNyZXQsXG5cdFx0XHRncmFudF90eXBlOiB0aGlzLmdyYW50VHlwZSxcblx0XHRcdGNvZGU6IHF1ZXJ5Q29kZSxcblx0XHRcdHNjb3BlOiBxdWVyeVNjb3BlLFxuXHRcdFx0Y29udGV4dDogcXVlcnlDb250ZXh0XG5cdFx0fTtcblxuXHRcdC8vIFJ1biByZXF1ZXN0XG5cdFx0Y29uc3QgcmVxdWVzdCA9IHRoaXMuY3JlYXRlQVBJUmVxdWVzdChSRVFVRVNUX0JJR0NPTU1FUkNFX0xPR0lOX1VSTCk7XG5cdFx0Y29uc3Qgb2F1dGhUb2tlbiA9IFwiL29hdXRoMi90b2tlblwiO1xuXG5cdFx0cmV0dXJuIGF3YWl0IHJlcXVlc3QucnVuKFwicG9zdFwiLCBvYXV0aFRva2VuLCBwYXlsb2FkKTtcblx0fVxuXG5cdC8vIEhhbmRsZSBBUEkgcmVxdWVzdHNcblx0YXN5bmMgcmVxdWVzdCh0eXBlLCBwYXRoLCBkYXRhID0gbnVsbCkge1xuXHRcdC8vIElmIGN1cnJlbnQgYGNvbmZpZ2AgaGF2ZSB1bmRlZmluZWQgYGFjY2Vzc1Rva2VuYCwgdGhyb3cgYW4gZXJyb3Jcblx0XHR0aGlzLmNvbmZpZy5hY2Nlc3NUb2tlbiA9PSBudWxsID8gdGhpcy5jb25maWcubG9nZ2VyLmVycm9yKFwiVGhlIGFjY2VzcyB0b2tlbiBpcyByZXF1aXJlZCB0byBtYWtlIEJpZ0NvbW1lcmNlIEFQSSByZXF1ZXN0cy5cIikgOiBudWxsO1xuXG5cdFx0Ly8gSWYgY3VycmVudCBgY29uZmlnYCBoYXZlIHVuZGVmaW5lZCBgc3RvcmVIYXNoYCwgdGhyb3cgYW4gZXJyb3Jcblx0XHR0aGlzLmNvbmZpZy5zdG9yZUhhc2ggPT0gbnVsbCA/IHRoaXMuY29uZmlnLmxvZ2dlci5lcnJvcihcIlRoZSBzdG9yZSBoYXNoIGlzIHJlcXVpcmVkIHRvIG1ha2UgQmlnQ29tbWVyY2UgQVBJIHJlcXVlc3RzLlwiKSA6IG51bGw7XG5cblx0XHQvLyBQcmVwYXJlIGBwYXRoYCBmb3IgcmVxdWVzdCBleGVjdXRpb25cblx0XHRjb25zdCBleHRlbnNpb24gPSB0aGlzLmNvbmZpZy5yZXNwb25zZVR5cGUgPT09IFwieG1sXCIgPyBcIi54bWxcIiA6IFwiXCI7XG5cdFx0Y29uc3QgcmVxdWVzdCA9IHRoaXMuY3JlYXRlQVBJUmVxdWVzdChSRVFVRVNUX0JJR0NPTU1FUkNFX0FQSV9VUkwpO1xuXHRcdGNvbnN0IHZlcnNpb24gPSAhcGF0aC5pbmNsdWRlcyhcInYzXCIpID8gcGF0aC5yZXBsYWNlKC8oXFw/fCQpLywgZXh0ZW5zaW9uICsgXCIkMVwiKSA6IHBhdGg7XG5cblx0XHQvLyBVcGRhdGUgZnVsbCBwYXRoXG5cdFx0bGV0IGZ1bGxQYXRoID0gYC9zdG9yZXMvJHt0aGlzLmNvbmZpZy5zdG9yZUhhc2h9YDtcblxuXHRcdGZ1bGxQYXRoICs9IHZlcnNpb247XG5cblx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QucnVuKHR5cGUsIGZ1bGxQYXRoLCBkYXRhKTtcblxuXHRcdC8vIElmIHJlc3BvbnNlIGNvbnRhaW5zIHBhZ2luYXRpb24uXG5cdFx0aWYgKFwibWV0YVwiIGluIHJlc3BvbnNlICYmIFwicGFnaW5hdGlvblwiIGluIHJlc3BvbnNlLm1ldGEpIHtcblx0XHRcdGNvbnN0IHsgdG90YWxfcGFnZXM6IHRvdGFsUGFnZXMsIGN1cnJlbnRfcGFnZTogY3VycmVudFBhZ2UgfSA9IHJlc3BvbnNlLm1ldGEucGFnaW5hdGlvbjtcblxuXHRcdFx0Ly8gSWYgY3VycmVudCBwYWdlIGlzIG5vdCB0aGUgbGFzdCBwYWdlLlxuXHRcdFx0aWYgKHRvdGFsUGFnZXMgPiBjdXJyZW50UGFnZSkge1xuXHRcdFx0XHQvLyBDb2xsZWN0IGFsbCBwYWdlIHJlcXVlc3QgcHJvbWlzZXMgaW4gYXJyYXkuXG5cdFx0XHRcdGNvbnN0IHByb21pc2VzID0gW107XG5cblx0XHRcdFx0Zm9yIChsZXQgbmV4dFBhZ2UgPSBjdXJyZW50UGFnZSArIDE7IG5leHRQYWdlIDw9IHRvdGFsUGFnZXM7IG5leHRQYWdlKyspIHtcblx0XHRcdFx0XHRjb25zdCBlbmRwb2ludFVybCA9IG5ldyBVUkwoZnVsbFBhdGgsIGBodHRwczovLyR7cmVxdWVzdC5ob3N0bmFtZX1gKTtcblxuXHRcdFx0XHRcdC8vIFNhZmVseSBhc3NpZ24gYHBhZ2VgIHF1ZXJ5IHBhcmFtZXRlciB0byBlbmRwb2ludCBVUkwuXG5cdFx0XHRcdFx0ZW5kcG9pbnRVcmwuc2VhcmNoUGFyYW1zLnNldChcInBhZ2VcIiwgbmV4dFBhZ2UpO1xuXG5cdFx0XHRcdFx0Ly8gQWRkIHByb21pc2UgdG8gYXJyYXkgZm9yIGZ1dHVyZSBQcm9taXNlLkFsbCgpIGNhbGwuXG5cdFx0XHRcdFx0cHJvbWlzZXMucHVzaChyZXF1ZXN0LnJ1bih0eXBlLCBgJHtlbmRwb2ludFVybC5wYXRobmFtZX0ke2VuZHBvaW50VXJsLnNlYXJjaH1gLCBkYXRhKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBSZXF1ZXN0IGFsbCBlbmRwb2ludHMgaW4gcGFyYWxsZWwuXG5cdFx0XHRcdGNvbnN0IHJlc3BvbnNlcyA9IGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcblxuXHRcdFx0XHRyZXNwb25zZXMuZm9yRWFjaCgocGFnZVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdFx0cmVzcG9uc2UuZGF0YSA9IHJlc3BvbnNlLmRhdGEuY29uY2F0KHBhZ2VSZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gU2V0IHBhZ2VyIHRvIGxhc3QgcGFnZS5cblx0XHRcdFx0cmVzcG9uc2UubWV0YS5wYWdpbmF0aW9uLnRvdGFsX3BhZ2VzID0gdG90YWxQYWdlcztcblx0XHRcdFx0cmVzcG9uc2UubWV0YS5wYWdpbmF0aW9uLmN1cnJlbnRfcGFnZSA9IHRvdGFsUGFnZXM7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUnVuIHJlcXVlc3Rcblx0XHRyZXR1cm4gcmVzcG9uc2U7XG5cdH1cblxuXHQvLyBIYW5kbGUgYEdFVGAgcmVxdWVzdFxuXHRhc3luYyBnZXQocGF0aCkge1xuXHRcdHJldHVybiBhd2FpdCB0aGlzLnJlcXVlc3QoXCJnZXRcIiwgcGF0aCk7XG5cdH1cblxuXHQvLyBIYW5kbGUgYFBPU1RgIHJlcXVlc3Rcblx0YXN5bmMgcG9zdChwYXRoLCBkYXRhKSB7XG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMucmVxdWVzdChcInBvc3RcIiwgcGF0aCwgZGF0YSk7XG5cdH1cblxuXHQvLyBIYW5kbGUgYFBVVGAgcmVxdWVzdFxuXHRhc3luYyBwdXQocGF0aCwgZGF0YSkge1xuXHRcdHJldHVybiBhd2FpdCB0aGlzLnJlcXVlc3QoXCJwdXRcIiwgcGF0aCwgZGF0YSk7XG5cdH1cblxuXHQvLyBIYW5kbGUgYERFTEVURWAgcmVxdWVzdFxuXHRhc3luYyBkZWxldGUocGF0aCkge1xuXHRcdHJldHVybiBhd2FpdCB0aGlzLnJlcXVlc3QoXCJkZWxldGVcIiwgcGF0aCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmlnQ29tbWVyY2U7XG4iXX0=
