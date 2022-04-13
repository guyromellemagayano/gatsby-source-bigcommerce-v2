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

exports.sourceNodes = (function () {
	var _ref2 = (0, _asyncToGenerator2.default)(
		_regenerator.default.mark(function _callee3(_ref, pluginOptions) {
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

			return _regenerator.default.wrap(function _callee3$(_context3) {
				while (1) {
					switch ((_context3.prev = _context3.next)) {
						case 0:
							(actions = _ref.actions), (createNodeId = _ref.createNodeId), (createContentDigest = _ref.createContentDigest);
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
								_context3.next = 30;
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
								_context3.next = 22;
								break;
							}

							logger.info("Valid plugin options found. Proceeding with plugin initialization...");
							logger.info("Requesting endpoint data...");
							_context3.next = 20;
							return Promise.all(
								Object.entries(endpoints).map(function (_ref3) {
									var nodeName = _ref3[0],
										endpoint = _ref3[1];
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
							_context3.next = 23;
							break;

						case 22:
							errMessage = new Error("The `endpoints` object is required to make any call to the BigCommerce API");

						case 23:
							if (!(_constants.IS_DEV && preview && sanitizedSiteUrl !== null)) {
								_context3.next = 28;
								break;
							}

							logger.info("Preview mode enabled. Subscribing you to BigCommerce API webhook...");
							body = {
								scope: "store/product/updated",
								is_active: true,
								destination: sanitizedSiteUrl + "/__BCPreview"
							};
							_context3.next = 28;
							return BC.get(_constants.BIGCOMMERCE_WEBHOOK_API_ENDPOINT)
								.then(function (res) {
									if ("data" in res && Object.keys(res.data).length > 0) {
										logger.info("BigCommerce API webhook subscription already exists. Skipping subscription...");
										logger.info("BigCommerce API webhook subscription complete. Running preview server...");
									} else {
										(0, _asyncToGenerator2.default)(
											_regenerator.default.mark(function _callee() {
												return _regenerator.default.wrap(function _callee$(_context) {
													while (1) {
														switch ((_context.prev = _context.next)) {
															case 0:
																_context.next = 2;
																return BC.post(_constants.BIGCOMMERCE_WEBHOOK_API_ENDPOINT, body).then(function (res) {
																	if ("data" in res && Object.keys(res.data).length > 0) {
																		logger.info("BigCommerce API webhook subscription created successfully. Running preview server...");
																	}
																});

															case 2:
																return _context.abrupt("return", _context.sent);

															case 3:
															case "end":
																return _context.stop();
														}
													}
												}, _callee);
											})
										)();
									}

									var server = (0, _micro.default)(
										(function () {
											var _ref5 = (0, _asyncToGenerator2.default)(
												_regenerator.default.mark(function _callee2(req, res) {
													var request, productId, newProduct, nodeToUpdate, _nodeToUpdate$id;

													return _regenerator.default.wrap(function _callee2$(_context2) {
														while (1) {
															switch ((_context2.prev = _context2.next)) {
																case 0:
																	_context2.next = 2;
																	return _micro.default.json(req);

																case 2:
																	request = _context2.sent;
																	productId = request.data.id;
																	_context2.next = 6;
																	return BC.get("/catalog/products/" + productId);

																case 6:
																	newProduct = _context2.sent;
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
																	return _context2.stop();
															}
														}
													}, _callee2);
												})
											);

											return function (_x3, _x4) {
												return _ref5.apply(this, arguments);
											};
										})()
									);
									server.listen(8033, logger.info("Now listening to changes for live preview at /__BCPreview"));
								})
								.catch(function (err) {
									errMessage = new Error("An error occurred while creating BigCommerce API webhook subscription. " + err);
								});

						case 28:
							_context3.next = 35;
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
								_context3.next = 39;
								break;
							}

							exitMessage = "Plugin terminated with errors...";
							logger.error("" + exitMessage);
							throw errMessage;

						case 39:
						case "end":
							return _context3.stop();
					}
				}
			}, _callee3);
		})
	);

	return function (_x, _x2) {
		return _ref2.apply(this, arguments);
	};
})();

exports.onCreateDevServer = function (_ref6) {
	var app = _ref6.app;
	return app.use(
		"/__BCPreview/",
		(0, _httpProxyMiddleware.createProxyMiddleware)({
			target: "http://localhost:8033",
			secure: false
		})
	);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9nYXRzYnktbm9kZS5qcyJdLCJuYW1lcyI6WyJoYW5kbGVDcmVhdGVOb2RlRnJvbURhdGEiLCJpdGVtIiwibm9kZVR5cGUiLCJoZWxwZXJzIiwibm9kZU1ldGFkYXRhIiwiaWQiLCJjcmVhdGVOb2RlSWQiLCJiaWdjb21tZXJjZV9pZCIsInBhcmVudCIsImNoaWxkcmVuIiwiaW50ZXJuYWwiLCJ0eXBlIiwiY29udGVudCIsImNvbnRlbnREaWdlc3QiLCJjcmVhdGVDb250ZW50RGlnZXN0Iiwibm9kZSIsIk9iamVjdCIsImFzc2lnbiIsImNyZWF0ZU5vZGUiLCJleHBvcnRzIiwib25QcmVJbml0IiwibG9nTGV2ZWxzIiwibGV2ZWxzIiwiaW5mbyIsImNvbG9ycyIsImNvbWJpbmUiLCJmb3JtYXQiLCJ0aW1lc3RhbXAiLCJjb2xvcml6ZSIsInNpbXBsZSIsImxvZ2dlciIsImxldmVsIiwidHJhbnNwb3J0cyIsIkNvbnNvbGUiLCJzb3VyY2VOb2RlcyIsInBsdWdpbk9wdGlvbnMiLCJhY3Rpb25zIiwiZW5kcG9pbnRzIiwiY2xpZW50SWQiLCJzZWNyZXQiLCJzdG9yZUhhc2giLCJhY2Nlc3NUb2tlbiIsInNpdGVVcmwiLCJwcmV2aWV3IiwibG9nTGV2ZWwiLCJhZ2VudCIsInJlc3BvbnNlVHlwZSIsImhlYWRlcnMiLCJzYW5pdGl6ZWRTaXRlVXJsIiwic2FuaXRpemVkTG9nTGV2ZWwiLCJzYW5pdGl6ZVJlc3BvbnNlVHlwZSIsImVycm9yIiwiZGVidWciLCJlcnJNZXNzYWdlIiwiQkMiLCJCaWdDb21tZXJjZSIsImtleXMiLCJsZW5ndGgiLCJQcm9taXNlIiwiYWxsIiwiZW50cmllcyIsIm1hcCIsIm5vZGVOYW1lIiwiZW5kcG9pbnQiLCJnZXQiLCJ0aGVuIiwicmVzIiwicmVzRGF0YSIsIkFycmF5IiwiaXNBcnJheSIsImRhdGEiLCJkYXR1bSIsImNhdGNoIiwiZXJyIiwiRXJyb3IiLCJmaW5hbGx5IiwiSVNfREVWIiwiYm9keSIsInNjb3BlIiwiaXNfYWN0aXZlIiwiZGVzdGluYXRpb24iLCJCSUdDT01NRVJDRV9XRUJIT09LX0FQSV9FTkRQT0lOVCIsInBvc3QiLCJzZXJ2ZXIiLCJyZXEiLCJtaWNybyIsImpzb24iLCJyZXF1ZXN0IiwicHJvZHVjdElkIiwibmV3UHJvZHVjdCIsIm5vZGVUb1VwZGF0ZSIsImVuZCIsImxpc3RlbiIsImV4aXRNZXNzYWdlIiwib25DcmVhdGVEZXZTZXJ2ZXIiLCJhcHAiLCJ1c2UiLCJ0YXJnZXQiLCJzZWN1cmUiXSwibWFwcGluZ3MiOiJBQUNBOzs7Ozs7Ozs7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBT0EsSUFBTUEsd0JBQXdCLEdBQUcsU0FBM0JBLHdCQUEyQixDQUFDQyxJQUFELEVBQU9DLFFBQVAsRUFBaUJDLE9BQWpCLEVBQTZCO0FBQzdELE1BQU1DLFlBQVksOEJBQ2RILElBRGM7QUFFakJJLElBQUFBLEVBQUUsRUFBRUYsT0FBTyxDQUFDRyxZQUFSLENBQXdCSixRQUF4QixTQUFvQ0QsSUFBSSxDQUFDSSxFQUF6QyxDQUZhO0FBR2pCRSxJQUFBQSxjQUFjLEVBQUVOLElBQUksQ0FBQ0ksRUFISjtBQUlqQkcsSUFBQUEsTUFBTSxFQUFFLElBSlM7QUFLakJDLElBQUFBLFFBQVEsRUFBRSxFQUxPO0FBTWpCQyxJQUFBQSxRQUFRLEVBQUU7QUFDVEMsTUFBQUEsSUFBSSxFQUFFVCxRQURHO0FBRVRVLE1BQUFBLE9BQU8sRUFBRSxtREFBK0JYLElBQS9CLENBRkE7QUFHVFksTUFBQUEsYUFBYSxFQUFFVixPQUFPLENBQUNXLG1CQUFSLENBQTRCYixJQUE1QjtBQUhOO0FBTk8sSUFBbEI7QUFhQSxNQUFNYyxJQUFJLEdBQUdDLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JoQixJQUFsQixFQUF3QkcsWUFBeEIsQ0FBYjtBQUVBRCxFQUFBQSxPQUFPLENBQUNlLFVBQVIsQ0FBbUJILElBQW5CO0FBRUEsU0FBT0EsSUFBUDtBQUNBLENBbkJEOztBQTBCQUksT0FBTyxDQUFDQyxT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RUFBVixDQUFiO0FBQ0E7O0FBR0QsZ0JBQUluQyxNQUFNLElBQUksSUFBZCxFQUFvQjtBQUNuQmMsY0FBQUEsVUFBVSxHQUFHLElBQUlxQixLQUFKLENBQVUsa0VBQVYsQ0FBYjtBQUNBOztBQUdELGdCQUFJbEMsU0FBUyxJQUFJLElBQWpCLEVBQXVCO0FBQ3RCYSxjQUFBQSxVQUFVLEdBQUcsSUFBSXFCLEtBQUosQ0FBVSxxRUFBVixDQUFiO0FBQ0E7O0FBR0QsZ0JBQUlqQyxXQUFXLElBQUksSUFBbkIsRUFBeUI7QUFDeEJZLGNBQUFBLFVBQVUsR0FBRyxJQUFJcUIsS0FBSixDQUFVLHVFQUFWLENBQWI7QUFDQTs7QUFoTG1CO0FBQUEsa0JBbUxqQnJCLFVBQVUsS0FBSyxFQW5MRTtBQUFBO0FBQUE7QUFBQTs7QUFvTGR3QyxZQUFBQSxXQXBMYyxHQW9MQSxrQ0FwTEE7QUFzTHBCL0QsWUFBQUEsTUFBTSxDQUFDcUIsS0FBUCxNQUFnQjBDLFdBQWhCO0FBdExvQixrQkF3TGR4QyxVQXhMYzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUF0Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFpTUFsQyxPQUFPLENBQUMyRSxpQkFBUixHQUE0QjtBQUFBLE1BQUdDLEdBQUgsU0FBR0EsR0FBSDtBQUFBLFNBQzNCQSxHQUFHLENBQUNDLEdBQUosQ0FDQyxlQURELEVBRUMsZ0RBQXNCO0FBQ3JCQyxJQUFBQSxNQUFNLHlCQURlO0FBRXJCQyxJQUFBQSxNQUFNLEVBQUU7QUFGYSxHQUF0QixDQUZELENBRDJCO0FBQUEsQ0FBNUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB7IGNyZWF0ZVByb3h5TWlkZGxld2FyZSB9IGZyb20gXCJodHRwLXByb3h5LW1pZGRsZXdhcmVcIjtcbmltcG9ydCBtaWNybyBmcm9tIFwibWljcm9cIjtcbmltcG9ydCB7IGFkZENvbG9ycywgY3JlYXRlTG9nZ2VyLCBmb3JtYXQsIHRyYW5zcG9ydHMgfSBmcm9tIFwid2luc3RvblwiO1xuaW1wb3J0IHsgQklHQ09NTUVSQ0VfV0VCSE9PS19BUElfRU5EUE9JTlQsIElTX0RFViB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IEJpZ0NvbW1lcmNlIGZyb20gXCIuL3V0aWxzL2JpZ2NvbW1lcmNlXCI7XG5pbXBvcnQgeyBoYW5kbGVDb252ZXJzaW9uT2JqZWN0VG9TdHJpbmcsIGhhbmRsZUNvbnZlcnNpb25TdHJpbmdUb0xvd2VyY2FzZSB9IGZyb20gXCIuL3V0aWxzL2NvbnZlcnRWYWx1ZXNcIjtcblxuLyoqXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBIZWxwZXIgZnVuY3Rpb25zIGFuZCBjb25zdGFudHNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuY29uc3QgaGFuZGxlQ3JlYXRlTm9kZUZyb21EYXRhID0gKGl0ZW0sIG5vZGVUeXBlLCBoZWxwZXJzKSA9PiB7XG5cdGNvbnN0IG5vZGVNZXRhZGF0YSA9IHtcblx0XHQuLi5pdGVtLFxuXHRcdGlkOiBoZWxwZXJzLmNyZWF0ZU5vZGVJZChgJHtub2RlVHlwZX0tJHtpdGVtLmlkfWApLFxuXHRcdGJpZ2NvbW1lcmNlX2lkOiBpdGVtLmlkLFxuXHRcdHBhcmVudDogbnVsbCxcblx0XHRjaGlsZHJlbjogW10sXG5cdFx0aW50ZXJuYWw6IHtcblx0XHRcdHR5cGU6IG5vZGVUeXBlLFxuXHRcdFx0Y29udGVudDogaGFuZGxlQ29udmVyc2lvbk9iamVjdFRvU3RyaW5nKGl0ZW0pLFxuXHRcdFx0Y29udGVudERpZ2VzdDogaGVscGVycy5jcmVhdGVDb250ZW50RGlnZXN0KGl0ZW0pXG5cdFx0fVxuXHR9O1xuXG5cdGNvbnN0IG5vZGUgPSBPYmplY3QuYXNzaWduKHt9LCBpdGVtLCBub2RlTWV0YWRhdGEpO1xuXG5cdGhlbHBlcnMuY3JlYXRlTm9kZShub2RlKTtcblxuXHRyZXR1cm4gbm9kZTtcbn07XG5cbi8qKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogVmVyaWZ5IHBsdWdpbiBsb2FkcyBhbmQgY2hlY2sgZm9yIHJlcXVpcmVkIHBsdWdpbiBvcHRpb25zXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cbmV4cG9ydHMub25QcmVJbml0ID0gKCkgPT4ge1xuXHQvLyBBZGQgY3VzdG9tIGxvZyBsZXZlbHNcblx0Y29uc3QgbG9nTGV2ZWxzID0ge1xuXHRcdGxldmVsczoge1xuXHRcdFx0aW5mbzogMVxuXHRcdH0sXG5cdFx0Y29sb3JzOiB7XG5cdFx0XHRpbmZvOiBcImJvbGQgZ3JlZW5cIlxuXHRcdH1cblx0fTtcblxuXHQvLyBBZGQgY29uc29sZSBjb2xvcnNcblx0YWRkQ29sb3JzKGxvZ0xldmVscy5jb2xvcnMpO1xuXG5cdGNvbnN0IHsgY29tYmluZSwgdGltZXN0YW1wLCBjb2xvcml6ZSwgc2ltcGxlIH0gPSBmb3JtYXQ7XG5cblx0Ly8gSW5pdCBgd2luc3RvbmAgbG9nZ2VyXG5cdGNvbnN0IGxvZ2dlciA9IGNyZWF0ZUxvZ2dlcih7XG5cdFx0bGV2ZWw6IFwiaW5mb1wiLFxuXHRcdGxldmVsczogbG9nTGV2ZWxzLmxldmVscyxcblx0XHRmb3JtYXQ6IGNvbWJpbmUoY29sb3JpemUoKSwgc2ltcGxlKCksIHRpbWVzdGFtcCgpKSxcblx0XHR0cmFuc3BvcnRzOiBbbmV3IHRyYW5zcG9ydHMuQ29uc29sZSgpXVxuXHR9KTtcblxuXHRsb2dnZXIuaW5mbyhcImBnYXRzYnktc291cmNlLWJpZ2NvbW1lcmNlYCBwbHVnaW4gbG9hZGVkIHN1Y2Nlc3NmdWxseS5cIik7XG59O1xuXG4vKipcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFNvdXJjZSBhbmQgY2FjaGUgbm9kZXMgZnJvbSB0aGUgQmlnQ29tbWVyY2UgQVBJXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cbmV4cG9ydHMuc291cmNlTm9kZXMgPSBhc3luYyAoeyBhY3Rpb25zLCBjcmVhdGVOb2RlSWQsIGNyZWF0ZUNvbnRlbnREaWdlc3QgfSwgcGx1Z2luT3B0aW9ucykgPT4ge1xuXHRjb25zdCB7IGNyZWF0ZU5vZGUgfSA9IGFjdGlvbnM7XG5cdGNvbnN0IHsgZW5kcG9pbnRzID0gbnVsbCwgY2xpZW50SWQgPSBudWxsLCBzZWNyZXQgPSBudWxsLCBzdG9yZUhhc2ggPSBudWxsLCBhY2Nlc3NUb2tlbiA9IG51bGwsIHNpdGVVcmwgPSBudWxsLCBwcmV2aWV3ID0gZmFsc2UsIGxvZ0xldmVsID0gXCJpbmZvXCIsIGFnZW50ID0gbnVsbCwgcmVzcG9uc2VUeXBlID0gXCJqc29uXCIsIGhlYWRlcnMgPSB7fSB9ID0gcGx1Z2luT3B0aW9ucztcblxuXHRjb25zdCBoZWxwZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgYWN0aW9ucywge1xuXHRcdGNyZWF0ZUNvbnRlbnREaWdlc3QsXG5cdFx0Y3JlYXRlTm9kZUlkXG5cdH0pO1xuXG5cdGNvbnN0IHNhbml0aXplZFNpdGVVcmwgPSBoYW5kbGVDb252ZXJzaW9uU3RyaW5nVG9Mb3dlcmNhc2Uoc2l0ZVVybCk7XG5cdGNvbnN0IHNhbml0aXplZExvZ0xldmVsID0gaGFuZGxlQ29udmVyc2lvblN0cmluZ1RvTG93ZXJjYXNlKGxvZ0xldmVsKTtcblx0Y29uc3Qgc2FuaXRpemVSZXNwb25zZVR5cGUgPSBoYW5kbGVDb252ZXJzaW9uU3RyaW5nVG9Mb3dlcmNhc2UocmVzcG9uc2VUeXBlKTtcblxuXHQvLyBBZGQgY3VzdG9tIGxvZyBsZXZlbHNcblx0Y29uc3QgbG9nTGV2ZWxzID0ge1xuXHRcdGxldmVsczoge1xuXHRcdFx0ZXJyb3I6IDAsXG5cdFx0XHRkZWJ1ZzogMSxcblx0XHRcdGluZm86IDJcblx0XHR9LFxuXHRcdGNvbG9yczoge1xuXHRcdFx0ZXJyb3I6IFwiYm9sZCByZWRcIixcblx0XHRcdGRlYnVnOiBcImJvbGQgYmx1ZVwiLFxuXHRcdFx0aW5mbzogXCJib2xkIGdyZWVuXCJcblx0XHR9XG5cdH07XG5cblx0Ly8gQWRkIGNvbnNvbGUgY29sb3JzXG5cdGFkZENvbG9ycyhsb2dMZXZlbHMuY29sb3JzKTtcblxuXHRjb25zdCB7IGNvbWJpbmUsIHRpbWVzdGFtcCwgY29sb3JpemUsIHNpbXBsZSB9ID0gZm9ybWF0O1xuXG5cdC8vIEluaXQgYHdpbnN0b25gIGxvZ2dlclxuXHRjb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoe1xuXHRcdGxldmVsOiBzYW5pdGl6ZWRMb2dMZXZlbCxcblx0XHRsZXZlbHM6IGxvZ0xldmVscy5sZXZlbHMsXG5cdFx0Zm9ybWF0OiBjb21iaW5lKGNvbG9yaXplKCksIHNpbXBsZSgpLCB0aW1lc3RhbXAoKSksXG5cdFx0dHJhbnNwb3J0czogW25ldyB0cmFuc3BvcnRzLkNvbnNvbGUoKV1cblx0fSk7XG5cblx0Ly8gQ3VzdG9tIHZhcmlhYmxlc1xuXHRsZXQgZXJyTWVzc2FnZSA9IFwiXCI7XG5cblx0bG9nZ2VyLmluZm8oXCJDaGVja2luZyBCaWdDb21tZXJjZSBwbHVnaW4gb3B0aW9ucy4uLlwiKTtcblxuXHRpZiAoZW5kcG9pbnRzICE9PSBudWxsICYmIGNsaWVudElkICE9PSBudWxsICYmIHNlY3JldCAhPT0gbnVsbCAmJiBzdG9yZUhhc2ggIT09IG51bGwgJiYgYWNjZXNzVG9rZW4gIT09IG51bGwpIHtcblx0XHQvLyBJbml0IG5ldyBgQmlnQ29tbWVyY2VgIGluc3RhbmNlXG5cdFx0Y29uc3QgQkMgPSBuZXcgQmlnQ29tbWVyY2Uoe1xuXHRcdFx0Y2xpZW50SWQ6IGNsaWVudElkLFxuXHRcdFx0YWNjZXNzVG9rZW46IGFjY2Vzc1Rva2VuLFxuXHRcdFx0c2VjcmV0OiBzZWNyZXQsXG5cdFx0XHRzdG9yZUhhc2g6IHN0b3JlSGFzaCxcblx0XHRcdHJlc3BvbnNlVHlwZTogc2FuaXRpemVSZXNwb25zZVR5cGUsXG5cdFx0XHRsb2dnZXI6IGxvZ2dlcixcblx0XHRcdGFnZW50OiBhZ2VudCxcblx0XHRcdGhlYWRlcnM6IGhlYWRlcnNcblx0XHR9KTtcblxuXHRcdC8vIEhhbmRsZSBmZXRjaGluZyBhbmQgY3JlYXRpbmcgbm9kZXMgZm9yIGEgc2luZ2xlIG9yIG11bHRpcGxlIGVuZHBvaW50c1xuXHRcdGlmIChlbmRwb2ludHMgJiYgdHlwZW9mIGVuZHBvaW50cyA9PT0gXCJvYmplY3RcIiAmJiBPYmplY3Qua2V5cyhlbmRwb2ludHMpLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vIFNlbmQgbG9nIG1lc3NhZ2Ugd2hlbiBmZXRjaGluZyBkYXRhXG5cdFx0XHRsb2dnZXIuaW5mbyhcIlZhbGlkIHBsdWdpbiBvcHRpb25zIGZvdW5kLiBQcm9jZWVkaW5nIHdpdGggcGx1Z2luIGluaXRpYWxpemF0aW9uLi4uXCIpO1xuXHRcdFx0bG9nZ2VyLmluZm8oXCJSZXF1ZXN0aW5nIGVuZHBvaW50IGRhdGEuLi5cIik7XG5cblx0XHRcdGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0XHRPYmplY3QuZW50cmllcyhlbmRwb2ludHMpLm1hcCgoW25vZGVOYW1lLCBlbmRwb2ludF0pID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gQkMuZ2V0KGVuZHBvaW50KS50aGVuKChyZXMpID0+IHtcblx0XHRcdFx0XHRcdC8vIElmIHRoZSBkYXRhIG9iamVjdCBpcyBub3Qgb24gdGhlIHJlc3BvbnNlLCBpdCBjb3VsZCBiZSBgdjJgIHdoaWNoIHJldHVybnMgYW4gYXJyYXkgYXMgdGhlIHJvb3QsIHNvIHVzZSB0aGF0IGFzIGEgZmFsbGJhY2tcblx0XHRcdFx0XHRcdGNvbnN0IHJlc0RhdGEgPSBcImRhdGFcIiBpbiByZXMgJiYgQXJyYXkuaXNBcnJheShyZXMuZGF0YSkgPyByZXMuZGF0YSA6IHJlcztcblxuXHRcdFx0XHRcdFx0Ly8gSGFuZGxlIGdlbmVyYXRpbmcgbm9kZXNcblx0XHRcdFx0XHRcdHJldHVybiBcImRhdGFcIiBpbiByZXMgJiYgQXJyYXkuaXNBcnJheShyZXMuZGF0YSlcblx0XHRcdFx0XHRcdFx0PyByZXNEYXRhLm1hcCgoZGF0dW0pID0+IGhhbmRsZUNyZWF0ZU5vZGVGcm9tRGF0YShkYXR1bSwgbm9kZU5hbWUsIGhlbHBlcnMpKVxuXHRcdFx0XHRcdFx0XHQ6IEFycmF5LmlzQXJyYXkocmVzKVxuXHRcdFx0XHRcdFx0XHQ/IHJlcy5tYXAoKGRhdHVtKSA9PiBoYW5kbGVDcmVhdGVOb2RlRnJvbURhdGEoZGF0dW0sIG5vZGVOYW1lLCBoZWxwZXJzKSlcblx0XHRcdFx0XHRcdFx0OiBoYW5kbGVDcmVhdGVOb2RlRnJvbURhdGEocmVzRGF0YSwgbm9kZU5hbWUsIGhlbHBlcnMpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KVxuXHRcdFx0KVxuXHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0Ly8gU2VuZCBsb2cgbWVzc2FnZSB3aGVuIGFsbCBlbmRwb2ludHMgaGF2ZSBiZWVuIGZldGNoZWRcblx0XHRcdFx0XHRsb2dnZXIuaW5mbyhcIkFsbCBlbmRwb2ludCBkYXRhIGhhdmUgYmVlbiBmZXRjaGVkIHN1Y2Nlc3NmdWxseS5cIik7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0XHRcdFx0Ly8gU2VuZCBsb2cgbWVzc2FnZSB3aGVuIGFuIGVycm9yIG9jY3Vyc1xuXHRcdFx0XHRcdGVyck1lc3NhZ2UgPSBuZXcgRXJyb3IoYEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGZldGNoaW5nIGVuZHBvaW50IGRhdGEuICR7ZXJyfWApO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZmluYWxseSgoKSA9PlxuXHRcdFx0XHRcdC8vIFNlbmQgbG9nIG1lc3NhZ2Ugd2hlbiBmZXRjaGluZyBkYXRhIGlzIGNvbXBsZXRlXG5cdFx0XHRcdFx0bG9nZ2VyLmluZm8oXCJSZXF1ZXN0aW5nIGVuZHBvaW50IGRhdGEgY29tcGxldGUuXCIpXG5cdFx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVyck1lc3NhZ2UgPSBuZXcgRXJyb3IoXCJUaGUgYGVuZHBvaW50c2Agb2JqZWN0IGlzIHJlcXVpcmVkIHRvIG1ha2UgYW55IGNhbGwgdG8gdGhlIEJpZ0NvbW1lcmNlIEFQSVwiKTtcblx0XHR9XG5cblx0XHRpZiAoSVNfREVWICYmIHByZXZpZXcgJiYgc2FuaXRpemVkU2l0ZVVybCAhPT0gbnVsbCkge1xuXHRcdFx0bG9nZ2VyLmluZm8oXCJQcmV2aWV3IG1vZGUgZW5hYmxlZC4gU3Vic2NyaWJpbmcgeW91IHRvIEJpZ0NvbW1lcmNlIEFQSSB3ZWJob29rLi4uXCIpO1xuXG5cdFx0XHQvLyBNYWtlIGEgYFBPU1RgIHJlcXVlc3QgdG8gdGhlIEJpZ0NvbW1lcmNlIEFQSSB0byBzdWJzY3JpYmUgdG8gaXRzIHdlYmhvb2tcblx0XHRcdGNvbnN0IGJvZHkgPSB7XG5cdFx0XHRcdHNjb3BlOiBcInN0b3JlL3Byb2R1Y3QvdXBkYXRlZFwiLFxuXHRcdFx0XHRpc19hY3RpdmU6IHRydWUsXG5cdFx0XHRcdGRlc3RpbmF0aW9uOiBgJHtzYW5pdGl6ZWRTaXRlVXJsfS9fX0JDUHJldmlld2Bcblx0XHRcdH07XG5cblx0XHRcdGF3YWl0IEJDLmdldChCSUdDT01NRVJDRV9XRUJIT09LX0FQSV9FTkRQT0lOVClcblx0XHRcdFx0LnRoZW4oKHJlcykgPT4ge1xuXHRcdFx0XHRcdGlmIChcImRhdGFcIiBpbiByZXMgJiYgT2JqZWN0LmtleXMocmVzLmRhdGEpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGxvZ2dlci5pbmZvKFwiQmlnQ29tbWVyY2UgQVBJIHdlYmhvb2sgc3Vic2NyaXB0aW9uIGFscmVhZHkgZXhpc3RzLiBTa2lwcGluZyBzdWJzY3JpcHRpb24uLi5cIik7XG5cdFx0XHRcdFx0XHRsb2dnZXIuaW5mbyhcIkJpZ0NvbW1lcmNlIEFQSSB3ZWJob29rIHN1YnNjcmlwdGlvbiBjb21wbGV0ZS4gUnVubmluZyBwcmV2aWV3IHNlcnZlci4uLlwiKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0KGFzeW5jICgpID0+XG5cdFx0XHRcdFx0XHRcdGF3YWl0IEJDLnBvc3QoQklHQ09NTUVSQ0VfV0VCSE9PS19BUElfRU5EUE9JTlQsIGJvZHkpLnRoZW4oKHJlcykgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChcImRhdGFcIiBpbiByZXMgJiYgT2JqZWN0LmtleXMocmVzLmRhdGEpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdGxvZ2dlci5pbmZvKFwiQmlnQ29tbWVyY2UgQVBJIHdlYmhvb2sgc3Vic2NyaXB0aW9uIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5LiBSdW5uaW5nIHByZXZpZXcgc2VydmVyLi4uXCIpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSkpKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3Qgc2VydmVyID0gbWljcm8oYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCByZXF1ZXN0ID0gYXdhaXQgbWljcm8uanNvbihyZXEpO1xuXHRcdFx0XHRcdFx0Y29uc3QgcHJvZHVjdElkID0gcmVxdWVzdC5kYXRhLmlkO1xuXG5cdFx0XHRcdFx0XHQvLyBXZWJob29rcyBkb24ndCBzZW5kIGFueSBkYXRhLCBzbyB3ZSBuZWVkIHRvIG1ha2UgYSByZXF1ZXN0IHRvIHRoZSBCaWdDb21tZXJjZSBBUEkgdG8gZ2V0IHRoZSBwcm9kdWN0IGRhdGFcblx0XHRcdFx0XHRcdGNvbnN0IG5ld1Byb2R1Y3QgPSBhd2FpdCBCQy5nZXQoYC9jYXRhbG9nL3Byb2R1Y3RzLyR7cHJvZHVjdElkfWApO1xuXHRcdFx0XHRcdFx0Y29uc3Qgbm9kZVRvVXBkYXRlID0gbmV3UHJvZHVjdC5kYXRhO1xuXG5cdFx0XHRcdFx0XHRpZiAobm9kZVRvVXBkYXRlLmlkKSB7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZU5vZGUoe1xuXHRcdFx0XHRcdFx0XHRcdC4uLm5vZGVUb1VwZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHRpZDogY3JlYXRlTm9kZUlkKGAke25vZGVUb1VwZGF0ZT8uaWQgPz8gYEJpZ0NvbW1lcmNlTm9kZWB9YCksXG5cdFx0XHRcdFx0XHRcdFx0cGFyZW50OiBudWxsLFxuXHRcdFx0XHRcdFx0XHRcdGNoaWxkcmVuOiBbXSxcblx0XHRcdFx0XHRcdFx0XHRpbnRlcm5hbDoge1xuXHRcdFx0XHRcdFx0XHRcdFx0dHlwZTogYEJpZ0NvbW1lcmNlTm9kZWAsXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZW50RGlnZXN0OiBjcmVhdGVDb250ZW50RGlnZXN0KG5vZGVUb1VwZGF0ZSlcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdGxvZ2dlci5pbmZvKGBVcGRhdGVkIG5vZGU6ICR7bm9kZVRvVXBkYXRlLmlkfWApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBTZW5kIGEgcmVzcG9uc2UgYmFjayB0byB0aGUgQmlnQ29tbWVyY2UgQVBJXG5cdFx0XHRcdFx0XHRyZXMuZW5kKFwib2tcIik7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRzZXJ2ZXIubGlzdGVuKDgwMzMsIGxvZ2dlci5pbmZvKGBOb3cgbGlzdGVuaW5nIHRvIGNoYW5nZXMgZm9yIGxpdmUgcHJldmlldyBhdCAvX19CQ1ByZXZpZXdgKSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0XHRcdFx0ZXJyTWVzc2FnZSA9IG5ldyBFcnJvcihgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgY3JlYXRpbmcgQmlnQ29tbWVyY2UgQVBJIHdlYmhvb2sgc3Vic2NyaXB0aW9uLiAke2Vycn1gKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vIElmIGBlbmRwb2ludHNgIGlzIG51bGwsIHRocm93IGFuIGVycm9yXG5cdFx0aWYgKGVuZHBvaW50cyA9PSBudWxsKSB7XG5cdFx0XHRlcnJNZXNzYWdlID0gbmV3IEVycm9yKFwiVGhlIGBlbmRwb2ludHNgIGFyZSByZXF1aXJlZCB0byBtYWtlIGFueSBjYWxsIHRvIHRoZSBCaWdDb21tZXJjZSBBUElcIik7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgYGNsaWVudElkYCBpcyBudWxsLCB0aHJvdyBhbiBlcnJvclxuXHRcdGlmIChjbGllbnRJZCA9PSBudWxsKSB7XG5cdFx0XHRlcnJNZXNzYWdlID0gbmV3IEVycm9yKFwiVGhlIGBjbGllbnRJZGAgaXMgcmVxdWlyZWQgdG8gbWFrZSBhbnkgY2FsbCB0byB0aGUgQmlnQ29tbWVyY2UgQVBJXCIpO1xuXHRcdH1cblxuXHRcdC8vIElmIGBzZWNyZXRgIGlzIG51bGwsIHRocm93IGFuIGVycm9yXG5cdFx0aWYgKHNlY3JldCA9PSBudWxsKSB7XG5cdFx0XHRlcnJNZXNzYWdlID0gbmV3IEVycm9yKFwiVGhlIGBzZWNyZXRgIGlzIHJlcXVpcmVkIHRvIG1ha2UgYW55IGNhbGwgdG8gdGhlIEJpZ0NvbW1lcmNlIEFQSVwiKTtcblx0XHR9XG5cblx0XHQvLyBJZiBgc3RvcmVIYXNoYCBpcyBudWxsLCB0aHJvdyBhbiBlcnJvclxuXHRcdGlmIChzdG9yZUhhc2ggPT0gbnVsbCkge1xuXHRcdFx0ZXJyTWVzc2FnZSA9IG5ldyBFcnJvcihcIlRoZSBgc3RvcmVIYXNoYCBpcyByZXF1aXJlZCB0byBtYWtlIGFueSBjYWxsIHRvIHRoZSBCaWdDb21tZXJjZSBBUElcIik7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgYGFjY2Vzc1Rva2VuYCBpcyBudWxsLCB0aHJvdyBhbiBlcnJvclxuXHRcdGlmIChhY2Nlc3NUb2tlbiA9PSBudWxsKSB7XG5cdFx0XHRlcnJNZXNzYWdlID0gbmV3IEVycm9yKFwiVGhlIGBhY2Nlc3NUb2tlbmAgaXMgcmVxdWlyZWQgdG8gbWFrZSBhbnkgY2FsbCB0byB0aGUgQmlnQ29tbWVyY2UgQVBJXCIpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChlcnJNZXNzYWdlICE9PSBcIlwiKSB7XG5cdFx0Y29uc3QgZXhpdE1lc3NhZ2UgPSBcIlBsdWdpbiB0ZXJtaW5hdGVkIHdpdGggZXJyb3JzLi4uXCI7XG5cblx0XHRsb2dnZXIuZXJyb3IoYCR7ZXhpdE1lc3NhZ2V9YCk7XG5cblx0XHR0aHJvdyBlcnJNZXNzYWdlO1xuXHR9XG59O1xuXG4vKipcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENyZWF0ZSBhIGRldiBzZXJ2ZXIgZm9yIHByZXZpZXdpbmcgdGhlIHNpdGUgd2hlbiBgcHJldmlld2AgaXMgZW5hYmxlZFxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5leHBvcnRzLm9uQ3JlYXRlRGV2U2VydmVyID0gKHsgYXBwIH0pID0+XG5cdGFwcC51c2UoXG5cdFx0XCIvX19CQ1ByZXZpZXcvXCIsXG5cdFx0Y3JlYXRlUHJveHlNaWRkbGV3YXJlKHtcblx0XHRcdHRhcmdldDogYGh0dHA6Ly9sb2NhbGhvc3Q6ODAzM2AsXG5cdFx0XHRzZWN1cmU6IGZhbHNlXG5cdFx0fSlcblx0KTtcbiJdfQ==
