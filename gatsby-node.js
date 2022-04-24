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
//# sourceMappingURL=gatsby-node.js.map
