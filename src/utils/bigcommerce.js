/* eslint-disable prettier/prettier */
"use strict";

import { REQUEST_BIGCOMMERCE_API_URL } from "../constants";
import Request from "./request";

class BigCommerce {
	constructor(config) {
		if (!config) {
			throw new Error("BigCommerce API config required. It is required to make any call to the BigCommerce API");
		}

		this.client_id = config.client_id;
		this.access_token = config.access_token;
		this.secret = config.secret;
		this.store_hash = config.store_hash;
		this.response_type = config.response_type;
		this.headers = config.headers;
		this.log_level = config.log_level;
	}

	// Handle API requests
	async request(method, path, body = null) {
		// Prepare `path` for request execution
		const request = new Request(REQUEST_BIGCOMMERCE_API_URL, {
			headers: Object.assign(
				{
					"X-Auth-Client": this.client_id,
					"X-Auth-Token": this.access_token
				},
				this.headers
			),
			response_type: this.response_type,
			log_level: this.log_level
		});

		const version = !path.includes("v3") ? path.replace(/(\?|$)/, "" + "$1") : path;

		// Update full path
		let fullPath = `/stores/${this.store_hash}`;

		fullPath += version;

		// Run request
		const { data } = await request.run(method, fullPath, body);

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
							promises.push(request.run(method, `${endpointUrl.pathname}${endpointUrl.search}`, body));
						}

						// Request all endpoints in parallel.
						const responses = await Promise.allSettled(promises);

						responses.forEach(({ status, value }) => {
							if (status === "fulfilled") {
								data.data = data.data.concat(value.data.data);
							}
						});
						data.meta.pagination.total_pages = totalPages;
						data.meta.pagination.current_page = totalPages;
					}
				}
			}
		}

		// Return data
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
