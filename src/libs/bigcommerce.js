"use strict";

import { REQUEST_BIGCOMMERCE_API_URL } from "../constants";
import { convertObjectToString } from "../utils/convertValues";
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
		this.reporter = config.reporter;
	}

	// Handle API requests
	async request({ url, method = "", body, headers }) {
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
		const { data } = await request.run({ url: fullPath, method, body, headers, reporter: this.reporter });

		// If response contains pagination, run request again for each page
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
						promises.push(await request.run({ url: `${endpointUrl.pathname}${endpointUrl.search}`, method: "get", body, headers, reporter: this.reporter }));
					}

					// Request all endpoints in parallel.
					await Promise.allSettled(promises)
						.then((res) => {
							res
								?.filter((subItem) => subItem?.status === "fulfilled")
								?.map((subItem) => {
									const subItemData = subItem?.value?.data?.data || null;

									// Update the item object with the subItem data
									data.data = data.data.concat(subItemData);

									// Return the updated item object
									return data.data;
								});
						})
						.catch((err) => {
							this.reporter.error(`[ERROR] ${err?.message || convertObjectToString(err) || "There was an error while fetching and expanding items. Please try again later."}`);
							return Promise.reject(err);
						});

					// Set pager to last page.
					data.meta.pagination.total_pages = totalPages;
					data.meta.pagination.current_page = totalPages;
				}
			}
		}

		// Return data
		return "data" in data ? data.data : data;
	}

	/**
	 * @description Handle `GET` requests
	 * @param {String} url
	 * @param {Object} body
	 * @param {Object} headers
	 * @param {String} endpoint
	 * @returns {Promise} Response promise
	 */
	async get({ url, body, headers }) {
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
	async post({ url, body, headers }) {
		const results = await this.request({ url, method: "post", body, headers });
		return results;
	}
}
