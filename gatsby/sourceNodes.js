"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.sourceNodes = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _constants = require("../constants");

var _bigcommerce = _interopRequireDefault(require("../utils/bigcommerce"));

var _convertValues = require("../utils/convertValues");

var sourceNodes = (function () {
	var _ref2 = (0, _asyncToGenerator2.default)(
		_regenerator.default.mark(function _callee(_ref, configOptions) {
			var actions,
				createNodeId,
				createContentDigest,
				createNode,
				_configOptions$endpoi,
				endpoints,
				_configOptions$client,
				clientId,
				_configOptions$secret,
				secret,
				_configOptions$storeH,
				storeHash,
				_configOptions$access,
				accessToken,
				_configOptions$hostna,
				hostname,
				_configOptions$previe,
				preview,
				errMessage,
				bigCommerce,
				exitMessage;

			return _regenerator.default.wrap(function _callee$(_context) {
				while (1) {
					switch ((_context.prev = _context.next)) {
						case 0:
							(actions = _ref.actions), (createNodeId = _ref.createNodeId), (createContentDigest = _ref.createContentDigest);
							createNode = actions.createNode;
							(_configOptions$endpoi = configOptions.endpoints),
								(endpoints = _configOptions$endpoi === void 0 ? null : _configOptions$endpoi),
								(_configOptions$client = configOptions.clientId),
								(clientId = _configOptions$client === void 0 ? null : _configOptions$client),
								(_configOptions$secret = configOptions.secret),
								(secret = _configOptions$secret === void 0 ? null : _configOptions$secret),
								(_configOptions$storeH = configOptions.storeHash),
								(storeHash = _configOptions$storeH === void 0 ? null : _configOptions$storeH),
								(_configOptions$access = configOptions.accessToken),
								(accessToken = _configOptions$access === void 0 ? null : _configOptions$access),
								(_configOptions$hostna = configOptions.hostname),
								(hostname = _configOptions$hostna === void 0 ? null : _configOptions$hostna),
								(_configOptions$previe = configOptions.preview),
								(preview = _configOptions$previe === void 0 ? false : _configOptions$previe);
							errMessage = "";
							console.log(_constants.FG_YELLOW, "\nChecking BigCommerce plugin options... ");

							if (!(endpoints !== null && clientId !== null && secret !== null && storeHash !== null && accessToken !== null)) {
								_context.next = 18;
								break;
							}

							bigCommerce = new _bigcommerce.default({
								clientId: clientId,
								accessToken: accessToken,
								secret: secret,
								storeHash: storeHash,
								responseType: "json"
							});

							if (!(typeof endpoints === "object" && Object.keys(endpoints).length > 0)) {
								_context.next = 14;
								break;
							}

							console.log(_constants.FG_GREEN, "\nValid plugin options found. Proceeding with plugin initialization...");
							console.log(_constants.FG_YELLOW, "\nRequesting endpoint data...\n");
							_context.next = 12;
							return Promise.all(
								Object.entries(endpoints).map(function (_ref3) {
									var nodeName = _ref3[0],
										endpoint = _ref3[1];
									return bigCommerce.get(endpoint).then(function (res) {
										var resData = "data" in res && Array.isArray(res.data) ? res.data : res;
										return "data" in res && Array.isArray(res.data)
											? resData.map(function (datum) {
													return createNode(
														(0, _extends2.default)({}, datum, {
															id: createNodeId("" + (datum.id + "-" + nodeName)),
															bigcommerce_id: datum.id,
															parent: null,
															children: [],
															internal: {
																type: nodeName,
																content: (0, _convertValues.handleConversionObjectToString)(datum),
																contentDigest: createContentDigest(datum)
															}
														})
													);
											  })
											: Array.isArray(res)
											? res.map(function (datum) {
													return createNode(
														(0, _extends2.default)({}, datum, {
															id: createNodeId("" + (datum.id + "-" + nodeName)),
															bigcommerce_id: datum.id,
															parent: null,
															children: [],
															internal: {
																type: nodeName,
																content: (0, _convertValues.handleConversionObjectToString)(datum),
																contentDigest: createContentDigest(datum)
															}
														})
													);
											  })
											: createNode(
													(0, _extends2.default)({}, resData, {
														id: createNodeId("" + (resData.id + "-" + nodeName)),
														parent: null,
														children: [],
														internal: {
															type: nodeName,
															content: (0, _convertValues.handleConversionObjectToString)(resData),
															contentDigest: createContentDigest(resData)
														}
													})
											  );
									});
								})
							)
								.then(function () {
									console.log(_constants.FG_GREEN, "\nAll endpoint data have been fetched successfully.");
								})
								.catch(function (err) {
									errMessage = new Error("An error occurred while fetching endpoint data. " + err);
								})
								.finally(function () {
									return console.log(_constants.FG_YELLOW, "\nRequesting endpoint data complete.\n");
								});

						case 12:
							_context.next = 15;
							break;

						case 14:
							errMessage = new Error("The `endpoints` object is required to make any call to the BigCommerce API");

						case 15:
							if (preview) {
								errMessage = new Error("The `preview` option is not currently supported. A fix is in the works.");
							}

							_context.next = 23;
							break;

						case 18:
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

						case 23:
							if (!(errMessage !== "")) {
								_context.next = 27;
								break;
							}

							exitMessage = "\nPlugin terminated with errors...\n";
							console.error(_constants.FG_RED, exitMessage);
							throw errMessage;

						case 27:
						case "end":
							return _context.stop();
					}
				}
			}, _callee);
		})
	);

	return function sourceNodes(_x, _x2) {
		return _ref2.apply(this, arguments);
	};
})();

exports.sourceNodes = sourceNodes;
//# sourceMappingURL=sourceNodes.js.map
