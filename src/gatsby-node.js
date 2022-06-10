"use strict";

import { createProxyMiddleware } from "http-proxy-middleware";
import micro from "micro";
import { BIGCOMMERCE_WEBHOOK_API_ENDPOINT, FG_BLUE, FG_CYAN, FG_GREEN, FG_MAGENTA, FG_RED, FG_YELLOW, IS_DEV } from "./constants";
import BigCommerce from "./utils/bigcommerce";
import { handleConversionObjectToString, handleConversionStringToLowercase } from "./utils/convertValues";

/**
 * ============================================================================
 * Helper functions and constants
 * ============================================================================
 */
const handleCreateNodeFromData = (item, nodeType, helpers) => {
	const nodeMetadata = {
		...item,
		id: helpers.createNodeId(`${nodeType}-${item.id}`),
		bigcommerce_id: item.id,
		parent: null,
		children: [],
		internal: {
			type: nodeType,
			content: handleConversionObjectToString(item),
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
	console.log(FG_GREEN, "\n[SUCCESS] `@epicdesignlabs/gatsby-source-bigcommerce` plugin loaded successfully.");
};

/**
 * ============================================================================
 * Override Gatsby default Webpack configuration
 * ============================================================================
 */
exports.onCreateWebpackConfig = async ({ actions }) => {
	actions.setWebpackConfig({
		resolve: {
			fallback: { crypto: false, https: false, zlib: false }
		}
	});
};

/**
 * ============================================================================
 * Source and cache nodes from the BigCommerce API
 * ============================================================================
 */
exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, pluginOptions) => {
	const { createNode } = actions;
	const { endpoints = null, clientId = null, secret = null, storeHash = null, accessToken = null, siteUrl = null, preview = false, headers = {} } = pluginOptions;

	const helpers = Object.assign({}, actions, {
		createContentDigest,
		createNodeId
	});

	const sanitizedClientId = handleConversionStringToLowercase(clientId);
	const sanitizedSecret = handleConversionStringToLowercase(secret);
	const sanitizedStoreHash = handleConversionStringToLowercase(storeHash);
	const sanitizedAccessToken = handleConversionStringToLowercase(accessToken);
	const sanitizedSiteUrl = handleConversionStringToLowercase(siteUrl);

	// Custom variables
	let errMessage = "";

	console.log(FG_YELLOW, "\n[IN PROGRESS] Checking BigCommerce plugin options...");

	if (endpoints && clientId && secret && storeHash && accessToken) {
		// Init new `BigCommerce` instance
		const BC = new BigCommerce({
			clientId: sanitizedClientId,
			accessToken: sanitizedAccessToken,
			secret: sanitizedSecret,
			storeHash: sanitizedStoreHash,
			responseType: "json",
			headers
		});

		// Handle fetching and creating nodes for a single or multiple endpoints
		if (endpoints && typeof endpoints === "object" && Object.keys(endpoints).length > 0) {
			// Send log message when fetching data
			console.log(FG_GREEN, "\n[SUCCESS] Valid plugin options found. Proceeding with plugin initialization...");
			console.log(FG_YELLOW, "\n[IN PROGRESS] Requesting endpoint data...");

			await Promise.allSettled(
				Object.entries(endpoints).map(
					async ([nodeName, endpoint]) =>
						await BC.get(endpoint)
							.then((response) => {
								// Send log message when data is fetched
								console.log(FG_GREEN, `\n[SUCCESS] All data for endpoint "${endpoint}" fetched successfully.`);
								console.log(FG_YELLOW, `\n[IN PROGRESS] Creating nodes for "${endpoint}"...`);

								// Create node for each item in the response
								return response.data && Array.isArray(response.data) && response.data.length > 0
									? response.data.map((datum) => (datum && typeof datum === "object" && Object.keys(datum)?.length > 0 ? handleCreateNodeFromData(datum, nodeName, helpers) : null))
									: response && Array.isArray(response) && response.length > 0
									? response.map((datum) => handleCreateNodeFromData(datum, nodeName, helpers))
									: handleCreateNodeFromData(response, nodeName, helpers);
							})
							.catch((error) => {
								// Send log message when data is fetched
								console.log(FG_RED, `\n[FAIL] Error fetching data for endpoint "${endpoint}".`);

								// Set error message
								errMessage = error.message;
							})
							.finally(() => {
								// Send log message when data is fetched
								console.log(FG_GREEN, `\n[SUCCESS] All nodes for endpoint "${endpoint}" created successfully.`);
							})
				)
			)
				.then(() => {
					// Send log message when all endpoints have been fetched
					console.log(FG_GREEN, "\n[SUCCESS] All endpoint data have been fetched successfully.");
				})
				.catch((err) => {
					// Send log message when an error occurs
					errMessage = new Error(`[FAIL] An error occurred while fetching endpoint data: ${err}`);
				})
				.finally(() =>
					// Send log message when fetching data is complete
					console.log(FG_GREEN, "\n[SUCCESS] Requesting endpoint data complete.")
				);
		} else {
			errMessage = new Error("\n[FAIL] The `endpoints` object is required to make any call to the BigCommerce API");
		}

		if (IS_DEV && preview && sanitizedSiteUrl) {
			console.log(FG_BLUE, "\n[INFO] Preview mode enabled");
			console.log(FG_YELLOW, "\n[IN PROGRESS] Subscribing you to BigCommerce API webhook...");

			// Make a `POST` request to the BigCommerce API to subscribe to its webhook
			const body = {
				scope: "store/product/updated",
				is_active: true,
				destination: `${sanitizedSiteUrl}/__BCPreview`
			};

			await BC.get(BIGCOMMERCE_WEBHOOK_API_ENDPOINT)
				.then((res) => {
					if ("data" in res && Object.keys(res.data).length > 0) {
						console.log(FG_YELLOW, "\n[IN PROGRESS] BigCommerce API webhook subscription already exists. Skipping subscription...");
						console.log(FG_GREEN, "\n[SUCCESS] BigCommerce API webhook subscription complete.");
						console.log(FG_YELLOW, "\n[IN PROGRESS] Running preview server...");
					} else {
						(async () =>
							await BC.post(BIGCOMMERCE_WEBHOOK_API_ENDPOINT, body).then((res) => {
								if ("data" in res && Object.keys(res.data).length > 0) {
									console.log(FG_GREEN, "\n[SUCCESS] BigCommerce API webhook subscription created successfully.");
									console.log(FG_YELLOW, "\n[IN PROGRESS] Running preview server...");
								}
							}))();
					}

					const server = micro(async (req, res) => {
						const request = await micro.json(req);
						const productId = request.data.id;

						// Webhooks don't send any data, so we need to make a request to the BigCommerce API to get the product data
						const newProduct = await BC.get(`/catalog/products/${productId}`);
						const nodeToUpdate = newProduct.data;

						if (nodeToUpdate.id) {
							createNode({
								...nodeToUpdate,
								id: createNodeId(`${nodeToUpdate?.id ?? `BigCommerceNode`}`),
								parent: null,
								children: [],
								internal: {
									type: `BigCommerceNode`,
									contentDigest: createContentDigest(nodeToUpdate)
								}
							});

							console.log(FG_MAGENTA, `\n[DATA] Updated node: ${nodeToUpdate.id}`);
						}

						// Send a response back to the BigCommerce API
						res.end("ok");
					});

					server.listen(8033, console.log(FG_CYAN, "\n[SERVER] Now listening to changes for live preview at /__BCPreview"));
				})
				.catch((err) => {
					errMessage = new Error(`[FAIL] An error occurred while creating BigCommerce API webhook subscription. ${err}`);
				});
		}
	} else {
		// If `endpoints` is null, throw an error
		if (endpoints === null || typeof endpoints === "undefined") {
			errMessage = new Error("\n[FAIL] The `endpoints` are required to make any call to the BigCommerce API");
		}

		// If `clientId` is null, throw an error
		if (clientId === null || typeof clientId === "undefined") {
			errMessage = new Error("\n[FAIL] The `clientId` is required to make any call to the BigCommerce API");
		}

		// If `secret` is null, throw an error
		if (secret === null || typeof secret === "undefined") {
			errMessage = new Error("\n[FAIL] The `secret` is required to make any call to the BigCommerce API");
		}

		// If `storeHash` is null, throw an error
		if (storeHash === null || typeof storeHash === "undefined") {
			errMessage = new Error("\n[FAIL] The `storeHash` is required to make any call to the BigCommerce API");
		}

		// If `accessToken` is null, throw an error
		if (accessToken === null || typeof accessToken === "undefined") {
			errMessage = new Error("\n[FAIL] The `accessToken` is required to make any call to the BigCommerce API");
		}
	}

	errMessage.length > 0
		? () => {
				console.log(FG_RED, "\nPlugin terminated with errors...");
				throw errMessage;
		  }
		: null;
};

/**
 * ============================================================================
 * Create a dev server for previewing the site when `preview` is enabled
 * ============================================================================
 */
exports.onCreateDevServer = ({ app }) =>
	app.use(
		"/__BCPreview/",
		createProxyMiddleware({
			target: `http://localhost:8033`,
			secure: false
		})
	);
