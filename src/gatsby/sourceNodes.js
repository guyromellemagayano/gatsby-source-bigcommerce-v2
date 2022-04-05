"use strict";

import { createProxyMiddleware } from "http-proxy-middleware";
import micro from "micro";
import { FG_GREEN, FG_RED, FG_YELLOW, IS_DEV } from "../constants";
import BigCommerce from "../utils/bigcommerce";
import { handleConversionObjectToString } from "../utils/convertValues";

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, configOptions) => {
	const { createNode } = actions;
	const { endpoints = null, clientId = null, secret = null, storeHash = null, accessToken = null, hostname = null, preview = false } = configOptions;

	// Custom variables
	let errMessage = "";

	// Send log message when checking for required options
	console.log(FG_YELLOW, "\nChecking BigCommerce plugin options... ");

	if (endpoints !== null && clientId !== null && secret !== null && storeHash !== null && accessToken !== null) {
		// Init new `BigCommerce` instance
		const BC = new BigCommerce({
			clientId,
			accessToken,
			secret,
			storeHash,
			responseType: "json"
		});

		// Handle fetching and creating nodes for a single or multiple endpoints
		if (endpoints && typeof endpoints === "object" && Object.keys(endpoints).length > 0) {
			// Send log message when fetching data
			console.log(FG_GREEN, "\nValid plugin options found. Proceeding with plugin initialization...");
			console.log(FG_YELLOW, "\nRequesting endpoint data...\n");

			await Promise.all(
				Object.entries(endpoints).map(([nodeName, endpoint]) => {
					return BC.get(endpoint).then((res) => {
						// If the data object is not on the response, it could be `v2` which returns an array as the root, so use that as a fallback
						const resData = "data" in res && Array.isArray(res.data) ? res.data : res;

						// Handle generating nodes
						return "data" in res && Array.isArray(res.data)
							? resData.map((datum) =>
									createNode({
										...datum,
										id: createNodeId(`${datum.id + "-" + nodeName}`),
										bigcommerce_id: datum.id,
										parent: null,
										children: [],
										internal: {
											type: nodeName,
											content: handleConversionObjectToString(datum),
											contentDigest: createContentDigest(datum)
										}
									})
							  )
							: Array.isArray(res)
							? res.map((datum) =>
									createNode({
										...datum,
										id: createNodeId(`${datum.id + "-" + nodeName}`),
										bigcommerce_id: datum.id,
										parent: null,
										children: [],
										internal: {
											type: nodeName,
											content: handleConversionObjectToString(datum),
											contentDigest: createContentDigest(datum)
										}
									})
							  )
							: createNode({
									...resData,
									id: createNodeId(`${resData.id + "-" + nodeName}`),
									parent: null,
									children: [],
									internal: {
										type: nodeName,
										content: handleConversionObjectToString(resData),
										contentDigest: createContentDigest(resData)
									}
							  });
					});
				})
			)
				.then(() => {
					// Send log message when all endpoints have been fetched
					console.log(FG_GREEN, "\nAll endpoint data have been fetched successfully.");
				})
				.catch((err) => {
					// Send log message when an error occurs
					errMessage = new Error(`An error occurred while fetching endpoint data. ${err}`);
				})
				.finally(() =>
					// Send log message when fetching data is complete
					console.log(FG_YELLOW, "\nRequesting endpoint data complete.\n")
				);
		} else {
			errMessage = new Error("The `endpoints` object is required to make any call to the BigCommerce API");
		}

		if (IS_DEV && preview) {
			// Make a `POST` request to the BigCommerce API to subscribe to its webhook
			const webhookEndpoint = "/v3/hooks";
			const body = {
				scope: "store/product/updated",
				is_active: true,
				destination: `${hostname}/__BCPreview`
			};

			BC.post(webhookEndpoint, body).then((res) => {
				if ("data" in res && Array.isArray(res.data)) {
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

							console.log(FG_YELLOW, `\nUpdated node: ${nodeToUpdate.id}`);
						}

						// Send a response back to the BigCommerce API
						res.end("ok");
					});

					server.listen(8033, console.log(FG_YELLOW, `\nNow listening to changes for live preview at route /__BCPreview\n`));
				}
			});
		}
	} else {
		// If `endpoints` is null, throw an error
		if (endpoints == null) {
			errMessage = new Error("The `endpoints` are required to make any call to the BigCommerce API");
		}

		// If `clientId` is null, throw an error
		if (clientId == null) {
			errMessage = new Error("The `clientId` is required to make any call to the BigCommerce API");
		}

		// If `secret` is null, throw an error
		if (secret == null) {
			errMessage = new Error("The `secret` is required to make any call to the BigCommerce API");
		}

		// If `storeHash` is null, throw an error
		if (storeHash == null) {
			errMessage = new Error("The `storeHash` is required to make any call to the BigCommerce API");
		}

		// If `accessToken` is null, throw an error
		if (accessToken == null) {
			errMessage = new Error("The `accessToken` is required to make any call to the BigCommerce API");
		}
	}

	if (errMessage !== "") {
		const exitMessage = "\nPlugin terminated with errors...\n";

		console.error(FG_RED, exitMessage);

		throw errMessage;
	}
};

exports.onCreateDevServer = ({ app }) => {
	app.use(
		"/__BCPreview/",
		createProxyMiddleware({
			target: `http://localhost:8033`,
			secure: false
		})
	);
};
