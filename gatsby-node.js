"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _httpProxyMiddleware = require("http-proxy-middleware");

var _micro = _interopRequireDefault(require("micro"));

var _winston = require("winston");

var _constants = require("./constants");

var _bigcommerce = _interopRequireDefault(require("./utils/bigcommerce"));

var _convertValues = require("./utils/convertValues");

var handleCreateNodeFromData = function handleCreateNodeFromData(item, nodeType, helpers) {
	var nodeMetadata = (0, _extends2.default)({}, item, {
		id: helpers.createNodeId(nodeType + "-" + item.id),
		bigcommerce_id: item.id,
		parent: null,
		children: [],
		internal: {
			type: nodeType,
			content: (0, _convertValues.handleConversionObjectToString)(item),
			contentDigest: helpers.createContentDigest(item)
		}
	});
	var node = Object.assign({}, item, nodeMetadata);
	helpers.createNode(node);
	return node;
};

exports.onPreInit = function () {
	var logLevels = {
		levels: {
			info: 1
		},
		colors: {
			info: "bold green"
		}
	};
	(0, _winston.addColors)(logLevels.colors);
	var combine = _winston.format.combine,
		timestamp = _winston.format.timestamp,
		colorize = _winston.format.colorize,
		simple = _winston.format.simple;
	var logger = (0, _winston.createLogger)({
		level: "info",
		levels: logLevels.levels,
		format: combine(colorize(), simple(), timestamp()),
		transports: [new _winston.transports.Console()]
	});
	logger.info("`gatsby-source-bigcommerce` plugin loaded successfully.");
};

exports.onCreateWebpackConfig = (function () {
	var _ref2 = (0, _asyncToGenerator2.default)(
		_regenerator.default.mark(function _callee(_ref) {
			var actions;
			return _regenerator.default.wrap(function _callee$(_context) {
				while (1) {
					switch ((_context.prev = _context.next)) {
						case 0:
							actions = _ref.actions;
							actions.setWebpackConfig({
								resolve: {
									fallback: {
										crypto: false,
										https: false,
										zlib: false
									}
								}
							});

						case 2:
						case "end":
							return _context.stop();
					}
				}
			}, _callee);
		})
	);

	return function (_x) {
		return _ref2.apply(this, arguments);
	};
})();

