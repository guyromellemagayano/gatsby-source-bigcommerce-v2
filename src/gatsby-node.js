"use strict";

import { randomUUID } from "crypto";
import _ from "lodash";
import {
	ACCESS_CONTROL_ALLOW_CREDENTIALS,
	ACCESS_CONTROL_ALLOW_HEADERS,
	APP_NAME,
	AUTH_HEADERS,
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
import { convertObjectToString } from "./utils/convertValues";
import { getURLPathname } from "./utils/parseURL";
import { isArrayType, isEmpty } from "./utils/typeCheck";

/**
 * @description Create a node from the data
 * @param {Object} item
 * @param {string} nodeType
 * @param {Object} helpers
 * @param {string} endpoint
 * @returns {Promise<void>} Node creation promise
 */
const handleCreateNodeFromData = async (item, nodeType, helpers, endpoint, reporter) => {
	const { createNode, createNodeId, createContentDigest } = helpers;

	// Add bigcommerce_id to the node
	if (!isEmpty(item?.id)) {
		item.bigcommerce_id = item.id;
	}

	if (!isEmpty(nodeType)) {
		const stringifiedItem = !isEmpty(item) ? convertObjectToString(item) : "";
		const uuid = randomUUID();

		const nodeMetadata = {
			id: createNodeId(`${uuid}-${nodeType}-${getURLPathname(endpoint)}`),
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
				reporter.info(`[NODE] ${node?.internal?.contentDigest} - ${nodeType} - (OK)`);
				return Promise.resolve();
			})
			.catch((err) => {
				reporter.error(`[ERROR] ${err?.message || convertObjectToString(err) || "An error occurred. Please try again later."}`);
				return err;
			});
	}
};

/**
 * @description Verify if plugin loaded correctly
 * @returns {void}
 */
exports.onPreBootstrap = ({ reporter }) => reporter.info(`${APP_NAME} loaded successfully! 🎉`);

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
		response_type: Joi.string().default(REQUEST_RESPONSE_TYPE).description("The response type to use"),
		request_timeout: Joi.number().default(REQUEST_TIMEOUT).description("The request timeout to use in milliseconds"),
		request_throttle_interval: Joi.number().default(REQUEST_THROTTLE_INTERVAL).description("The request throttle interval to use in milliseconds"),
		request_debounce_interval: Joi.number().default(REQUEST_DEBOUNCE_INTERVAL).description("The request debounce interval to use in milliseconds"),
		request_concurrency: Joi.number().default(REQUEST_CONCURRENCY).description("The maximum amount of concurrent requests to make at a given time")
	});

/**
 * @description Source and cache nodes from the BigCommerce API
 * @param {Object} actions
 * @param {Object} reporter
 * @param {Object} createNodeId
 * @param {Object} createContentDigest
 * @param {Object} pluginOptions
 * @returns {Promise<void>} Node creation promise
 */
exports.sourceNodes = async ({ actions: { createNode }, reporter, cache, createNodeId, createContentDigest }, pluginOptions) => {
	// Prepare plugin options
	const {
		auth: { client_id = null, secret = null, access_token = null, store_hash = null, headers = AUTH_HEADERS },
		endpoints = [],
		response_type = REQUEST_RESPONSE_TYPE,
		request_timeout = REQUEST_TIMEOUT,
		request_throttle_interval = REQUEST_THROTTLE_INTERVAL,
		request_debounce_interval = REQUEST_DEBOUNCE_INTERVAL,
		request_concurrency = REQUEST_CONCURRENCY
	} = pluginOptions;

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
		request_concurrency,
		reporter
	});

	// Action helpers
	const helpers = {
		createNode,
		createContentDigest,
		createNodeId
	};

	/**
	 * @description Handle node creation
	 * @param {*} sourceData
	 * @returns {Promise<void>} Node creation promise
	 */
	const handleNodeCreation = async (node, reporter, helpers) => {
		try {
			// Create nodes from the data
			if (!isEmpty(node.data)) {
				if (isArrayType(node.data)) {
					node.data?.map(async (datum) => {
						await handleCreateNodeFromData(datum, node.nodeName, helpers, REQUEST_BIGCOMMERCE_API_URL + `/stores/${store_hash + node.endpoint}`, reporter);

						return Promise.resolve(datum);
					});
				} else {
					await handleCreateNodeFromData(node.data, node.nodeName, helpers, REQUEST_BIGCOMMERCE_API_URL + `/stores/${store_hash + node.endpoint}`, reporter);

					return Promise.resolve(node.data);
				}
			}
		} catch (err) {
			reporter.error(`[ERROR] ${err?.message || convertObjectToString(err) || "An error occurred while creating nodes. Please try again later."}`);
			return err;
		}
	};

	// Check if the plugin stored the data in the cache
	const cachedData = await cache.get(CACHE_KEY);
	let sourceData = null;

	if (!isEmpty(cachedData)) {
		// Send log message to reporter if the cached data is available
		reporter.warn(`[CACHE] Cached data found. Proceeding to node creation...`);

		// Create nodes from the cached data
		cachedData
			?.filter((item) => item?.status === "fulfilled")
			?.map(async (item) => {
				const items = {
					nodeName: item.value.nodeName,
					data: item?.value?.data?.data || item?.value?.data || null,
					endpoint: item.value.endpoint
				};

				await handleNodeCreation(items, reporter, helpers);
			});
	} else {
		const promises = [];

		// Send log message to console if the cached data is not available
		reporter.warn(`[CACHE] No cached data found. Proceeding to data sourcing...`);

		// Convert above code using for loop
		for (let i = 0; i < endpoints.length; i++) {
			const { nodeName = null, endpoint = null } = endpoints[i];

			promises.push(
				await bigcommerce
					.get({
						url: endpoint,
						headers: {
							...headers,
							"Access-Control-Allow-Credentials": ACCESS_CONTROL_ALLOW_CREDENTIALS
						}
					})
					.then((res) => {
						// Resolve the promise
						return {
							nodeName,
							data: res || null,
							endpoint
						};
					})
			);
		}

		// Get the endpoints from the BigCommerce site and create nodes
		await Promise.allSettled(promises)
			.then(async (res) => {
				// Store the data in the cache
				if (!isEmpty(res)) {
					sourceData = res;

					// Create nodes from the cached data
					sourceData
						?.filter((item) => item?.status === "fulfilled")
						?.map(async (item) => {
							const items = {
								nodeName: item.value.nodeName,
								data: item?.value?.data?.data || item?.value?.data || null,
								endpoint: item.value.endpoint
							};

							await handleNodeCreation(items, reporter, helpers);
						});

					// Cache the data when the data is available and the environment is development
					if (!isEmpty(sourceData) && IS_DEV) {
						await cache
							.set(CACHE_KEY, sourceData)
							.then(() => reporter.info(`[CACHE] Cached ${sourceData.length} items successfully.`))
							.catch((err) => reporter.error(`[ERROR] ${err?.message || convertObjectToString(err) || "There was an error while caching the data. Please try again later."}`));
					}
				}
			})
			.catch((err) => {
				this.reporter.error(`[ERROR] ${err?.message || convertObjectToString(err) || "There was an error while fetching and expanding the endpoints. Please try again later."}`);
				return err;
			});
	}
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
 * @description Verify if plugin ended successfully
 * @returns {void}
 */
exports.onPostBootstrap = ({ reporter }) => reporter.info(`${APP_NAME} tasks complete! 🎉`);
