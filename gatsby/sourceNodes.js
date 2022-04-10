"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _httpProxyMiddleware = require("http-proxy-middleware");

var _micro = _interopRequireDefault(require("micro"));

var _winston = require("winston");

var _constants = require("../constants");

var _bigcommerce = _interopRequireDefault(require("../utils/bigcommerce"));

var _convertValues = require("../utils/convertValues");

exports.sourceNodes = function () {
  var _ref2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(_ref, configOptions) {
    var actions, createNodeId, createContentDigest, createNode, _configOptions$endpoi, endpoints, _configOptions$client, clientId, _configOptions$secret, secret, _configOptions$storeH, storeHash, _configOptions$access, accessToken, _configOptions$siteUr, siteUrl, _configOptions$previe, preview, _configOptions$logLev, logLevel, _configOptions$agent, agent, _configOptions$respon, responseType, _configOptions$header, headers, sanitizedSiteUrl, sanitizedLogLevel, sanitizeResponseType, logLevels, combine, timestamp, colorize, simple, logger, errMessage, BC, webhookEndpoint, body, server, exitMessage;

    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            actions = _ref.actions, createNodeId = _ref.createNodeId, createContentDigest = _ref.createContentDigest;
            createNode = actions.createNode;
            _configOptions$endpoi = configOptions.endpoints, endpoints = _configOptions$endpoi === void 0 ? null : _configOptions$endpoi, _configOptions$client = configOptions.clientId, clientId = _configOptions$client === void 0 ? null : _configOptions$client, _configOptions$secret = configOptions.secret, secret = _configOptions$secret === void 0 ? null : _configOptions$secret, _configOptions$storeH = configOptions.storeHash, storeHash = _configOptions$storeH === void 0 ? null : _configOptions$storeH, _configOptions$access = configOptions.accessToken, accessToken = _configOptions$access === void 0 ? null : _configOptions$access, _configOptions$siteUr = configOptions.siteUrl, siteUrl = _configOptions$siteUr === void 0 ? null : _configOptions$siteUr, _configOptions$previe = configOptions.preview, preview = _configOptions$previe === void 0 ? false : _configOptions$previe, _configOptions$logLev = configOptions.logLevel, logLevel = _configOptions$logLev === void 0 ? "info" : _configOptions$logLev, _configOptions$agent = configOptions.agent, agent = _configOptions$agent === void 0 ? null : _configOptions$agent, _configOptions$respon = configOptions.responseType, responseType = _configOptions$respon === void 0 ? "json" : _configOptions$respon, _configOptions$header = configOptions.headers, headers = _configOptions$header === void 0 ? {} : _configOptions$header;
            sanitizedSiteUrl = (0, _convertValues.handleConversionStringToLowercase)(siteUrl);
            sanitizedLogLevel = (0, _convertValues.handleConversionStringToLowercase)(logLevel);
            sanitizeResponseType = (0, _convertValues.handleConversionStringToLowercase)(responseType);
            logLevels = {
              levels: {
                error: 0,
                debug: 1,
                warn: 2,
                info: 4
              },
              colors: {
                error: "bold red",
                debug: "bold blue",
                warn: "bold yellow",
                info: "bold green"
              }
            };
            combine = _winston.format.combine, timestamp = _winston.format.timestamp, colorize = _winston.format.colorize, simple = _winston.format.simple;
            (0, _winston.addColors)(logLevels.colors);
            logger = (0, _winston.createLogger)({
              level: sanitizedLogLevel,
              levels: logLevels.levels,
              format: combine(colorize(), simple(), timestamp()),
              transports: [new _winston.transports.Console()]
            });
            errMessage = "";
            logger.info("Checking BigCommerce plugin options... ");

            if (!(endpoints !== null && clientId !== null && secret !== null && storeHash !== null && accessToken !== null)) {
              _context3.next = 31;
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
              _context3.next = 21;
              break;
            }

            logger.info("Valid plugin options found. Proceeding with plugin initialization...");
            logger.info("Requesting endpoint data...");
            _context3.next = 19;
            return Promise.all(Object.entries(endpoints).map(function (_ref3) {
              var nodeName = _ref3[0],
                  endpoint = _ref3[1];
              return BC.get(endpoint).then(function (res) {
                var resData = "data" in res && Array.isArray(res.data) ? res.data : res;
                return "data" in res && Array.isArray(res.data) ? resData.map(function (datum) {
                  return createNode((0, _extends2.default)({}, datum, {
                    id: createNodeId("" + (datum.id + "-" + nodeName)),
                    bigcommerce_id: datum.id,
                    parent: null,
                    children: [],
                    internal: {
                      type: nodeName,
                      content: (0, _convertValues.handleConversionObjectToString)(datum),
                      contentDigest: createContentDigest(datum)
                    }
                  }));
                }) : Array.isArray(res) ? res.map(function (datum) {
                  return createNode((0, _extends2.default)({}, datum, {
                    id: createNodeId("" + (datum.id + "-" + nodeName)),
                    bigcommerce_id: datum.id,
                    parent: null,
                    children: [],
                    internal: {
                      type: nodeName,
                      content: (0, _convertValues.handleConversionObjectToString)(datum),
                      contentDigest: createContentDigest(datum)
                    }
                  }));
                }) : createNode((0, _extends2.default)({}, resData, {
                  id: createNodeId("" + (resData.id + "-" + nodeName)),
                  parent: null,
                  children: [],
                  internal: {
                    type: nodeName,
                    content: (0, _convertValues.handleConversionObjectToString)(resData),
                    contentDigest: createContentDigest(resData)
                  }
                }));
              });
            })).then(function () {
              logger.info("All endpoint data have been fetched successfully.");
            }).catch(function (err) {
              errMessage = new Error("An error occurred while fetching endpoint data. " + err);
            }).finally(function () {
              return logger.info("Requesting endpoint data complete.");
            });

          case 19:
            _context3.next = 22;
            break;

          case 21:
            errMessage = new Error("The `endpoints` object is required to make any call to the BigCommerce API");

          case 22:
            if (!(_constants.IS_DEV && preview && sanitizedSiteUrl !== null)) {
              _context3.next = 29;
              break;
            }

            webhookEndpoint = "/v3/hooks";
            body = {
              scope: "store/product/updated",
              is_active: true,
              destination: sanitizedSiteUrl + "/__BCPreview"
            };
            _context3.next = 27;
            return BC.get(webhookEndpoint).then(function (res) {
              if ("data" in res && Object.keys(res.data).length > 0) {
                return res.data;
              } else return (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee() {
                return _regenerator.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return BC.post(webhookEndpoint, body).then(function (res) {
                          return res;
                        });

                      case 2:
                        return _context.abrupt("return", _context.sent);

                      case 3:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }))();
            });

          case 27:
            server = (0, _micro.default)(function () {
              var _ref5 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(req, res) {
                var request, productId, newProduct, nodeToUpdate, _nodeToUpdate$id;

                return _regenerator.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
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
                          createNode((0, _extends2.default)({}, nodeToUpdate, {
                            id: createNodeId("" + ((_nodeToUpdate$id = nodeToUpdate === null || nodeToUpdate === void 0 ? void 0 : nodeToUpdate.id) !== null && _nodeToUpdate$id !== void 0 ? _nodeToUpdate$id : "BigCommerceNode")),
                            parent: null,
                            children: [],
                            internal: {
                              type: "BigCommerceNode",
                              contentDigest: createContentDigest(nodeToUpdate)
                            }
                          }));
                          logger.info("Updated node: " + nodeToUpdate.id);
                        }

                        res.end("ok");

                      case 10:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function (_x3, _x4) {
                return _ref5.apply(this, arguments);
              };
            }());
            server.listen(8033, logger.info("Now listening to changes for live preview at /__BCPreview"));

          case 29:
            _context3.next = 36;
            break;

          case 31:
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

          case 36:
            if (!(errMessage !== "")) {
              _context3.next = 40;
              break;
            }

            exitMessage = "Plugin terminated with errors...";
            logger.error("" + exitMessage);
            throw errMessage;

          case 40:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.onCreateDevServer = function (_ref6) {
  var app = _ref6.app;
  app.use("/__BCPreview/", (0, _httpProxyMiddleware.createProxyMiddleware)({
    target: "http://localhost:8033",
    secure: false
  }));
};
//# sourceMappingURL=sourceNodes.js.map