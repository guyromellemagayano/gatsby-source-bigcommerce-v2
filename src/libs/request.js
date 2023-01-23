"use strict";

import axios from "axios";
import * as https from "https";
import { AUTH_HEADERS, REQUEST_BIGCOMMERCE_API_URL, REQUEST_CONCURRENCY, REQUEST_DEBOUNCE_INTERVAL, REQUEST_PENDING_COUNT, REQUEST_RESPONSE_TYPE, REQUEST_THROTTLE_INTERVAL, REQUEST_TIMEOUT } from "../constants";
import { convertObjectToString, convertStringToLowercase, convertStringToUppercase } from "../utils/convertValues";
import { debounce } from "../utils/debounce";
import { throttle } from "../utils/throttle";

export class Request {
	constructor(
		hostname,
		{
			headers = AUTH_HEADERS,
			response_type = REQUEST_RESPONSE_TYPE,
			request_timeout = REQUEST_TIMEOUT,
			request_throttle_interval = REQUEST_THROTTLE_INTERVAL,
			request_debounce_interval = REQUEST_DEBOUNCE_INTERVAL,
			request_concurrency = REQUEST_CONCURRENCY
		} = {}
	) {
		this.hostname = hostname;
		this.response_type = response_type;
		this.headers = headers;
		this.pending_requests = REQUEST_PENDING_COUNT;
		this.request_timeout = request_timeout;
		this.request_throttle_interval = request_throttle_interval;
		this.request_debounce_interval = request_debounce_interval;
		this.request_concurrency = request_concurrency;
	}

	/**
	 * @description Handle running API requests
	 * @param {String} url
	 * @param {String} method
	 * @param {Object} body
	 * @param {Object} headers
	 */
	async run({ url = null, method = null, body = null, headers = null, reporter }) {
		const updatedMethod = convertStringToLowercase(method);

		let config = {
			baseURL: this.hostname,
			headers: {
				...this.headers,
				...headers
			},
			responseType: this.response_type,
			timeout: this.request_timeout,
			httpsAgent: new https.Agent({ keepAlive: true })
		};

		// Custom `request` instance
		const RequestAxiosInstance = axios.create(config);

		// Use `axios` interceptors for all HTTP methods (GET, POST, PUT, DELETE, etc.)
		RequestAxiosInstance.interceptors.request.use((config) => {
			// Debounce requests to avoid rate limiting
			let debounceInterval = debounce(() => this.pending_requests--, this.request_debounce_interval);

			// Throttle requests to avoid rate limiting
			let throttleInterval = throttle(() => {
				clearInterval(throttleInterval);
				debounceInterval();

				return config;
			}, this.request_throttle_interval);

			if (this.pending_requests <= this.request_concurrency) {
				// Wait for all throttle to clear
				throttleInterval();
			}

			if (this.pending_requests > this.request_concurrency) {
				// Return null if there are too many pending requests
				reporter.warn(`[${convertStringToUppercase(method)}] ${REQUEST_BIGCOMMERCE_API_URL + url} - (THROTTLED) (${this.pending_requests} pending ${this.pending_requests > 1 ? "requests" : "request"})`);
			}

			// Increment pending requests
			this.pending_requests++;

			return config;
		}),
			(res) => {
				// Send info message to console if request is successful
				reporter.info(`[${convertStringToUppercase(method)}] ${REQUEST_BIGCOMMERCE_API_URL + url} - (${res?.status} ${res?.statusText})`);

				// Return response
				return res;
			},
			(err) => {
				// Send error message to console if request fails
				reporter.error(`[${convertStringToUppercase(method)}] ${REQUEST_BIGCOMMERCE_API_URL + url} - (ERROR)`);
				reporter.error("\n", `${err?.message || convertObjectToString(err) || "An error occurred. Please try again later."}`, "\n");

				// Return error message
				return err;
			};

		// Use `axios` interceptors for all HTTP methods (GET, POST, PUT, DELETE, etc.)
		RequestAxiosInstance.interceptors.response.use((res) => {
			// Decrement pending requests
			this.pending_requests = Math.max(0, this.pending_requests > 0 ? this.pending_requests - 1 : 0);

			// Send info message to console if request is successful
			reporter.info(
				`[${convertStringToUppercase(method)}] ${REQUEST_BIGCOMMERCE_API_URL + url} - (${res?.status} ${res?.statusText}) - (${this.pending_requests} pending ${
					this.pending_requests > 1 || this.pending_requests === 0 ? "requests" : "request"
				})`
			);

			// Return response
			return res;
		}),
			(err) => {
				if (err.response) {
					// Decrement pending requests
					this.pending_requests = Math.max(0, this.pending_requests > 0 ? this.pending_requests - 1 : 0);

					// Send log message when error response is received
					reporter.error(`[${convertStringToUppercase(method)}] ${REQUEST_BIGCOMMERCE_API_URL + url} - (${err.response.status} ${err.response.statusText})`);
					reporter.error("\n", `${err?.message || convertObjectToString(err) || "An error occurred. Please try again later."}`, "\n");
				} else if (err.request) {
					// Decrement pending requests
					this.pending_requests = Math.max(0, this.pending_requests > 0 ? this.pending_requests - 1 : 0);

					// Send log message when error request is received
					reporter.error(`[${convertStringToUppercase(method)}] ${REQUEST_BIGCOMMERCE_API_URL + url} - (${err.request.status} ${err.request.statusText})`);
					reporter.error("\n", `${err?.message || convertObjectToString(err) || "An error occurred. Please try again later."}`, "\n");
				} else {
					// Send log message when error is thrown
					reporter.error(`[${convertStringToUppercase(method)}] ${REQUEST_BIGCOMMERCE_API_URL + url} - (ERROR)`);
					reporter.error("\n", `${err?.message || convertObjectToString(err) || "An error occurred. Please try again later."}`, "\n");
				}

				// Return error message
				return err;
			};

		switch (updatedMethod) {
			case "get": {
				const results = await RequestAxiosInstance.get(url, body)
					.then((res) => res)
					.catch((err) => err);

				return results;
			}
			case "post": {
				const results = await RequestAxiosInstance.post(url, body)
					.then((res) => res)
					.catch((err) => err);

				return results;
			}
			default:
				throw new Error(`The ${updatedMethod} method is currently not supported.`);
		}
	}
}
