"use strict";

import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import micro from "micro";
import sleep from "then-sleep";
import { BIGCOMMERCE_WEBHOOK_API_ENDPOINT, IS_DEV, REQUEST_BIGCOMMERCE_API_URL, REQUEST_TIMEOUT } from "./constants";
import BigCommerce from "./utils/bigcommerce";
import { convertObjectToString } from "./utils/convertValues";
import { logger } from "./utils/logger";

/**
 * @description Create a node from the data
 * @param {Object} item
 * @param {string} nodeType
 * @param {Object} helpers
 * @param {string} endpoint
 * @param {Object} log
 * @returns {Promise<void>} Node creation promise
 */
const handleCreateNodeFromData = (item, nodeType, helpers, endpoint, log) => {
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

	helpers
		.createNode(node)
		.then(() => {
			log.warn(`(OK) [CREATE NODE] ${endpoint} - ${helpers.createNodeId(`${nodeType}-${item.id}`)}`);

			return node;
		})
		.catch((err) => {
			log.error(`(FAIL) [CREATE NODE] ${endpoint} - ${helpers.createNodeId(`${nodeType}-${item.id}`)}`, err.message);

			throw err;
		});
};

/**
 * @description Validate the plugin options
 * @param {Object} Joi
 * @returns {Object} Joi schema
 */
exports.pluginOptionsSchema = ({ Joi }) =>
	Joi.object({
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

/**
 * @description Source and cache nodes from the BigCommerce API
 * @param {Object} actions
 * @param {Object} createNodeId
 * @param {Object} createContentDigest
 * @param {Object} pluginOptions
 * @returns {Promise<void>} Node creation promise
 */
exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, pluginOptions) => {
	// Prepare plugin options
	const {
		auth: { client_id = null, secret = null, access_token = null, store_hash = null, headers = {} },
		endpoints = null,
		preview = false,
		log_level = "info",
		response_type = "json",
		request_timeout = REQUEST_TIMEOUT
	} = pluginOptions;

	// Custom logger based on the `log_level` plugin option
	const log = logger(log_level);

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
		log,
		request_timeout
	});

	// Get the endpoints from the BigCommerce site and create nodes
	await Promise.allSettled(
		Object.entries(endpoints).map(
			async ([nodeName, endpoint]) =>
				await bigcommerce
					.get(endpoint)
					.then((res) => {
						// If the data object is not on the response, it could be `v2` which returns an array as the root, so use that as a fallback
						const resData = "data" in res && Array.isArray(res.data) ? res.data : res;

						// Create node for each item in the response
						return "data" in res && Array.isArray(res.data)
							? resData.map((datum) => handleCreateNodeFromData(datum, nodeName, helpers, REQUEST_BIGCOMMERCE_API_URL + `/stores/${store_hash}` + endpoint, log))
							: Array.isArray(res)
							? res.map((datum) => handleCreateNodeFromData(datum, nodeName, helpers, REQUEST_BIGCOMMERCE_API_URL + `/stores/${store_hash}` + endpoint, log))
							: handleCreateNodeFromData(resData, nodeName, helpers, REQUEST_BIGCOMMERCE_API_URL + `/stores/${store_hash}` + endpoint, log);
					})
					.catch((err) => {
						log.error(`An error occurred while fetching endpoint data: ${err.message}`);

						return err;
					})
		)
	).finally(async () => {
		// If preview mode is enabled, create a preview node
		if (IS_DEV && preview) {
			if (!preview.enabled && typeof preview.enabled !== "boolean" && !preview.site_url && typeof preview.site_url !== "string" && preview.site_url?.length === 0) {
				throw new Error("Incorrect preview settings. Check the `preview` object. It must have `enabled` and `site_url` properties set correctly.");
			}

			log.warn("Subscribing you to BigCommerce API webhook...");

			// Make a `POST` request to the BigCommerce API to subscribe to its webhook
			const body = {
				scope: "store/product/updated",
				is_active: true,
				destination: `${preview.site_url}/__BigcommercePreview`
			};

			await bigcommerce
				.get(BIGCOMMERCE_WEBHOOK_API_ENDPOINT)
				.then((res) => {
					if ("data" in res && Object.keys(res.data).length > 0) {
						log.warn("BigCommerce API webhook subscription already exists. Skipping subscription...");
						log.info("BigCommerce API webhook subscription complete");
						log.warn("Running preview server...");
					} else {
						(async () =>
							await bigcommerce.post(BIGCOMMERCE_WEBHOOK_API_ENDPOINT, body).then((res) => {
								if ("data" in res && Object.keys(res.data).length > 0) {
									log.info("BigCommerce API webhook subscription created successfully.");
									log.info("Running preview server...");
								}
							}))();
					}

					// Start the preview server
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
									log.debug(`Updated node: ${nodeToUpdate.id}`);
								}
							}

							// Send a response back to the BigCommerce API
							res.end("OK");
						})
					);

					server.listen(8033, log.warn("Now listening to changes for live preview at /__BigcommercePreview"));
				})
				.catch((err) => {
					log.error(`An error occurred while creating BigCommerce API webhook subscription. ${err.message}`);

					throw err;
				});
		}
	});
};

/**
 * ============================================================================
 * Create a dev server for previewing the site when `preview` is enabled
 * ============================================================================
 */
exports.onCreateDevServer = ({ app }) =>
	app.use(
		"/__BigcommercePreview/",
		createProxyMiddleware({
			target: `http://localhost:8033`,
			secure: false
		})
	);
