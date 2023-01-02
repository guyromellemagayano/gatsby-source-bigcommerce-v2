"use strict";

import { REQUEST_BIGCOMMERCE_API_URL } from "../constants";
import { isEmpty, isObjectType } from "../utils/typeCheck";
import { Request } from "./request";

export class BigCommerce {
	constructor(config) {
		if (!config) {
			throw new Error("BigCommerce API config required. It is required to make any call to the API");
		}

		this.client_id = config.client_id;
		this.secret = config.secret;
		this.store_hash = config.store_hash;
		this.response_type = config.response_type;
		this.headers = config.headers;
		this.request_timeout = config.request_timeout;
		this.request_throttle_interval = config.request_throttle_interval;
		this.request_debounce_interval = config.request_debounce_interval;
		this.request_concurrency = config.request_concurrency;
		this.request_max_count = config.request_max_count;
	}

	// Handle API requests
	async request({ url = null, method = "", body = null, headers = null }) {
		// Update full path
		let fullPath = `/stores/${this.store_hash + url}`;
		let endpointUrl = new URL(fullPath, REQUEST_BIGCOMMERCE_API_URL);

		// Prepare `url` for request execution
		const request = new Request(REQUEST_BIGCOMMERCE_API_URL, {
			headers: {
				...this.headers,
				...headers
			},
			response_type: this.response_type,
			request_timeout: this.request_timeout,
			request_throttle_interval: this.request_throttle_interval,
			request_debounce_interval: this.request_debounce_interval,
			request_max_count: this.request_max_count,
			request_concurrency: this.request_concurrency
		});

		// Run request
		const { data } = await request.run({ url: fullPath, method, body, headers });

		// If response contains pagination, run request again for each page
		if (!isEmpty(data) && isObjectType(data)) {
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
							promises.push(request.run({ url: `${endpointUrl.pathname}${endpointUrl.search}`, method, body, headers }));
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

	/**
	 * @description Handle `GET` requests
	 * @param {String} url
	 * @param {Object} body
	 * @param {Object} headers
	 * @returns {Promise} Response promise
	 */
	async get({ url = null, body = null, headers = null }) {
		const results = await this.request({ url, method: "get", body, headers });

		return results;
	}

	/**
	 * @description Handle `POST` requests
	 * @param {String} url
	 * @param {Object} body
	 * @param {Object} headers
	 * @returns {Promise} Response promise
	 */
	async post({ url = null, body = null, headers = null }) {
		const results = await this.request({ url, method: "post", body, headers });

		return results;
	}
}
