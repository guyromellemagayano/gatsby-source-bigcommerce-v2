"use strict";

import { randomUUID } from "crypto";
import express from "express";
import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import _ from "lodash";
import {
	ACCESS_CONTROL_ALLOW_CREDENTIALS,
	ACCESS_CONTROL_ALLOW_HEADERS,
	APP_NAME,
	AUTH_HEADERS,
	BIGCOMMERCE_WEBHOOK_API_ENDPOINT,
	CACHE_KEY,
	CORS_ORIGIN,
	IS_DEV,
	REQUEST_BIGCOMMERCE_API_URL,
	REQUEST_CONCURRENCY,
	REQUEST_DEBOUNCE_INTERVAL,
	REQUEST_RESPONSE_TYPE,
	REQUEST_THROTTLE_INTERVAL,
	REQUEST_TIMEOUT
} from "./constants";
import { BigCommerce } from "./libs/bigcommerce";
import { convertObjectToString, convertStringToCamelCase } from "./utils/convertValues";
import { isArrayType, isBooleanType, isEmpty, isObjectType, isStringType } from "./utils/typeCheck";

/**
 * @description Camelize keys of an object
 * @param {Object} obj
 * @returns {Object} Object with camelCase keys
 */
const handleCamelizeKeys = (obj) => {
	if (isArrayType(obj) && !isEmpty(obj)) {
		return obj?.map((item) => handleCamelizeKeys(item));
	} else if (isObjectType(obj) && !isEmpty(obj)) {
		return Object.keys(obj).reduce(
			(result, key) => ({
				...result,
				[convertStringToCamelCase(key)]: handleCamelizeKeys(obj[key])
			}),
			{}
		);
	}

	return obj;
};

/**
 * @description Create a node from the data
 * @param {Object} item
 * @param {string} nodeType
 * @param {Object} helpers
 * @param {string} endpoint
 * @returns {Promise<void>} Node creation promise
 */