exports.sourceNodes = (function () {
	var _ref4 = (0, _asyncToGenerator2.default)(
		_regenerator.default.mark(function _callee4(_ref3, pluginOptions) {
			var actions,
				createNodeId,
				createContentDigest,
				createNode,
				_pluginOptions$endpoi,
				endpoints,
				_pluginOptions$client,
				clientId,
				_pluginOptions$secret,
				secret,
				_pluginOptions$storeH,
				storeHash,
				_pluginOptions$access,
				accessToken,
				_pluginOptions$siteUr,
				siteUrl,
				_pluginOptions$previe,
				preview,
				_pluginOptions$logLev,
				logLevel,
				_pluginOptions$agent,
				agent,
				_pluginOptions$respon,
				responseType,
				_pluginOptions$header,
				headers,
				helpers,
				sanitizedSiteUrl,
				sanitizedLogLevel,
				sanitizeResponseType,
				logLevels,
				combine,
				timestamp,
				colorize,
				simple,
				logger,
				errMessage,
				BC,
				body,
				exitMessage;

			return _regenerator.default.wrap(function _callee4$(_context4) {
				while (1) {
					switch ((_context4.prev = _context4.next)) {
						case 0:
							(actions = _ref3.actions), (createNodeId = _ref3.createNodeId), (createContentDigest = _ref3.createContentDigest);
							createNode = actions.createNode;
							(_pluginOptions$endpoi = pluginOptions.endpoints),
								(endpoints = _pluginOptions$endpoi === void 0 ? null : _pluginOptions$endpoi),
								(_pluginOptions$client = pluginOptions.clientId),
								(clientId = _pluginOptions$client === void 0 ? null : _pluginOptions$client),
								(_pluginOptions$secret = pluginOptions.secret),
								(secret = _pluginOptions$secret === void 0 ? null : _pluginOptions$secret),
								(_pluginOptions$storeH = pluginOptions.storeHash),
								(storeHash = _pluginOptions$storeH === void 0 ? null : _pluginOptions$storeH),
								(_pluginOptions$access = pluginOptions.accessToken),
								(accessToken = _pluginOptions$access === void 0 ? null : _pluginOptions$access),
								(_pluginOptions$siteUr = pluginOptions.siteUrl),
								(siteUrl = _pluginOptions$siteUr === void 0 ? null : _pluginOptions$siteUr),
								(_pluginOptions$previe = pluginOptions.preview),
								(preview = _pluginOptions$previe === void 0 ? false : _pluginOptions$previe),
								(_pluginOptions$logLev = pluginOptions.logLevel),
								(logLevel = _pluginOptions$logLev === void 0 ? "info" : _pluginOptions$logLev),
								(_pluginOptions$agent = pluginOptions.agent),
								(agent = _pluginOptions$agent === void 0 ? null : _pluginOptions$agent),
								(_pluginOptions$respon = pluginOptions.responseType),
								(responseType = _pluginOptions$respon === void 0 ? "json" : _pluginOptions$respon),
								(_pluginOptions$header = pluginOptions.headers),
								(headers = _pluginOptions$header === void 0 ? {} : _pluginOptions$header);
							helpers = Object.assign({}, actions, {
								createContentDigest: createContentDigest,
								createNodeId: createNodeId
							});
							sanitizedSiteUrl = (0, _convertValues.handleConversionStringToLowercase)(siteUrl);
							sanitizedLogLevel = (0, _convertValues.handleConversionStringToLowercase)(logLevel);
							sanitizeResponseType = (0, _convertValues.handleConversionStringToLowercase)(responseType);
							logLevels = {
								levels: {
									error: 0,
									debug: 1,
									info: 2
								},
								colors: {
									error: "bold red",
									debug: "bold blue",
									info: "bold green"
								}
							};
							(0, _winston.addColors)(logLevels.colors);
							(combine = _winston.format.combine), (timestamp = _winston.format.timestamp), (colorize = _winston.format.colorize), (simple = _winston.format.simple);
							logger = (0, _winston.createLogger)({
								level: sanitizedLogLevel,
								levels: logLevels.levels,
								format: combine(colorize(), simple(), timestamp()),
								transports: [new _winston.transports.Console()]
							});
							errMessage = "";
							logger.info("Checking BigCommerce plugin options...");

							if (!(endpoints !== null && clientId !== null && secret !== null && storeHash !== null && accessToken !== null)) {
								_context4.next = 30;
								break;
							}

							BC = new _bigcommerce.default({
								clientId: clientId,
								accessToken: accessToken,
								secret: secret,
								storeHash: storeHash,
								responseType: sanitizeResponseType,
								logger: logger,
								agent: agent,
								headers: headers
							});

							if (!(endpoints && typeof endpoints === "object" && Object.keys(endpoints).length > 0)) {
								_context4.next = 22;
								break;
							}

							logger.info("Valid plugin options found. Proceeding with plugin initialization...");
							logger.info("Requesting endpoint data...");
							_context4.next = 20;
							return Promise.all(
								Object.entries(endpoints).map(function (_ref5) {
									var nodeName = _ref5[0],
										endpoint = _ref5[1];
									return BC.get(endpoint).then(function (res) {
										var resData = "data" in res && Array.isArray(res.data) ? res.data : res;
										return "data" in res && Array.isArray(res.data)
											? resData.map(function (datum) {
													return handleCreateNodeFromData(datum, nodeName, helpers);
											  })
											: Array.isArray(res)
											? res.map(function (datum) {
													return handleCreateNodeFromData(datum, nodeName, helpers);
											  })
											: handleCreateNodeFromData(resData, nodeName, helpers);
									});
								})
							)
								.then(function () {
									logger.info("All endpoint data have been fetched successfully.");
								})
								.catch(function (err) {
									errMessage = new Error("An error occurred while fetching endpoint data. " + err);
								})
								.finally(function () {
									return logger.info("Requesting endpoint data complete.");
								});

						case 20:
							_context4.next = 23;
							break;

						case 22:
							errMessage = new Error("The `endpoints` object is required to make any call to the BigCommerce API");

						case 23:
							if (!(_constants.IS_DEV && preview && sanitizedSiteUrl !== null)) {
								_context4.next = 28;
								break;
							}

							logger.info("Preview mode enabled. Subscribing you to BigCommerce API webhook...");
							body = {
								scope: "store/product/updated",
								is_active: true,
								destination: sanitizedSiteUrl + "/__BCPreview"
							};
							_context4.next = 28;
							return BC.get(_constants.BIGCOMMERCE_WEBHOOK_API_ENDPOINT)
								.then(function (res) {
									if ("data" in res && Object.keys(res.data).length > 0) {
										logger.info("BigCommerce API webhook subscription already exists. Skipping subscription...");
										logger.info("BigCommerce API webhook subscription complete. Running preview server...");
									} else {
										(0, _asyncToGenerator2.default)(
											_regenerator.default.mark(function _callee2() {
												return _regenerator.default.wrap(function _callee2$(_context2) {
													while (1) {
														switch ((_context2.prev = _context2.next)) {
															case 0:
																_context2.next = 2;
																return BC.post(_constants.BIGCOMMERCE_WEBHOOK_API_ENDPOINT, body).then(function (res) {
																	if ("data" in res && Object.keys(res.data).length > 0) {
																		logger.info("BigCommerce API webhook subscription created successfully. Running preview server...");
																	}
																});

															case 2:
																return _context2.abrupt("return", _context2.sent);

															case 3:
															case "end":
																return _context2.stop();
														}
													}
												}, _callee2);
											})
										)();
									}

									var server = (0, _micro.default)(
										(function () {
											var _ref7 = (0, _asyncToGenerator2.default)(
												_regenerator.default.mark(function _callee3(req, res) {
													var request, productId, newProduct, nodeToUpdate, _nodeToUpdate$id;

													return _regenerator.default.wrap(function _callee3$(_context3) {
														while (1) {
															switch ((_context3.prev = _context3.next)) {
																case 0:
																	_context3.next = 2;
																	return _micro.default.json(req);

																case 2:
																	request = _context3.sent;
																	productId = request.data.id;
																	_context3.next = 6;
																	return BC.get("/catalog/products/" + productId);

																case 6:
																	newProduct = _context3.sent;
																	nodeToUpdate = newProduct.data;

																	if (nodeToUpdate.id) {
																		createNode(
																			(0, _extends2.default)({}, nodeToUpdate, {
																				id: createNodeId(
																					"" + ((_nodeToUpdate$id = nodeToUpdate === null || nodeToUpdate === void 0 ? void 0 : nodeToUpdate.id) !== null && _nodeToUpdate$id !== void 0 ? _nodeToUpdate$id : "BigCommerceNode")
																				),
																				parent: null,
																				children: [],
																				internal: {
																					type: "BigCommerceNode",
																					contentDigest: createContentDigest(nodeToUpdate)
																				}
																			})
																		);
																		logger.info("Updated node: " + nodeToUpdate.id);
																	}

																	res.end("ok");

																case 10:
																case "end":
																	return _context3.stop();
															}
														}
													}, _callee3);
												})
											);

											return function (_x4, _x5) {
												return _ref7.apply(this, arguments);
											};
										})()
									);
									server.listen(8033, logger.info("Now listening to changes for live preview at /__BCPreview"));
								})
								.catch(function (err) {
									errMessage = new Error("An error occurred while creating BigCommerce API webhook subscription. " + err);
								});

						case 28:
							_context4.next = 35;
							break;

						case 30:
							if (endpoints == null) {
								errMessage = new Error("The `endpoints` are required to make any call to the BigCommerce API");
							}

							if (clientId == null) {
								errMessage = new Error("The `clientId` is required to make any call to the BigCommerce API");
							}

							if (secret == null) {
								errMessage = new Error("The `secret` is required to make any call to the BigCommerce API");
							}

							if (storeHash == null) {
								errMessage = new Error("The `storeHash` is required to make any call to the BigCommerce API");
							}

							if (accessToken == null) {
								errMessage = new Error("The `accessToken` is required to make any call to the BigCommerce API");
							}

						case 35:
							if (!(errMessage !== "")) {
								_context4.next = 39;
								break;
							}

							exitMessage = "Plugin terminated with errors...";
							logger.error("" + exitMessage);
							throw errMessage;

						case 39:
						case "end":
							return _context4.stop();
					}
				}
			}, _callee4);
		})
	);

	return function (_x2, _x3) {
		return _ref4.apply(this, arguments);
	};
})();

