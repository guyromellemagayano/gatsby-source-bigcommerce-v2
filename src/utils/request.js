"use strict";

import axios from "axios";
import { REQUEST_ACCEPT_HEADER, REQUEST_TIMEOUT } from "../constants";
import { logger } from "./logger";

class Request {
	constructor(hostname, { headers = {}, response_type = "json", log_level = "debug", request_timeout = REQUEST_TIMEOUT } = {}) {
		this.hostname = hostname;
		this.headers = headers;
		this.response_type = response_type;
		this.log_level = log_level;
		this.request_timeout = request_timeout;
	}

	// Handle running plugin
	async run(method, path, body) {
		// Custom `axios` instance
		const RequestAxiosInstance = axios.create({
			baseURL: this.hostname,
			headers: this.headers,
			responseType: this.response_type,
			withCredentials: true,
			timeout: this.request_timeout
		});

		// Override default `axios` instance
		axios.defaults.headers.common["Accept"] = REQUEST_ACCEPT_HEADER;
		axios.defaults.headers.common["Content-Type"] = REQUEST_ACCEPT_HEADER;

		// Use `axios` interceptors for all HTTP methods (GET, POST, PUT, DELETE, etc.)
		RequestAxiosInstance.interceptors.request.use(
			(req) => Promise.resolve(req),
			(err) => {
				if (err.code === "ETIMEDOUT") {
					setTimeout(async () => {
						// Send log message when restarting request
						logger.warn(`Restarting request...`);

						// Send log message when restarting request
						logger.info(`[${method.toUpperCase()}] ${this.hostname + path}`);

						// Restart request
						await this.run(method, path, body)
							.then((res) => Promise.resolve(res))
							.catch((err) => Promise.reject(err));
					}, this.request_timeout);
				}

				return Promise.reject(err);
			}
		);

		// Use `axios` interceptors for all HTTP methods (GET, POST, PUT, DELETE, etc.)
		RequestAxiosInstance.interceptors.response.use(
			(res) => Promise.resolve(res),
			(err) => Promise.reject(err)
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