const handleCreateNodeFromData = async (item = null, nodeType = null, helpers = {}, endpoint = null) => {
	const { createNode, createNodeId, createContentDigest } = helpers;

	if (!isEmpty(item) && !isEmpty(nodeType)) {
		const stringifiedItem = convertObjectToString(item);
		const uuid = randomUUID();

		const nodeMetadata = {
			id: createNodeId(`${uuid}-${nodeType}-${endpoint}`),
			parent: null,
			children: [],
			internal: {
				type: nodeType,
				content: stringifiedItem,
				contentDigest: createContentDigest(stringifiedItem)
			}
		};
		const node = { ...item, ...nodeMetadata };

		await createNode(node)
			.then(() => {
				console.info(`[NODE] ${node?.internal?.contentDigest} - ${nodeType} - (OK)`);

				return node;
			})
			.catch((err) => {
				console.error(`[NODE] ${node?.internal?.contentDigest} - ${nodeType} (FAIL)`);
				console.error("\n", `${err?.message || convertObjectToString(err) || "An error occurred. Please try again later."}`, "\n");

				return err;
			});
	}
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
		globals: Joi.object()
			.when("enabled", {
				is: true,
				then: Joi.object({
					schema: Joi.string()
						.required()
						.allow(null)
						.default(null)
						.messages({
							"string.empty": "The `globals.schema` is empty. Please provide a valid schema.",
							"string.required": "The `globals.schema` is required."
						})
						.description("The schema for the Optimizely/Episerver site")
				})
			})
			.messages({
				"object.required": "The `globals` object is required."
			})
			.description("The global options for the plugin"),
		endpoints: Joi.array()
			.required()
			.items({
				nodeName: Joi.string()
					.required()
					.messages({
						"string.empty": "The `endpoints[index].nodeName` is empty. Please provide a valid node name.",
						"string.required": "The `endpoints[index].nodeName` is required."
					})
					.description("The name of the node to create"),
				endpoint: Joi.string()
					.required()
					.messages({
						"string.empty": "The `endpoints[index].endpoint` is empty. Please provide a valid endpoint.",
						"string.required": "The `endpoints[index].endpoint` is required."
					})
					.description("The endpoint to create nodes for"),
				schema: Joi.string().allow(null).default(null).description("The schema to use for the node")
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
		response_type: Joi.string().default(REQUEST_RESPONSE_TYPE).description("The response type to use"),
		request_timeout: Joi.number().default(REQUEST_TIMEOUT).description("The request timeout to use in milliseconds"),
		request_throttle_interval: Joi.number().default(REQUEST_THROTTLE_INTERVAL).description("The request throttle interval to use in milliseconds"),
		request_debounce_interval: Joi.number().default(REQUEST_DEBOUNCE_INTERVAL).description("The request debounce interval to use in milliseconds"),
		request_concurrency: Joi.number().default(REQUEST_CONCURRENCY).description("The maximum amount of concurrent requests to make at a given time")
	});

/**
 * @description Source and cache nodes from the BigCommerce API
 * @param {Object} actions
 * @param {Object} createNodeId
 * @param {Object} createContentDigest
 * @param {Object} pluginOptions
 * @returns {Promise<void>} Node creation promise
 */
exports.sourceNodes = async ({ actions: { createNode }, cache, createNodeId, createContentDigest }, pluginOptions) => {
	// Prepare plugin options
	const {
		auth: { client_id = null, secret = null, access_token = null, store_hash = null, headers = AUTH_HEADERS },
		endpoints = [],
		preview = false,
		response_type = REQUEST_RESPONSE_TYPE,
		request_timeout = REQUEST_TIMEOUT,
		request_throttle_interval = REQUEST_THROTTLE_INTERVAL,
		request_debounce_interval = REQUEST_DEBOUNCE_INTERVAL,
		request_concurrency = REQUEST_CONCURRENCY
	} = pluginOptions;

	// Prepare node sourcing helpers
	const helpers = {
		createNode,
		createContentDigest,
		createNodeId
	};

	let cachedData = await cache.get(CACHE_KEY);
	let sourceData = null;

	// Create a new BigCommerce instance
	const bigcommerce = new BigCommerce({
		client_id,
		access_token,
		secret,
		store_hash,
		response_type,
		headers: {
			...headers,
			"X-Auth-Client": client_id,
			"X-Auth-Token": access_token,
			"Access-Control-Allow-Headers": ACCESS_CONTROL_ALLOW_HEADERS,
			"Access-Control-Allow-Credentials": ACCESS_CONTROL_ALLOW_CREDENTIALS,
			"Access-Control-Allow-Origin": CORS_ORIGIN
		},
		request_timeout,
		request_throttle_interval,
		request_debounce_interval,
		request_concurrency
	});

	/**
	 * @description Handle node creation
	 * @param {*} sourceData
	 * @returns {Promise<void>} Node creation promise
	 */
	const handleNodeCreation = async (sourceData = null) => {
		sourceData
			?.filter(({ status = null, value: { nodeName = null, endpoint = null } }) => status === "fulfilled" && !isEmpty(nodeName) && !isEmpty(endpoint))
			?.map(async ({ status = null, value: { nodeName = null, data = null, endpoint = null } }) => {
				// Check if the data was retrieved successfully
				if (status === "fulfilled" && !isEmpty(nodeName) && !isEmpty(endpoint) && !isEmpty(data)) {
					const updatedData = handleCamelizeKeys(data);

					// Create nodes from the data
					if ("data" in updatedData && isArrayType(updatedData)) {
						updatedData?.map(async (datum) => {
							await handleCreateNodeFromData(datum, nodeName, helpers, REQUEST_BIGCOMMERCE_API_URL + `/stores/${store_hash + endpoint}`);
						});
					} else if (isArrayType(updatedData)) {
						updatedData?.map(async (datum) => {
							await handleCreateNodeFromData(datum, nodeName, helpers, REQUEST_BIGCOMMERCE_API_URL + `/stores/${store_hash + endpoint}`);
						});
					} else {
						await handleCreateNodeFromData(updatedData, nodeName, helpers, REQUEST_BIGCOMMERCE_API_URL + `/stores/${store_hash + endpoint}`);
					}
				}

				// Resolve the promise
				return;
			}) || null;

		// Cache the data
		await cache.set(CACHE_KEY, sourceData).catch((err) => console.error(`[ERROR] ${err?.message} || ${convertObjectToString(err)} || "An error occurred while caching the data. Please try again later."`));

		// Resolve the promise
		return sourceData;
	};

	if (!isEmpty(cachedData)) {
		// Send log message to console if the cached data is available
		console.warn(`[CACHE] Current cache is available. Proceeding to node creation...`);

		// Create nodes from the cached data
		await handleNodeCreation(cachedData);

		// Resolve the promise
		return cachedData;
	} else {
		// Send log message to console if the cached data is not available
		console.warn(`[CACHE] Current cache is not available. Proceeding to source data...`);

		// Get the endpoints from the BigCommerce site and create nodes
		await Promise.allSettled(
			endpoints?.map(async ({ nodeName = null, endpoint = null }) => {
				const results = await bigcommerce.get({
					url: endpoint,
					headers: {
						...headers,
						"Access-Control-Allow-Credentials": ACCESS_CONTROL_ALLOW_CREDENTIALS
					}
				});

				// Resolve the promise
				return {
					nodeName,
					data: results || null,
					endpoint
				};
			}) || null
		)
			.then(async (res) => {
				// Store the data in the cache
				if (!isEmpty(res)) {
					sourceData = res;
				}

				// Create nodes from the cached data
				await handleNodeCreation(sourceData);

				// Resolve the promise
				return sourceData;
			})
			.catch((err) => {
				// Send log message to console if an error occurred
				console.error(`[GET] ${err?.message || convertObjectToString(err) || "An error occurred. Please try again later."}`);

				// Reject the promise
				return err;
			})
			.finally(async () => {
				// If preview mode is enabled, create a preview node
				if (IS_DEV && preview) {
					if (!preview?.enabled && !isBooleanType(preview?.enabled) && !isStringType(preview.site_url) && isEmpty(preview.site_url)) {
						throw new Error("Incorrect preview settings. Check the `preview` object. It must have `enabled` and `site_url` properties set correctly.");
					}

					console.warn(`[WEBHOOK] Subscribing you to BigCommerce API webhook...`);

					// Make a `POST` request to the BigCommerce API to subscribe to its webhook
					const body = {
						scope: "store/product/updated",
						is_active: true,
						destination: `${preview.site_url}/__BigcommercePreview`
					};

					// Express app to handle the webhook
					const app = express(async (req, res) => {
						const request = await app.json(req);
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

							console.info(`[NODE] Updated node: ${nodeToUpdate.id}`);
						}

						// Send a response back to the BigCommerce API
						res.end("OK");
					});

					await bigcommerce
						.get({
							url: BIGCOMMERCE_WEBHOOK_API_ENDPOINT,
							headers: {
								...headers,
								"Access-Control-Allow-Credentials": ACCESS_CONTROL_ALLOW_CREDENTIALS
							}
						})
						.then(async (res) => {
							if (!isEmpty(res) && "data" in res) {
								console.warn(`[WEBHOOK] BigCommerce API webhook subscription already exists. Skipping subscription...`);
								console.info(`[WEBHOOK] BigCommerce API webhook subscription complete`);
								console.warn(`[PREVIEW] Running preview server...`);
							} else {
								await bigcommerce
									.post({
										url: BIGCOMMERCE_WEBHOOK_API_ENDPOINT,
										body,
										headers: {
											...headers,
											"Access-Control-Allow-Credentials": ACCESS_CONTROL_ALLOW_CREDENTIALS
										}
									})
									.then((res) => {
										if (!isEmpty(res) && "data" in res) {
											console.info(`[WEBHOOK] BigCommerce API webhook subscription created successfully.`);
											console.info(`[PREVIEW] Running preview server...`);
										}
									});
							}

							// Start the preview server
							const server = new http.createServer(app);

							server.listen(8033, console.warn(`[PREVIEW] Now listening to changes for live preview at /__BigcommercePreview`));

							return res;
						})
						.catch((err) => {
							console.error(`[WEBHOOK] ${err?.message || convertObjectToString(err) || "An error occurred while subscribing to BigCommerce via webhook. Please try again later."}`, "\n");

							throw err;
						});
				}

				return;
			});
	}

	console.info(`${APP_NAME} task processing complete!`);

	return;
};

/**
 * @description Create schema customizations
 * @param {Object} actions
 * @returns {void}
 */
exports.createSchemaCustomization = ({ actions: { createTypes } }, pluginOptions) => {
	let typeDefs = ``;

	const { globals: { schema = null } = null, endpoints = [] } = pluginOptions;

	if (!isEmpty(endpoints)) {
		endpoints?.map(({ nodeName = null, schema = null }) => {
			if (!isEmpty(nodeName) && !isEmpty(schema)) {
				typeDefs += `
					${schema}
				`;
			}
		});
	}

	if (!isEmpty(schema)) {
		typeDefs += `
			${schema}
		`;
	}

	if (!isEmpty(typeDefs)) {
		typeDefs = _.trim(typeDefs);

		createTypes(typeDefs);
	}

	return;
};

/**
 * @description Create a dev server for previewing the site when `preview` is enabled
 * @param {Object} app
 * @returns {void}
 */
exports.onCreateDevServer = ({ app }) =>
	app.use(
		"/__BigcommercePreview/",
		createProxyMiddleware({
			target: `http://localhost:4000`,
			secure: false
		})
	);
