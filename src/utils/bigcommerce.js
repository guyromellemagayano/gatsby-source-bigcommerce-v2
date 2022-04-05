"use strict";

import crypto from "crypto";
import { FG_BLUE, FG_GREEN, FG_RED, REQUEST_BIGCOMMERCE_API_URL, REQUEST_BIGCOMMERCE_LOGIN_URL } from "../constants";
import { handleConversionStringToObject } from "./convertValues";
import Request from "./request";

class BigCommerce {
	constructor(config) {
		if (!config) {
			const errMessage = new Error("Config missing. The config object is required to make any call to the " + "BigCommerce API");

			throw errMessage;
		}

		this.config = config;
		this.grantType = "authorization_code";
	}

	// Handle creating API request
	createAPIRequest(endpoint) {
		const acceptHeader = this.config.responseType === "xml" ? "application/xml" : "application/json";

		return new Request(endpoint, {
			headers: Object.assign({
				"Accept": acceptHeader,
				"X-Auth-Client": this.config.clientId,
				"X-Auth-Token": this.config.accessToken
			}),
			failOnLimitReached: this.config.failOnLimitReached,
			agent: this.config.agent
		});
	}

	// Handle verfiy signed request
	async verify(signedRequest) {
		// If `signedRequest` is "undefined", throw an error
		!signedRequest ? console.error(FG_RED, "The signed request is required to verify the call.") : null;

		const splitRequest = signedRequest.split(".");

		// If `splitRequest` length is less than 2, throw an error
		splitRequest.length < 2 ? console.error(FG_RED, "The signed request will come in two parts seperated by a .(full stop). " + "this signed request contains less than 2 parts.") : null;

		// Check and verify validity of signatures
		const signature = Buffer.from(splitRequest[1], "base64").toString("utf8");
		const json = Buffer.from(splitRequest[0], "base64").toString("utf8");
		const data = handleConversionStringToObject(json);
		const expected = crypto.createHmac("sha256", this.config.secret).update(json).digest("hex");

		console.log(FG_BLUE, "\nJSON: " + json);
		console.log(FG_BLUE, "\nSIGNATURE: " + signature);
		console.log(FG_BLUE, "\nEXPECTED SIGNATURE: " + expected);

		// If the expected length of signature doesn't match the current signature length, throw an error, otherwise return data
		expected.length !== signature.length || crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8")) ? console.error(FG_RED, "The signature is invalid.") : null;

		// Send log message when signature is valid
		console.log(FG_GREEN, "The signature is valid.");

		return data;
	}

	// Handle authentication request
	async authorize(query) {
		// if `query` is undefined, throw an error
		!query ? console.error(FG_RED, "The URL query paramaters are required.") : null;

		// Query props
		const { code, scope, context } = await query;
		const queryCode = code ?? null;
		const queryScope = scope ?? null;
		const queryContext = context ?? null;

		// Init payload
		const payload = {
			client_id: this.config.clientId,
			client_secret: this.config.secret,
			grant_type: this.grantType,
			code: queryCode,
			scope: queryScope,
			context: queryContext
		};

		// Run request
		const request = this.createAPIRequest(REQUEST_BIGCOMMERCE_LOGIN_URL);
		const oauthToken = "/oauth2/token";

		return await request.run("post", oauthToken, payload);
	}

	// Handle API requests
	async request(type, path, data = null) {
		// If current `config` have undefined `accessToken`, throw an error
		this.config.accessToken == null ? console.error(FG_RED, "The access token is required to make BigCommerce API requests.") : null;

		// If current `config` have undefined `storeHash`, throw an error
		this.config.storeHash == null ? console.error(FG_RED, "The store hash is required to make BigCommerce API requests.") : null;

		// Prepare `path` for request execution
		const extension = this.config.responseType === "xml" ? ".xml" : "";
		const request = this.createAPIRequest(REQUEST_BIGCOMMERCE_API_URL);
		const version = !path.includes("v3") ? path.replace(/(\?|$)/, extension + "$1") : path;

		// Update full path
		let fullPath = `/stores/${this.config.storeHash}`;

		fullPath += version;

		const response = await request.run(type, fullPath, data);

		// If response contains pagination.
		if ("meta" in response && "pagination" in response.meta) {
			const { total_pages: totalPages, current_page: currentPage } = response.meta.pagination;

			// If current page is not the last page.
			if (totalPages > currentPage) {
				// Collect all page request promises in array.
				const promises = [];

				for (let nextPage = currentPage + 1; nextPage <= totalPages; nextPage++) {
					const endpointUrl = new URL(fullPath, `https://${request.hostname}`);

					// Safely assign `page` query parameter to endpoint URL.
					endpointUrl.searchParams.set("page", nextPage);

					// Add promise to array for future Promise.All() call.
					promises.push(request.run(type, `${endpointUrl.pathname}${endpointUrl.search}`, data));
				}

				// Request all endpoints in parallel.
				const responses = await Promise.all(promises);

				responses.forEach((pageResponse) => {
					response.data = response.data.concat(pageResponse.data);
				});

				// Set pager to last page.
				response.meta.pagination.total_pages = totalPages;
				response.meta.pagination.current_page = totalPages;
			}
		}

		// Run request
		return response;
	}

	// Handle `GET` request
	async get(path) {
		return await this.request("get", path);
	}

	// Handle `POST` request
	async post(path, data) {
		return await this.request("post", path, data);
	}

	// Handle `PUT` request
	async put(path, data) {
		return await this.request("put", path, data);
	}

	// Handle `DELETE` request
	async delete(path) {
		return await this.request("delete", path);
	}
}

export default BigCommerce;
