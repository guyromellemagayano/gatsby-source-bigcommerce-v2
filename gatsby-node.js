"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _httpProxyMiddleware = require("http-proxy-middleware");

var _micro = _interopRequireDefault(require("micro"));

var _winston = require("winston");

var _constants = require("./constants");

var _bigcommerce = _interopRequireDefault(require("./utils/bigcommerce"));

var _convertValues = require("./utils/convertValues");

/**
 * ============================================================================
 * Helper functions and constants
 * ============================================================================
 */
const handleCreateNodeFromData = (item, nodeType, helpers) => {
  const nodeMetadata = { ...item,
    id: helpers.createNodeId(`${nodeType}-${item.id}`),
    bigcommerce_id: item.id,
    parent: null,
    children: [],
    internal: {
      type: nodeType,
      content: (0, _convertValues.handleConversionObjectToString)(item),
      contentDigest: helpers.createContentDigest(item)
    }
  };
  const node = Object.assign({}, item, nodeMetadata);
  helpers.createNode(node);
  return node;
};
/**
 * ============================================================================
 * Verify plugin loads and check for required plugin options
 * ============================================================================
 */


exports.onPreInit = () => {
  // Add custom log levels
  const logLevels = {
    levels: {
      info: 1
    },
    colors: {
      info: "bold green"
    }
  }; // Add console colors

  (0, _winston.addColors)(logLevels.colors);
  const {
    combine,
    timestamp,
    colorize,
    simple
  } = _winston.format; // Init `winston` logger

  const logger = (0, _winston.createLogger)({
    level: "info",
    levels: logLevels.levels,
    format: combine(colorize(), simple(), timestamp()),
    transports: [new _winston.transports.Console()]
  });
  logger.info("`gatsby-source-bigcommerce` plugin loaded successfully.");
};
/**
 * ============================================================================
 * Override Gatsby default Webpack configuration
 * ============================================================================
 */


exports.onCreateWebpackConfig = async ({
  actions
}) => {
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        crypto: false,
        https: false,
        zlib: false
      }
    }
  });
};
/**
 * ============================================================================
 * Source and cache nodes from the BigCommerce API
 * ============================================================================
 */


exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest
}, pluginOptions) => {
  const {
    createNode
  } = actions;
  const {
    endpoints = null,
    clientId = null,
    secret = null,
    storeHash = null,
    accessToken = null,
    siteUrl = null,
    preview = false,
    logLevel = "info",
    agent = null,
    responseType = "json",
    headers = {}
  } = pluginOptions;
  const helpers = Object.assign({}, actions, {
    createContentDigest,
    createNodeId
  });
  const sanitizedSiteUrl = (0, _convertValues.handleConversionStringToLowercase)(siteUrl);
  const sanitizedLogLevel = (0, _convertValues.handleConversionStringToLowercase)(logLevel);
  const sanitizeResponseType = (0, _convertValues.handleConversionStringToLowercase)(responseType); // Add custom log levels

  const logLevels = {
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
  }; // Add console colors

  (0, _winston.addColors)(logLevels.colors);
  const {
    combine,
    timestamp,
    colorize,
    simple
  } = _winston.format; // Init `winston` logger

  const logger = (0, _winston.createLogger)({
    level: sanitizedLogLevel,
    levels: logLevels.levels,
    format: combine(colorize(), simple(), timestamp()),
    transports: [new _winston.transports.Console()]
  }); // Custom variables

  let errMessage = "";
  logger.info("Checking BigCommerce plugin options...");

  if (endpoints !== null && clientId !== null && secret !== null && storeHash !== null && accessToken !== null) {
    // Init new `BigCommerce` instance
    const BC = new _bigcommerce.default({
      clientId: clientId,
      accessToken: accessToken,
      secret: secret,
      storeHash: storeHash,
      responseType: sanitizeResponseType,
      logger: logger,
      agent: agent,
      headers: headers
    }); // Handle fetching and creating nodes for a single or multiple endpoints

    if (endpoints && typeof endpoints === "object" && Object.keys(endpoints).length > 0) {
      // Send log message when fetching data
      logger.info("Valid plugin options found. Proceeding with plugin initialization...");
      logger.info("Requesting endpoint data...");
      await Promise.all(Object.entries(endpoints).map(([nodeName, endpoint]) => {
        return BC.get(endpoint).then(res => {
          // If the data object is not on the response, it could be `v2` which returns an array as the root, so use that as a fallback
          const resData = "data" in res && Array.isArray(res.data) ? res.data : res; // Handle generating nodes

          return "data" in res && Array.isArray(res.data) ? resData.map(datum => handleCreateNodeFromData(datum, nodeName, helpers)) : Array.isArray(res) ? res.map(datum => handleCreateNodeFromData(datum, nodeName, helpers)) : handleCreateNodeFromData(resData, nodeName, helpers);
        });
      })).then(() => {
        // Send log message when all endpoints have been fetched
        logger.info("All endpoint data have been fetched successfully.");
      }).catch(err => {
        // Send log message when an error occurs
        errMessage = new Error(`An error occurred while fetching endpoint data. ${err}`);
      }).finally(() => // Send log message when fetching data is complete
      logger.info("Requesting endpoint data complete."));
    } else {
      errMessage = new Error("The `endpoints` object is required to make any call to the BigCommerce API");
    }

    if (_constants.IS_DEV && preview && sanitizedSiteUrl !== null) {
      logger.info("Preview mode enabled. Subscribing you to BigCommerce API webhook..."); // Make a `POST` request to the BigCommerce API to subscribe to its webhook

      const body = {
        scope: "store/product/updated",
        is_active: true,
        destination: `${sanitizedSiteUrl}/__BCPreview`
      };
      await BC.get(_constants.BIGCOMMERCE_WEBHOOK_API_ENDPOINT).then(res => {
        if ("data" in res && Object.keys(res.data).length > 0) {
          logger.info("BigCommerce API webhook subscription already exists. Skipping subscription...");
          logger.info("BigCommerce API webhook subscription complete. Running preview server...");
        } else {
          (async () => await BC.post(_constants.BIGCOMMERCE_WEBHOOK_API_ENDPOINT, body).then(res => {
            if ("data" in res && Object.keys(res.data).length > 0) {
              logger.info("BigCommerce API webhook subscription created successfully. Running preview server...");
            }
          }))();
        }

        const server = (0, _micro.default)(async (req, res) => {
          const request = await _micro.default.json(req);
          const productId = request.data.id; // Webhooks don't send any data, so we need to make a request to the BigCommerce API to get the product data

          const newProduct = await BC.get(`/catalog/products/${productId}`);
          const nodeToUpdate = newProduct.data;

          if (nodeToUpdate.id) {
            var _nodeToUpdate$id;

            createNode({ ...nodeToUpdate,
              id: createNodeId(`${(_nodeToUpdate$id = nodeToUpdate === null || nodeToUpdate === void 0 ? void 0 : nodeToUpdate.id) !== null && _nodeToUpdate$id !== void 0 ? _nodeToUpdate$id : `BigCommerceNode`}`),
              parent: null,
              children: [],
              internal: {
                type: `BigCommerceNode`,
                contentDigest: createContentDigest(nodeToUpdate)
              }
            });
            logger.info(`Updated node: ${nodeToUpdate.id}`);
          } // Send a response back to the BigCommerce API


          res.end("ok");
        });
        server.listen(8033, logger.info(`Now listening to changes for live preview at /__BCPreview`));
      }).catch(err => {
        errMessage = new Error(`An error occurred while creating BigCommerce API webhook subscription. ${err}`);
      });
    }
  } else {
    // If `endpoints` is null, throw an error
    if (endpoints == null) {
      errMessage = new Error("The `endpoints` are required to make any call to the BigCommerce API");
    } // If `clientId` is null, throw an error


    if (clientId == null) {
      errMessage = new Error("The `clientId` is required to make any call to the BigCommerce API");
    } // If `secret` is null, throw an error


    if (secret == null) {
      errMessage = new Error("The `secret` is required to make any call to the BigCommerce API");
    } // If `storeHash` is null, throw an error


    if (storeHash == null) {
      errMessage = new Error("The `storeHash` is required to make any call to the BigCommerce API");
    } // If `accessToken` is null, throw an error


    if (accessToken == null) {
      errMessage = new Error("The `accessToken` is required to make any call to the BigCommerce API");
    }
  }

  if (errMessage !== "") {
    const exitMessage = "Plugin terminated with errors...";
    logger.error(`${exitMessage}`);
    throw errMessage;
  }
};
/**
 * ============================================================================
 * Create a dev server for previewing the site when `preview` is enabled
 * ============================================================================
 */


exports.onCreateDevServer = ({
  app
}) => app.use("/__BCPreview/", (0, _httpProxyMiddleware.createProxyMiddleware)({
  target: `http://localhost:8033`,
  secure: false
}));
//# sourceMappingURL=gatsby-node.js.map