exports.onCreateDevServer = function (_ref8) {
	var app = _ref8.app;
	return app.use(
		"/__BCPreview/",
		(0, _httpProxyMiddleware.createProxyMiddleware)({
			target: "http://localhost:8033",
			secure: false
		})
	);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9nYXRzYnktbm9kZS5qcyJdLCJuYW1lcyI6WyJoYW5kbGVDcmVhdGVOb2RlRnJvbURhdGEiLCJpdGVtIiwibm9kZVR5cGUiLCJoZWxwZXJzIiwibm9kZU1ldGFkYXRhIiwiaWQiLCJjcmVhdGVOb2RlSWQiLCJiaWdjb21tZXJjZV9pZCIsInBhcmVudCIsImNoaWxkcmVuIiwiaW50ZXJuYWwiLCJ0eXBlIiwiY29udGVudCIsImNvbnRlbnREaWdlc3QiLCJjcmVhdGVDb250ZW50RGlnZXN0Iiwibm9kZSIsIk9iamVjdCIsImFzc2lnbiIsImNyZWF0ZU5vZGUiLCJleHBvcnRzIiwib25QcmVJbml0IiwibG9nTGV2ZWxzIiwibGV2ZWxzIiwiaW5mbyIsImNvbG9ycyIsImNvbWJpbmUiLCJmb3JtYXQiLCJ0aW1lc3RhbXAiLCJjb2xvcml6ZSIsInNpbXBsZSIsImxvZ2dlciIsImxldmVsIiwidHJhbnNwb3J0cyIsIkNvbnNvbGUiLCJvbkNyZWF0ZVdlYnBhY2tDb25maWciLCJhY3Rpb25zIiwic2V0V2VicGFja0NvbmZpZyIsInJlc29sdmUiLCJmYWxsYmFjayIsImNyeXB0byIsImh0dHBzIiwiemxpYiIsInNvdXJjZU5vZGVzIiwicGx1Z2luT3B0aW9ucyIsImVuZHBvaW50cyIsImNsaWVudElkIiwic2VjcmV0Iiwic3RvcmVIYXNoIiwiYWNjZXNzVG9rZW4iLCJzaXRlVXJsIiwicHJldmlldyIsImxvZ0xldmVsIiwiYWdlbnQiLCJyZXNwb25zZVR5cGUiLCJoZWFkZXJzIiwic2FuaXRpemVkU2l0ZVVybCIsInNhbml0aXplZExvZ0xldmVsIiwic2FuaXRpemVSZXNwb25zZVR5cGUiLCJlcnJvciIsImRlYnVnIiwiZXJyTWVzc2FnZSIsIkJDIiwiQmlnQ29tbWVyY2UiLCJrZXlzIiwibGVuZ3RoIiwiUHJvbWlzZSIsImFsbCIsImVudHJpZXMiLCJtYXAiLCJub2RlTmFtZSIsImVuZHBvaW50IiwiZ2V0IiwidGhlbiIsInJlcyIsInJlc0RhdGEiLCJBcnJheSIsImlzQXJyYXkiLCJkYXRhIiwiZGF0dW0iLCJjYXRjaCIsImVyciIsIkVycm9yIiwiZmluYWxseSIsIklTX0RFViIsImJvZHkiLCJzY29wZSIsImlzX2FjdGl2ZSIsImRlc3RpbmF0aW9uIiwiQklHQ09NTUVSQ0VfV0VCSE9PS19BUElfRU5EUE9JTlQiLCJwb3N0Iiwic2VydmVyIiwicmVxIiwibWljcm8iLCJqc29uIiwicmVxdWVzdCIsInByb2R1Y3RJZCIsIm5ld1Byb2R1Y3QiLCJub2RlVG9VcGRhdGUiLCJlbmQiLCJsaXN0ZW4iLCJleGl0TWVzc2FnZSIsIm9uQ3JlYXRlRGV2U2VydmVyIiwiYXBwIiwidXNlIiwidGFyZ2V0Iiwic2VjdXJlIl0sIm1hcHBpbmdzIjoiQUFDQTs7Ozs7Ozs7OztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU9BLElBQU1BLHdCQUF3QixHQUFHLFNBQTNCQSx3QkFBMkIsQ0FBQ0MsSUFBRCxFQUFPQyxRQUFQLEVBQWlCQyxPQUFqQixFQUE2QjtBQUM3RCxNQUFNQyxZQUFZLDhCQUNkSCxJQURjO0FBRWpCSSxJQUFBQSxFQUFFLEVBQUVGLE9BQU8sQ0FBQ0csWUFBUixDQUF3QkosUUFBeEIsU0FBb0NELElBQUksQ0FBQ0ksRUFBekMsQ0FGYTtBQUdqQkUsSUFBQUEsY0FBYyxFQUFFTixJQUFJLENBQUNJLEVBSEo7QUFJakJHLElBQUFBLE1BQU0sRUFBRSxJQUpTO0FBS2pCQyxJQUFBQSxRQUFRLEVBQUUsRUFMTztBQU1qQkMsSUFBQUEsUUFBUSxFQUFFO0FBQ1RDLE1BQUFBLElBQUksRUFBRVQsUUFERztBQUVUVSxNQUFBQSxPQUFPLEVBQUUsbURBQStCWCxJQUEvQixDQUZBO0FBR1RZLE1BQUFBLGFBQWEsRUFBRVYsT0FBTyxDQUFDVyxtQkFBUixDQUE0QmIsSUFBNUI7QUFITjtBQU5PLElBQWxCO0FBYUEsTUFBTWMsSUFBSSxHQUFHQyxNQUFNLENBQUNDLE1BQVAsQ0FBYyxFQUFkLEVBQWtCaEIsSUFBbEIsRUFBd0JHLFlBQXhCLENBQWI7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QUE7QUFBQTtBQUFBLEdBQXRCOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWlNQXpDLE9BQU8sQ0FBQ2tGLGlCQUFSLEdBQTRCO0FBQUEsTUFBR0MsR0FBSCxTQUFHQSxHQUFIO0FBQUEsU0FDM0JBLEdBQUcsQ0FBQ0MsR0FBSixDQUNDLGVBREQsRUFFQyxnREFBc0I7QUFDckJDLElBQUFBLE1BQU0seUJBRGU7QUFFckJDLElBQUFBLE1BQU0sRUFBRTtBQUZhLEdBQXRCLENBRkQsQ0FEMkI7QUFBQSxDQUE1QiIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHsgY3JlYXRlUHJveHlNaWRkbGV3YXJlIH0gZnJvbSBcImh0dHAtcHJveHktbWlkZGxld2FyZVwiO1xuaW1wb3J0IG1pY3JvIGZyb20gXCJtaWNyb1wiO1xuaW1wb3J0IHsgYWRkQ29sb3JzLCBjcmVhdGVMb2dnZXIsIGZvcm1hdCwgdHJhbnNwb3J0cyB9IGZyb20gXCJ3aW5zdG9uXCI7XG5pbXBvcnQgeyBCSUdDT01NRVJDRV9XRUJIT09LX0FQSV9FTkRQT0lOVCwgSVNfREVWIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgQmlnQ29tbWVyY2UgZnJvbSBcIi4vdXRpbHMvYmlnY29tbWVyY2VcIjtcbmltcG9ydCB7IGhhbmRsZUNvbnZlcnNpb25PYmplY3RUb1N0cmluZywgaGFuZGxlQ29udmVyc2lvblN0cmluZ1RvTG93ZXJjYXNlIH0gZnJvbSBcIi4vdXRpbHMvY29udmVydFZhbHVlc1wiO1xuXG4vKipcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEhlbHBlciBmdW5jdGlvbnMgYW5kIGNvbnN0YW50c1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5jb25zdCBoYW5kbGVDcmVhdGVOb2RlRnJvbURhdGEgPSAoaXRlbSwgbm9kZVR5cGUsIGhlbHBlcnMpID0+IHtcblx0Y29uc3Qgbm9kZU1ldGFkYXRhID0ge1xuXHRcdC4uLml0ZW0sXG5cdFx0aWQ6IGhlbHBlcnMuY3JlYXRlTm9kZUlkKGAke25vZGVUeXBlfS0ke2l0ZW0uaWR9YCksXG5cdFx0YmlnY29tbWVyY2VfaWQ6IGl0ZW0uaWQsXG5cdFx0cGFyZW50OiBudWxsLFxuXHRcdGNoaWxkcmVuOiBbXSxcblx0XHRpbnRlcm5hbDoge1xuXHRcdFx0dHlwZTogbm9kZVR5cGUsXG5cdFx0XHRjb250ZW50OiBoYW5kbGVDb252ZXJzaW9uT2JqZWN0VG9TdHJpbmcoaXRlbSksXG5cdFx0XHRjb250ZW50RGlnZXN0OiBoZWxwZXJzLmNyZWF0ZUNvbnRlbnREaWdlc3QoaXRlbSlcblx0XHR9XG5cdH07XG5cblx0Y29uc3Qgbm9kZSA9IE9iamVjdC5hc3NpZ24oe30sIGl0ZW0sIG5vZGVNZXRhZGF0YSk7XG5cblx0aGVscGVycy5jcmVhdGVOb2RlKG5vZGUpO1xuXG5cdHJldHVybiBub2RlO1xufTtcblxuLyoqXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBWZXJpZnkgcGx1Z2luIGxvYWRzIGFuZCBjaGVjayBmb3IgcmVxdWlyZWQgcGx1Z2luIG9wdGlvbnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuZXhwb3J0cy5vblByZUluaXQgPSAoKSA9PiB7XG5cdC8vIEFkZCBjdXN0b20gbG9nIGxldmVsc1xuXHRjb25zdCBsb2dMZXZlbHMgPSB7XG5cdFx0bGV2ZWxzOiB7XG5cdFx0XHRpbmZvOiAxXG5cdFx0fSxcblx0XHRjb2xvcnM6IHtcblx0XHRcdGluZm86IFwiYm9sZCBncmVlblwiXG5cdFx0fVxuXHR9O1xuXG5cdC8vIEFkZCBjb25zb2xlIGNvbG9yc1xuXHRhZGRDb2xvcnMobG9nTGV2ZWxzLmNvbG9ycyk7XG5cblx0Y29uc3QgeyBjb21iaW5lLCB0aW1lc3RhbXAsIGNvbG9yaXplLCBzaW1wbGUgfSA9IGZvcm1hdDtcblxuXHQvLyBJbml0IGB3aW5zdG9uYCBsb2dnZXJcblx0Y29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKHtcblx0XHRsZXZlbDogXCJpbmZvXCIsXG5cdFx0bGV2ZWxzOiBsb2dMZXZlbHMubGV2ZWxzLFxuXHRcdGZvcm1hdDogY29tYmluZShjb2xvcml6ZSgpLCBzaW1wbGUoKSwgdGltZXN0YW1wKCkpLFxuXHRcdHRyYW5zcG9ydHM6IFtuZXcgdHJhbnNwb3J0cy5Db25zb2xlKCldXG5cdH0pO1xuXG5cdGxvZ2dlci5pbmZvKFwiYGdhdHNieS1zb3VyY2UtYmlnY29tbWVyY2VgIHBsdWdpbiBsb2FkZWQgc3VjY2Vzc2Z1bGx5LlwiKTtcbn07XG5cbi8qKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogT3ZlcnJpZGUgR2F0c2J5IGRlZmF1bHQgV2VicGFjayBjb25maWd1cmF0aW9uXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cbmV4cG9ydHMub25DcmVhdGVXZWJwYWNrQ29uZmlnID0gYXN5bmMgKHsgYWN0aW9ucyB9KSA9PiB7XG5cdGFjdGlvbnMuc2V0V2VicGFja0NvbmZpZyh7XG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0ZmFsbGJhY2s6IHsgY3J5cHRvOiBmYWxzZSwgaHR0cHM6IGZhbHNlLCB6bGliOiBmYWxzZSB9XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogU291cmNlIGFuZCBjYWNoZSBub2RlcyBmcm9tIHRoZSBCaWdDb21tZXJjZSBBUElcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuZXhwb3J0cy5zb3VyY2VOb2RlcyA9IGFzeW5jICh7IGFjdGlvbnMsIGNyZWF0ZU5vZGVJZCwgY3JlYXRlQ29udGVudERpZ2VzdCB9LCBwbHVnaW5PcHRpb25zKSA9PiB7XG5cdGNvbnN0IHsgY3JlYXRlTm9kZSB9ID0gYWN0aW9ucztcblx0Y29uc3QgeyBlbmRwb2ludHMgPSBudWxsLCBjbGllbnRJZCA9IG51bGwsIHNlY3JldCA9IG51bGwsIHN0b3JlSGFzaCA9IG51bGwsIGFjY2Vzc1Rva2VuID0gbnVsbCwgc2l0ZVVybCA9IG51bGwsIHByZXZpZXcgPSBmYWxzZSwgbG9nTGV2ZWwgPSBcImluZm9cIiwgYWdlbnQgPSBudWxsLCByZXNwb25zZVR5cGUgPSBcImpzb25cIiwgaGVhZGVycyA9IHt9IH0gPSBwbHVnaW5PcHRpb25zO1xuXG5cdGNvbnN0IGhlbHBlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBhY3Rpb25zLCB7XG5cdFx0Y3JlYXRlQ29udGVudERpZ2VzdCxcblx0XHRjcmVhdGVOb2RlSWRcblx0fSk7XG5cblx0Y29uc3Qgc2FuaXRpemVkU2l0ZVVybCA9IGhhbmRsZUNvbnZlcnNpb25TdHJpbmdUb0xvd2VyY2FzZShzaXRlVXJsKTtcblx0Y29uc3Qgc2FuaXRpemVkTG9nTGV2ZWwgPSBoYW5kbGVDb252ZXJzaW9uU3RyaW5nVG9Mb3dlcmNhc2UobG9nTGV2ZWwpO1xuXHRjb25zdCBzYW5pdGl6ZVJlc3BvbnNlVHlwZSA9IGhhbmRsZUNvbnZlcnNpb25TdHJpbmdUb0xvd2VyY2FzZShyZXNwb25zZVR5cGUpO1xuXG5cdC8vIEFkZCBjdXN0b20gbG9nIGxldmVsc1xuXHRjb25zdCBsb2dMZXZlbHMgPSB7XG5cdFx0bGV2ZWxzOiB7XG5cdFx0XHRlcnJvcjogMCxcblx0XHRcdGRlYnVnOiAxLFxuXHRcdFx0aW5mbzogMlxuXHRcdH0sXG5cdFx0Y29sb3JzOiB7XG5cdFx0XHRlcnJvcjogXCJib2xkIHJlZFwiLFxuXHRcdFx0ZGVidWc6IFwiYm9sZCBibHVlXCIsXG5cdFx0XHRpbmZvOiBcImJvbGQgZ3JlZW5cIlxuXHRcdH1cblx0fTtcblxuXHQvLyBBZGQgY29uc29sZSBjb2xvcnNcblx0YWRkQ29sb3JzKGxvZ0xldmVscy5jb2xvcnMpO1xuXG5cdGNvbnN0IHsgY29tYmluZSwgdGltZXN0YW1wLCBjb2xvcml6ZSwgc2ltcGxlIH0gPSBmb3JtYXQ7XG5cblx0Ly8gSW5pdCBgd2luc3RvbmAgbG9nZ2VyXG5cdGNvbnN0IGxvZ2dlciA9IGNyZWF0ZUxvZ2dlcih7XG5cdFx0bGV2ZWw6IHNhbml0aXplZExvZ0xldmVsLFxuXHRcdGxldmVsczogbG9nTGV2ZWxzLmxldmVscyxcblx0XHRmb3JtYXQ6IGNvbWJpbmUoY29sb3JpemUoKSwgc2ltcGxlKCksIHRpbWVzdGFtcCgpKSxcblx0XHR0cmFuc3BvcnRzOiBbbmV3IHRyYW5zcG9ydHMuQ29uc29sZSgpXVxuXHR9KTtcblxuXHQvLyBDdXN0b20gdmFyaWFibGVzXG5cdGxldCBlcnJNZXNzYWdlID0gXCJcIjtcblxuXHRsb2dnZXIuaW5mbyhcIkNoZWNraW5nIEJpZ0NvbW1lcmNlIHBsdWdpbiBvcHRpb25zLi4uXCIpO1xuXG5cdGlmIChlbmRwb2ludHMgIT09IG51bGwgJiYgY2xpZW50SWQgIT09IG51bGwgJiYgc2VjcmV0ICE9PSBudWxsICYmIHN0b3JlSGFzaCAhPT0gbnVsbCAmJiBhY2Nlc3NUb2tlbiAhPT0gbnVsbCkge1xuXHRcdC8vIEluaXQgbmV3IGBCaWdDb21tZXJjZWAgaW5zdGFuY2Vcblx0XHRjb25zdCBCQyA9IG5ldyBCaWdDb21tZXJjZSh7XG5cdFx0XHRjbGllbnRJZDogY2xpZW50SWQsXG5cdFx0XHRhY2Nlc3NUb2tlbjogYWNjZXNzVG9rZW4sXG5cdFx0XHRzZWNyZXQ6IHNlY3JldCxcblx0XHRcdHN0b3JlSGFzaDogc3RvcmVIYXNoLFxuXHRcdFx0cmVzcG9uc2VUeXBlOiBzYW5pdGl6ZVJlc3BvbnNlVHlwZSxcblx0XHRcdGxvZ2dlcjogbG9nZ2VyLFxuXHRcdFx0YWdlbnQ6IGFnZW50LFxuXHRcdFx0aGVhZGVyczogaGVhZGVyc1xuXHRcdH0pO1xuXG5cdFx0Ly8gSGFuZGxlIGZldGNoaW5nIGFuZCBjcmVhdGluZyBub2RlcyBmb3IgYSBzaW5nbGUgb3IgbXVsdGlwbGUgZW5kcG9pbnRzXG5cdFx0aWYgKGVuZHBvaW50cyAmJiB0eXBlb2YgZW5kcG9pbnRzID09PSBcIm9iamVjdFwiICYmIE9iamVjdC5rZXlzKGVuZHBvaW50cykubGVuZ3RoID4gMCkge1xuXHRcdFx0Ly8gU2VuZCBsb2cgbWVzc2FnZSB3aGVuIGZldGNoaW5nIGRhdGFcblx0XHRcdGxvZ2dlci5pbmZvKFwiVmFsaWQgcGx1Z2luIG9wdGlvbnMgZm91bmQuIFByb2NlZWRpbmcgd2l0aCBwbHVnaW4gaW5pdGlhbGl6YXRpb24uLi5cIik7XG5cdFx0XHRsb2dnZXIuaW5mbyhcIlJlcXVlc3RpbmcgZW5kcG9pbnQgZGF0YS4uLlwiKTtcblxuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoXG5cdFx0XHRcdE9iamVjdC5lbnRyaWVzKGVuZHBvaW50cykubWFwKChbbm9kZU5hbWUsIGVuZHBvaW50XSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBCQy5nZXQoZW5kcG9pbnQpLnRoZW4oKHJlcykgPT4ge1xuXHRcdFx0XHRcdFx0Ly8gSWYgdGhlIGRhdGEgb2JqZWN0IGlzIG5vdCBvbiB0aGUgcmVzcG9uc2UsIGl0IGNvdWxkIGJlIGB2MmAgd2hpY2ggcmV0dXJucyBhbiBhcnJheSBhcyB0aGUgcm9vdCwgc28gdXNlIHRoYXQgYXMgYSBmYWxsYmFja1xuXHRcdFx0XHRcdFx0Y29uc3QgcmVzRGF0YSA9IFwiZGF0YVwiIGluIHJlcyAmJiBBcnJheS5pc0FycmF5KHJlcy5kYXRhKSA/IHJlcy5kYXRhIDogcmVzO1xuXG5cdFx0XHRcdFx0XHQvLyBIYW5kbGUgZ2VuZXJhdGluZyBub2Rlc1xuXHRcdFx0XHRcdFx0cmV0dXJuIFwiZGF0YVwiIGluIHJlcyAmJiBBcnJheS5pc0FycmF5KHJlcy5kYXRhKVxuXHRcdFx0XHRcdFx0XHQ/IHJlc0RhdGEubWFwKChkYXR1bSkgPT4gaGFuZGxlQ3JlYXRlTm9kZUZyb21EYXRhKGRhdHVtLCBub2RlTmFtZSwgaGVscGVycykpXG5cdFx0XHRcdFx0XHRcdDogQXJyYXkuaXNBcnJheShyZXMpXG5cdFx0XHRcdFx0XHRcdD8gcmVzLm1hcCgoZGF0dW0pID0+IGhhbmRsZUNyZWF0ZU5vZGVGcm9tRGF0YShkYXR1bSwgbm9kZU5hbWUsIGhlbHBlcnMpKVxuXHRcdFx0XHRcdFx0XHQ6IGhhbmRsZUNyZWF0ZU5vZGVGcm9tRGF0YShyZXNEYXRhLCBub2RlTmFtZSwgaGVscGVycyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pXG5cdFx0XHQpXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHQvLyBTZW5kIGxvZyBtZXNzYWdlIHdoZW4gYWxsIGVuZHBvaW50cyBoYXZlIGJlZW4gZmV0Y2hlZFxuXHRcdFx0XHRcdGxvZ2dlci5pbmZvKFwiQWxsIGVuZHBvaW50IGRhdGEgaGF2ZSBiZWVuIGZldGNoZWQgc3VjY2Vzc2Z1bGx5LlwiKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRcdFx0XHQvLyBTZW5kIGxvZyBtZXNzYWdlIHdoZW4gYW4gZXJyb3Igb2NjdXJzXG5cdFx0XHRcdFx0ZXJyTWVzc2FnZSA9IG5ldyBFcnJvcihgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgZmV0Y2hpbmcgZW5kcG9pbnQgZGF0YS4gJHtlcnJ9YCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5maW5hbGx5KCgpID0+XG5cdFx0XHRcdFx0Ly8gU2VuZCBsb2cgbWVzc2FnZSB3aGVuIGZldGNoaW5nIGRhdGEgaXMgY29tcGxldGVcblx0XHRcdFx0XHRsb2dnZXIuaW5mbyhcIlJlcXVlc3RpbmcgZW5kcG9pbnQgZGF0YSBjb21wbGV0ZS5cIilcblx0XHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZXJyTWVzc2FnZSA9IG5ldyBFcnJvcihcIlRoZSBgZW5kcG9pbnRzYCBvYmplY3QgaXMgcmVxdWlyZWQgdG8gbWFrZSBhbnkgY2FsbCB0byB0aGUgQmlnQ29tbWVyY2UgQVBJXCIpO1xuXHRcdH1cblxuXHRcdGlmIChJU19ERVYgJiYgcHJldmlldyAmJiBzYW5pdGl6ZWRTaXRlVXJsICE9PSBudWxsKSB7XG5cdFx0XHRsb2dnZXIuaW5mbyhcIlByZXZpZXcgbW9kZSBlbmFibGVkLiBTdWJzY3JpYmluZyB5b3UgdG8gQmlnQ29tbWVyY2UgQVBJIHdlYmhvb2suLi5cIik7XG5cblx0XHRcdC8vIE1ha2UgYSBgUE9TVGAgcmVxdWVzdCB0byB0aGUgQmlnQ29tbWVyY2UgQVBJIHRvIHN1YnNjcmliZSB0byBpdHMgd2ViaG9va1xuXHRcdFx0Y29uc3QgYm9keSA9IHtcblx0XHRcdFx0c2NvcGU6IFwic3RvcmUvcHJvZHVjdC91cGRhdGVkXCIsXG5cdFx0XHRcdGlzX2FjdGl2ZTogdHJ1ZSxcblx0XHRcdFx0ZGVzdGluYXRpb246IGAke3Nhbml0aXplZFNpdGVVcmx9L19fQkNQcmV2aWV3YFxuXHRcdFx0fTtcblxuXHRcdFx0YXdhaXQgQkMuZ2V0KEJJR0NPTU1FUkNFX1dFQkhPT0tfQVBJX0VORFBPSU5UKVxuXHRcdFx0XHQudGhlbigocmVzKSA9PiB7XG5cdFx0XHRcdFx0aWYgKFwiZGF0YVwiIGluIHJlcyAmJiBPYmplY3Qua2V5cyhyZXMuZGF0YSkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0bG9nZ2VyLmluZm8oXCJCaWdDb21tZXJjZSBBUEkgd2ViaG9vayBzdWJzY3JpcHRpb24gYWxyZWFkeSBleGlzdHMuIFNraXBwaW5nIHN1YnNjcmlwdGlvbi4uLlwiKTtcblx0XHRcdFx0XHRcdGxvZ2dlci5pbmZvKFwiQmlnQ29tbWVyY2UgQVBJIHdlYmhvb2sgc3Vic2NyaXB0aW9uIGNvbXBsZXRlLiBSdW5uaW5nIHByZXZpZXcgc2VydmVyLi4uXCIpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQoYXN5bmMgKCkgPT5cblx0XHRcdFx0XHRcdFx0YXdhaXQgQkMucG9zdChCSUdDT01NRVJDRV9XRUJIT09LX0FQSV9FTkRQT0lOVCwgYm9keSkudGhlbigocmVzKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKFwiZGF0YVwiIGluIHJlcyAmJiBPYmplY3Qua2V5cyhyZXMuZGF0YSkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bG9nZ2VyLmluZm8oXCJCaWdDb21tZXJjZSBBUEkgd2ViaG9vayBzdWJzY3JpcHRpb24gY3JlYXRlZCBzdWNjZXNzZnVsbHkuIFJ1bm5pbmcgcHJldmlldyBzZXJ2ZXIuLi5cIik7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KSkoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBzZXJ2ZXIgPSBtaWNybyhhc3luYyAocmVxLCByZXMpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHJlcXVlc3QgPSBhd2FpdCBtaWNyby5qc29uKHJlcSk7XG5cdFx0XHRcdFx0XHRjb25zdCBwcm9kdWN0SWQgPSByZXF1ZXN0LmRhdGEuaWQ7XG5cblx0XHRcdFx0XHRcdC8vIFdlYmhvb2tzIGRvbid0IHNlbmQgYW55IGRhdGEsIHNvIHdlIG5lZWQgdG8gbWFrZSBhIHJlcXVlc3QgdG8gdGhlIEJpZ0NvbW1lcmNlIEFQSSB0byBnZXQgdGhlIHByb2R1Y3QgZGF0YVxuXHRcdFx0XHRcdFx0Y29uc3QgbmV3UHJvZHVjdCA9IGF3YWl0IEJDLmdldChgL2NhdGFsb2cvcHJvZHVjdHMvJHtwcm9kdWN0SWR9YCk7XG5cdFx0XHRcdFx0XHRjb25zdCBub2RlVG9VcGRhdGUgPSBuZXdQcm9kdWN0LmRhdGE7XG5cblx0XHRcdFx0XHRcdGlmIChub2RlVG9VcGRhdGUuaWQpIHtcblx0XHRcdFx0XHRcdFx0Y3JlYXRlTm9kZSh7XG5cdFx0XHRcdFx0XHRcdFx0Li4ubm9kZVRvVXBkYXRlLFxuXHRcdFx0XHRcdFx0XHRcdGlkOiBjcmVhdGVOb2RlSWQoYCR7bm9kZVRvVXBkYXRlPy5pZCA/PyBgQmlnQ29tbWVyY2VOb2RlYH1gKSxcblx0XHRcdFx0XHRcdFx0XHRwYXJlbnQ6IG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0Y2hpbGRyZW46IFtdLFxuXHRcdFx0XHRcdFx0XHRcdGludGVybmFsOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0eXBlOiBgQmlnQ29tbWVyY2VOb2RlYCxcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRlbnREaWdlc3Q6IGNyZWF0ZUNvbnRlbnREaWdlc3Qobm9kZVRvVXBkYXRlKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0bG9nZ2VyLmluZm8oYFVwZGF0ZWQgbm9kZTogJHtub2RlVG9VcGRhdGUuaWR9YCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIFNlbmQgYSByZXNwb25zZSBiYWNrIHRvIHRoZSBCaWdDb21tZXJjZSBBUElcblx0XHRcdFx0XHRcdHJlcy5lbmQoXCJva1wiKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHNlcnZlci5saXN0ZW4oODAzMywgbG9nZ2VyLmluZm8oYE5vdyBsaXN0ZW5pbmcgdG8gY2hhbmdlcyBmb3IgbGl2ZSBwcmV2aWV3IGF0IC9fX0JDUHJldmlld2ApKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRcdFx0XHRlcnJNZXNzYWdlID0gbmV3IEVycm9yKGBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBjcmVhdGluZyBCaWdDb21tZXJjZSBBUEkgd2ViaG9vayBzdWJzY3JpcHRpb24uICR7ZXJyfWApO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gSWYgYGVuZHBvaW50c2AgaXMgbnVsbCwgdGhyb3cgYW4gZXJyb3Jcblx0XHRpZiAoZW5kcG9pbnRzID09IG51bGwpIHtcblx0XHRcdGVyck1lc3NhZ2UgPSBuZXcgRXJyb3IoXCJUaGUgYGVuZHBvaW50c2AgYXJlIHJlcXVpcmVkIHRvIG1ha2UgYW55IGNhbGwgdG8gdGhlIEJpZ0NvbW1lcmNlIEFQSVwiKTtcblx0XHR9XG5cblx0XHQvLyBJZiBgY2xpZW50SWRgIGlzIG51bGwsIHRocm93IGFuIGVycm9yXG5cdFx0aWYgKGNsaWVudElkID09IG51bGwpIHtcblx0XHRcdGVyck1lc3NhZ2UgPSBuZXcgRXJyb3IoXCJUaGUgYGNsaWVudElkYCBpcyByZXF1aXJlZCB0byBtYWtlIGFueSBjYWxsIHRvIHRoZSBCaWdDb21tZXJjZSBBUElcIik7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgYHNlY3JldGAgaXMgbnVsbCwgdGhyb3cgYW4gZXJyb3Jcblx0XHRpZiAoc2VjcmV0ID09IG51bGwpIHtcblx0XHRcdGVyck1lc3NhZ2UgPSBuZXcgRXJyb3IoXCJUaGUgYHNlY3JldGAgaXMgcmVxdWlyZWQgdG8gbWFrZSBhbnkgY2FsbCB0byB0aGUgQmlnQ29tbWVyY2UgQVBJXCIpO1xuXHRcdH1cblxuXHRcdC8vIElmIGBzdG9yZUhhc2hgIGlzIG51bGwsIHRocm93IGFuIGVycm9yXG5cdFx0aWYgKHN0b3JlSGFzaCA9PSBudWxsKSB7XG5cdFx0XHRlcnJNZXNzYWdlID0gbmV3IEVycm9yKFwiVGhlIGBzdG9yZUhhc2hgIGlzIHJlcXVpcmVkIHRvIG1ha2UgYW55IGNhbGwgdG8gdGhlIEJpZ0NvbW1lcmNlIEFQSVwiKTtcblx0XHR9XG5cblx0XHQvLyBJZiBgYWNjZXNzVG9rZW5gIGlzIG51bGwsIHRocm93IGFuIGVycm9yXG5cdFx0aWYgKGFjY2Vzc1Rva2VuID09IG51bGwpIHtcblx0XHRcdGVyck1lc3NhZ2UgPSBuZXcgRXJyb3IoXCJUaGUgYGFjY2Vzc1Rva2VuYCBpcyByZXF1aXJlZCB0byBtYWtlIGFueSBjYWxsIHRvIHRoZSBCaWdDb21tZXJjZSBBUElcIik7XG5cdFx0fVxuXHR9XG5cblx0aWYgKGVyck1lc3NhZ2UgIT09IFwiXCIpIHtcblx0XHRjb25zdCBleGl0TWVzc2FnZSA9IFwiUGx1Z2luIHRlcm1pbmF0ZWQgd2l0aCBlcnJvcnMuLi5cIjtcblxuXHRcdGxvZ2dlci5lcnJvcihgJHtleGl0TWVzc2FnZX1gKTtcblxuXHRcdHRocm93IGVyck1lc3NhZ2U7XG5cdH1cbn07XG5cbi8qKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ3JlYXRlIGEgZGV2IHNlcnZlciBmb3IgcHJldmlld2luZyB0aGUgc2l0ZSB3aGVuIGBwcmV2aWV3YCBpcyBlbmFibGVkXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cbmV4cG9ydHMub25DcmVhdGVEZXZTZXJ2ZXIgPSAoeyBhcHAgfSkgPT5cblx0YXBwLnVzZShcblx0XHRcIi9fX0JDUHJldmlldy9cIixcblx0XHRjcmVhdGVQcm94eU1pZGRsZXdhcmUoe1xuXHRcdFx0dGFyZ2V0OiBgaHR0cDovL2xvY2FsaG9zdDo4MDMzYCxcblx0XHRcdHNlY3VyZTogZmFsc2Vcblx0XHR9KVxuXHQpO1xuIl19
