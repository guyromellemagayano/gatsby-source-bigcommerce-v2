"use strict";

import sleep from "then-sleep";
import { REQUEST_BIGCOMMERCE_API_URL } from "../constants";
import Request from "./request";

class BigCommerce {
	constructor(config) {
		if (!config) {
			throw new Error("BigCommerce API config required. It is required to make any call to the API");
		}

		this.secret = config.secret;
		this.store_hash = config.store_hash;
		this.response_type = config.response_type;
		this.headers = config.headers;
		this.log = config.log;
		this.request_timeout = config.request_timeout;
	}

	// Handle API requests
	async request(method, path, body = null, headers = {}) {
		await sleep(this.request_timeout);

		// Prepare `path` for request execution
		const request = new Request(REQUEST_BIGCOMMERCE_API_URL, {
			headers: Object.assign(this.headers, headers),
			response_type: this.response_type,
			log: this.log,
			request_timeout: this.request_timeout
		});

		// Update full path
		let fullPath = `/stores/${this.store_hash + path}`;
		let endpointUrl = new URL(fullPath, REQUEST_BIGCOMMERCE_API_URL);

		// Run request
		const { data } = await request.run(method, fullPath, body);

		// If response contains pagination, run request again for each page
		if (data && typeof data === "object" && Object.keys(data)?.length > 0) {
			if ("meta" in data) {
				if ("pagination" in data.meta) {
					const { total_pages: totalPages, current_page: currentPage } = data.meta.pagination;

					// If current page is not the last page.
					if (totalPages > currentPage) {
						// Collect all page request promises in array.
						const promises = [];

						for (let nextPage = currentPage + 1; nextPage <= totalPages; nextPage++) {
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

						// Set pager to last page.
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
	async get(path, headers = {}) {
		await sleep(this.request_timeout);

		const response = await this.request("get", path, headers);
		return response;
	}

	// Handle `POST` request
	async post(path, body, headers = {}) {
		await sleep(this.request_timeout);

		const response = await this.request("post", path, body, headers);
		return response;
	}
}

export default BigCommerce;
