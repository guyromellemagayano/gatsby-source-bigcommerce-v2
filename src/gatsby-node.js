/* eslint-disable no-prototype-builtins */
"use strict";

import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import micro from "micro";
import sleep from "then-sleep";
import { BIGCOMMERCE_WEBHOOK_API_ENDPOINT, IS_DEV, REQUEST_TIMEOUT } from "./constants";
import BigCommerce from "./utils/bigcommerce";
import { convertObjectToString } from "./utils/convertValues";
import { logger } from "./utils/logger";

/**
 * ============================================================================
 * Helper functions
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
			content: convertObjectToString(item),
			contentDigest: helpers.createContentDigest(item)
		}
	};

	const node = Object.assign({}, item, nodeMetadata);

	helpers.createNode(node);

	return node;
};

/**
 * ============================================================================
 * Verify plugin loads
 * ============================================================================
 */
exports.onPreInit = () => {
	logger.info("@epicdesignlabs/gatsby-source-bigcommerce plugin loaded successfully");
};

/**
 * ============================================================================
 * Validate plugin options
 * ============================================================================
 */
exports.pluginOptionsSchema = async ({ Joi }) => {
	return Joi.object({
		auth: Joi.object({
			client_id: Joi.string()
				.required()
				.messages({
					"string.empty": "The `auth.client_id` is empty. Please provide a valid client ID.",
					"string.required": "The `auth.client_id` is required."
				})
				.description("The client ID of the BigCommerce store"),
			secret: Joi.string()
				.required()
				.messages({
					"string.empty": "The `auth.secret` is empty. Please provide a valid secret.",
					"string.required": "The `auth.secret` is required."
				})
				.description("The secret of the BigCommerce store"),
			access_token: Joi.string()
				.required()
				.messages({
					"string.empty": "The `auth.access_token` is empty. Please provide a valid access token.",
					"string.required": "The `auth.access_token` is required."
				})
				.description("The access token of the BigCommerce store"),
			store_hash: Joi.string()
				.required()
				.messages({
					"string.empty": "The `auth.store_hash` is empty. Please provide a valid store hash.",
					"string.required": "The `auth.store_hash` is required."
				})
				.description("The store hash of the BigCommerce store"),
			headers: Joi.object().default({}).description("The headers to send with each request")
		})
			.required()
			.messages({
				"object.required": "The `auth` object is required."
			})
			.description("The auth credentials for the BigCommerce site"),
		endpoints: Joi.object()
			.required()
			.messages({
				"object.required": "The `endpoints` object is required."
			})
			.description("The endpoints to create nodes for"),
		preview: Joi.object({
			site_url: Joi.string()
				.required()
				.messages({
					"string.empty": "The `preview.site_url` is empty. Please provide a valid URL.",
					"string.required": "The `preview.site_url` is required."
				})
				.description("The site URL"),
			enabled: Joi.boolean().default(false).description("Enable preview mode")
		})
			.default(false)
			.description("The preview mode settings"),
		log_level: Joi.string().default("debug").description("The log level to use"),
		response_type: Joi.string().default("json").description("The response type to use"),
		request_timeout: Joi.number().default(REQUEST_TIMEOUT).description("The request timeout to use in milliseconds")
	});
};

/**
 * ============================================================================
 * Source and cache nodes from the BigCommerce API
 * ============================================================================
 */
exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, pluginOptions) => {
	// Prepare plugin options
	const {
		auth: { client_id = null, secret = null, access_token = null, store_hash = null, headers = {} },
		endpoints = null,
		preview = false,
		log_level = "debug",
		response_type = "json",
		request_timeout = REQUEST_TIMEOUT
	} = pluginOptions;

	// Prepare node sourcing helpers
	const helpers = Object.assign({}, actions, {
		createContentDigest,
		createNodeId
	});

	// Create a new BigCommerce instance
	const bigcommerce = new BigCommerce({
		client_id,
		access_token,
		secret,
		store_hash,
		response_type,
		headers,
		log_level,
		request_timeout
	});

	await Promise.allSettled(
		Object.entries(endpoints).map(
			async ([nodeName, endpoint]) =>
				await bigcommerce
					.get(endpoint)
					.then((res) => {
						logger.info(`Success fetching data in ${endpoint}. Preparing data for node creation...`);

						// If the data object is not on the response, it could be `v2` which returns an array as the root, so use that as a fallback
						const resData = "data" in res && Array.isArray(res.data) ? res.data : res;

						// Create node for each item in the response
						return "data" in res && Array.isArray(res.data)
							? resData.map((datum) => handleCreateNodeFromData(datum, nodeName, helpers))
							: Array.isArray(res)
							? res.map((datum) => handleCreateNodeFromData(datum, nodeName, helpers))
							: handleCreateNodeFromData(resData, nodeName, helpers);
					})
					.catch((err) => {
						logger.error(`An error occurred while fetching BigCommerce endpoint data: ${err}`);

						return err;
					})
					.finally(async () => {
						logger.info("Fetching BigCommerce endpoint data done successfully");

						// If preview mode is enabled, create a preview node
						if (IS_DEV && preview) {
							if (!preview.enabled && typeof preview.enabled !== "boolean" && !preview.site_url && typeof preview.site_url !== "string" && preview.site_url?.length === 0) {
								throw new Error("Incorrect preview settings. Check the `preview` object. It must have `enabled` and `site_url` properties set correctly.");
							}

							logger.warn("Subscribing you to BigCommerce API webhook...");

							// Make a `POST` request to the BigCommerce API to subscribe to its webhook
							const body = {
								scope: "store/product/updated",
								is_active: true,
								destination: `${preview.site_url}/__BCPreview`
							};

							await bigcommerce
								.get(BIGCOMMERCE_WEBHOOK_API_ENDPOINT)
								.then((res) => {
									if ("data" in res && Object.keys(res.data).length > 0) {
										logger.info("BigCommerce API webhook subscription already exists. Skipping subscription...");
										logger.info("BigCommerce API webhook subscription complete");
										logger.info("Running preview server...");
									} else {
										(async () =>
											await bigcommerce.post(BIGCOMMERCE_WEBHOOK_API_ENDPOINT, body).then((res) => {
												if ("data" in res && Object.keys(res.data).length > 0) {
													logger.info("BigCommerce API webhook subscription created successfully.");
													logger.info("Running preview server...");
												}
											}))();
									}

									const server = new http.createServer(
										micro(async (req, res) => {
											await sleep(request_timeout);

											const request = await micro.json(req);
											const productId = request.data.id;

											// Webhooks don't send any data, so we need to make a request to the BigCommerce API to get the product data
											const newProduct = await bigcommerce.get(`/catalog/products/${productId}`);
											const nodeToUpdate = newProduct.data;

											if (nodeToUpdate.id) {
												helpers.createNode({
													...nodeToUpdate,
													id: createNodeId(`${nodeToUpdate?.id ?? `BigCommerceNode`}`),
													parent: null,
													children: [],
													internal: {
														type: "BigCommerceNode",
														contentDigest: createContentDigest(nodeToUpdate)
													}
												});

												if (this.log_level === "debug") {
													logger.debug(`Updated node: ${nodeToUpdate.id}`);
												}
											}

											// Send a response back to the BigCommerce API
											res.end("OK");
										})
									);

									server.listen(8033, logger.info("Now listening to changes for live preview at /__BCPreview"));
								})
								.catch((err) => {
									logger.error(`An error occurred while creating BigCommerce API webhook subscription. ${err}`);

									throw err;
								});
						}

						return true;
					})
		)
	);
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
