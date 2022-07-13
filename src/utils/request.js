"use strict";

import axios from "axios";
import { REQUEST_ACCEPT_HEADER, REQUEST_TIMEOUT } from "../constants";
import { logger } from "./logger";

class Request {
	constructor(hostname, { headers = {}, response_type = "json", log_level = "debug" } = {}) {
		this.hostname = hostname;
		this.headers = headers;
		this.response_type = response_type;
		this.log_level = log_level;
	}

	// Handle running plugin
	async run(method, path, body) {
		// Custom `axios` instance
		const RequestAxiosInstance = axios.create({
			baseURL: this.hostname,
			headers: this.headers,
			responseType: this.response_type,
			withCredentials: true,
			timeout: REQUEST_TIMEOUT
		});

		// Override default `axios` instance
		axios.defaults.headers.common["Accept"] = REQUEST_ACCEPT_HEADER;
		axios.defaults.headers.common["Content-Type"] = REQUEST_ACCEPT_HEADER;

		// Use `axios` interceptors for all HTTP methods (GET, POST, PUT, DELETE, etc.)
		RequestAxiosInstance.interceptors.request.use(
			(req) => Promise.resolve(req),
			(err) => Promise.reject(err)
		);

		// Use `axios` interceptors for all HTTP methods (GET, POST, PUT, DELETE, etc.)
		RequestAxiosInstance.interceptors.response.use(
			(res) => Promise.resolve(res),
			(err) => {
				if (err.response) {
					logger.error(`[${method.toUpperCase()}] ${this.hostname}${path} ${err.response.status}`);

					const errResponseStatusRound = Math.round(err.response.status / 100);

					switch (errResponseStatusRound) {
						case 4:
							return err.response.status === 429
								? (() => {
										const xRateLimitRequestsLeft = err.response.headers["x-rate-limit-requests-left"] ?? null;
										const xRateLimitRequestsQuota = err.response.headers["x-rate-limit-requests-quota"] ?? null;
										const xRateLimitTimeResetMs = err.response.headers["x-rate-limit-time-reset-ms"] ?? null;
										const xRateLimitTimeWindowMs = err.response.headers["x-rate-limit-time-window-ms"] ?? null;

										if (xRateLimitRequestsLeft && xRateLimitRequestsQuota && xRateLimitTimeResetMs && xRateLimitTimeWindowMs) {
											logger.debug(`${this.hostname}${path} - ${xRateLimitRequestsLeft} requests left. - ${xRateLimitRequestsQuota} requests quota. - ${xRateLimitTimeResetMs} ms until reset. - ${xRateLimitTimeWindowMs} ms time window.`);
										}

										return setTimeout(() => {
											// Send log message when restarting request
											if (this.log_level === "debug" || this.log_level === "error" || this.log_level === "warn") {
												logger.warn(`Restarting request...`);
											}

											// Send log message when restarting request
											logger.debug(`[${method.toUpperCase()}] ${this.hostname + path}`);

											// Restart request
											this.run(method, method, body).then(Promise.resolve).catch(Promise.reject);
										}, xRateLimitTimeResetMs);
								  })()
								: Promise.reject(err);
						default:
							return Promise.reject(err);
					}
				} else {
					logger.error(`[${method.toUpperCase()}] ${this.hostname + path} ${err.message}`);

					return Promise.reject(err);
				}
			}
		);

		switch (method) {
			case "get":
				return await RequestAxiosInstance.get(path)
					.then((res) => Promise.resolve(res))
					.catch((err) => Promise.reject(err));
			case "post":
				return await RequestAxiosInstance.post(path, body)
					.then((res) => Promise.resolve(res))
					.catch((err) => Promise.reject(err));
			default:
				throw new Error(`The method ${method} is not supported.`);
		}
	}
}

export default Request;
