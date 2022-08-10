"use strict";

import axios from "axios";
import { REQUEST_ACCEPT_HEADER, REQUEST_TIMEOUT } from "../constants";

class Request {
	constructor(hostname, { headers = {}, response_type = "json", log, request_timeout = REQUEST_TIMEOUT } = {}) {
		this.hostname = hostname;
		this.headers = headers;
		this.response_type = response_type;
		this.log = log;
		this.request_timeout = request_timeout;
	}

	// Handle running plugin
	async run(method, path, body) {
		const updatedMethod = method.toLowerCase();

		// Custom `request` instance
		const RequestAxiosInstance = axios.create({
			baseURL: this.hostname,
			headers: this.headers,
			responseType: this.response_type,
			withCredentials: true,
			timeout: this.request_timeout
		});

		// Override default `axios` instance
		axios.defaults.headers.common["Accept"] = REQUEST_ACCEPT_HEADER;

		// Use `axios` interceptors for all HTTP methods (GET, POST, PUT, DELETE, etc.)
		RequestAxiosInstance.interceptors.request.use(
			(config) => {
				this.log.warn(`[${method.toUpperCase()}] ${this.hostname + path}`);

				return config;
			},
			(req) => Promise.resolve(req),
			(err) => {
				if (err.code === "ETIMEDOUT" || err.code === "ECONNRESET") {
					setTimeout(async () => {
						// Send log message when restarting request
						this.log.warn(`(${err.config.status + " " + err.config.statusText}) [${method.toUpperCase()}] ${this.hostname + path} request timed out. Restarting request...`);

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
			(config) => {
				// Send log message when endpoint request is successful
				this.log.info(`(${config.status + " " + config.statusText}) [${method.toUpperCase()}] ${this.hostname + path}`);

				return config;
			},
			(res) => {
				this.log.info(`${res?.length || Object.keys(res)?.length} items found.`);

				return Promise.resolve(res);
			},
			(err) => {
				if (err.code === "ETIMEDOUT" || err.code === "ECONNRESET") {
					setTimeout(async () => {
						// Send log message when restarting request
						this.log.warn(`(${err.config.status + " " + err.config.statusText}) [${method.toUpperCase()}] ${this.hostname + path} request timed out. Restarting request...`);

						// Restart request
						await this.run(method, path, body)
							.then((res) => Promise.resolve(res))
							.catch((err) => Promise.reject(err));
					}, this.request_timeout);
				}

				return Promise.reject(err);
			}
		);

		switch (updatedMethod) {
			case "get": {
				const result = await RequestAxiosInstance.get(path, body)
					.then((res) => Promise.resolve(res))
					.catch((err) => Promise.reject(err));

				return result;
			}
			case "post": {
				const result = await RequestAxiosInstance.post(path, body)
					.then((res) => Promise.resolve(res))
					.catch((err) => Promise.reject(err));

				return result;
			}
			default:
				throw new Error(`The ${updatedMethod} method is currently not supported.`);
		}
	}
}

export default Request;
