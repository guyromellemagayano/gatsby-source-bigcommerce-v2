"use strict";

import { FG_RED, REQUEST_BIGCOMMERCE_API_URL } from "../constants";
import Request from "./request";

class BigCommerce {
	constructor(config) {
		if (!config) throw new Error("\n[FAIL] Config missing. The config object is required to make any call to the BigCommerce API");

		this.config = config;
	}

	// Handle creating API request
	async createAPIRequest(endpoint) {
		return await new Request(endpoint, {
			headers: Object.assign(
				{
					"X-Auth-Client": this.config.clientId,
					"X-Auth-Token": this.config.accessToken
				},
				this.config.headers
			),
			responseType: this.config.responseType
		});
	}

	// Handle API requests
	async request(type, path, body = null) {
		// If current `config` have undefined `accessToken`, throw an error
		this.config.accessToken === null ? console.log(FG_RED, "\n[FAIL] The `accessToken` is required to make BigCommerce API requests.") : null;

		// If current `config` have undefined `storeHash`, throw an error
		this.config.storeHash === null ? console.log(FG_RED, "\n[FAIL] The `storeHash` is required to make BigCommerce API requests.") : null;

		// Prepare `path` for request execution
		const request = await this.createAPIRequest(REQUEST_BIGCOMMERCE_API_URL);
		const version = !path.includes("v3") ? path.replace(/(\?|$)/, "" + "$1") : path;

		// Update full path
		let fullPath = `/stores/${this.config.storeHash}`;

		fullPath += version;

		const { data } = await request.run(type, fullPath, body);

		// If response contains pagination.
		if (data && typeof data === "object" && Object.keys(data)?.length > 0) {
			if ("meta" in data) {
				if ("pagination" in data.meta) {
					const { total_pages: totalPages, current_page: currentPage } = data.meta.pagination;

					// If current page is not the last page.
					if (totalPages > currentPage) {
						// Collect all page request promises in array.
						const promises = [];

						for (let nextPage = currentPage + 1; nextPage <= totalPages; nextPage++) {
							const endpointUrl = new URL(fullPath, `https://${request.hostname}`);

							// Safely assign `page` query parameter to endpoint URL.
							endpointUrl.searchParams.set("page", nextPage);

							// Add promise to array for future Promise.allSettled() call.
							promises.push(request.run(type, `${endpointUrl.pathname}${endpointUrl.search}`, data));
						}

						// Request all endpoints in parallel.
						const { status, value } = await Promise.allSettled(promises);

						if (status === "fulfilled") {
							value.forEach((pageResponse) => {
								data.data = data.data.concat(pageResponse.data);
							});

							// Set pager to last page.
							data.meta.pagination.total_pages = totalPages;
							data.meta.pagination.current_page = totalPages;
						}
					}
				}
			}
		}

		// Run request
		return data;
	}

	// Handle `GET` request
	async get(path) {
		return await this.request("get", path);
	}

	// Handle `POST` request
	async post(path, body) {
		return await this.request("post", path, body);
	}
}

export default BigCommerce;
