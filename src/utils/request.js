"use strict";

import axios from "axios";
import http from "http";
import https from "https";
import { FG_BLUE, FG_GREEN, FG_RED, FG_YELLOW } from "../constants";
import { handleConversionStringToLowercase } from "./convertValues";

class Request {
	constructor(hostname = null, { headers = {} } = {}) {
		hostname === null && headers === null
			? () => {
					throw new Error("\nThe hostname and headers are required to make the call to the server.");
			  }
			: null;

		this.hostname = hostname;
		this.headers = headers;
	}

	// Handle running plugin
	async run(method, path, body) {
		const sanitizedMethod = handleConversionStringToLowercase(method);
		const sanitizedPath = handleConversionStringToLowercase(path);
		const sanitizedBody = handleConversionStringToLowercase(body);

		// Custom `axios` instance
		const AppAxiosInstance = axios.create({
			baseURL: this.hostname,
			headers: this.headers,
			withCredentials: true,
			httpAgent: new http.Agent({ keepAlive: true }),
			httpsAgent: new https.Agent({ keepAlive: true }),
			timeout: 30000
		});

		// Override default `axios` instance
		axios.defaults.headers.common["Accept"] = "application/json";
		axios.defaults.headers.common["Content-Type"] = "application/json";

		// Use `axios` interceptors for all HTTP methods (GET, POST, PUT, DELETE, etc.)
		AppAxiosInstance.interceptors.request.use(
			(req) => Promise.resolve(req),
			(err) => Promise.reject(err)
		);

		// Use `axios` interceptors for all HTTP methods (GET, POST, PUT, DELETE, etc.)
		AppAxiosInstance.interceptors.response.use(
			(res) => {
				console.log(FG_GREEN, `\n[${sanitizedMethod.toUpperCase()}] ${this.hostname}${sanitizedPath} ${res.status}`);

				return Promise.resolve(res);
			},
			(err) => {
				if (err.response) {
					console.log(FG_RED, `\n[${sanitizedMethod.toUpperCase()}] ${this.hostname}${sanitizedPath} ${err.response.status}`);

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
											console.log(
												FG_BLUE,
												`\n[DEBUG] ${this.hostname}${sanitizedPath} - ${xRateLimitRequestsLeft} requests left. - ${xRateLimitRequestsQuota} requests quota. - ${xRateLimitTimeResetMs} ms until reset. - ${xRateLimitTimeWindowMs} ms time window.`
											);
										}

										return setTimeout(() => {
											// Send log message when restarting request
											console.log(FG_YELLOW, "\n[IN PROGRESS] Restarting request...");

											// Send log message when restarting request
											console.log(FG_BLUE, `\n[${sanitizedMethod.toUpperCase()}] ${this.hostname + sanitizedPath}`);

											// Restart request
											this.run(sanitizedMethod, sanitizedMethod, sanitizedBody).then(Promise.resolve).catch(Promise.reject);
										}, xRateLimitTimeResetMs);
								  })()
								: Promise.reject(err);
						default:
							return Promise.reject(err);
					}
				} else {
					console.log(FG_RED, `\n[${sanitizedMethod.toUpperCase()}] ${this.hostname + sanitizedPath} ${err.message}`);

					return Promise.reject(err);
				}
			}
		);

		switch (sanitizedMethod) {
			case "get":
				return await AppAxiosInstance.get(sanitizedPath)
					.then((res) => Promise.resolve(res))
					.catch((err) => Promise.reject(err));
			case "post":
				return await AppAxiosInstance.post(sanitizedPath, sanitizedBody)
					.then((res) => Promise.resolve(res))
					.catch((err) => Promise.reject(err));
			default:
				throw new Error(`The method ${sanitizedMethod} is not supported.`);
		}
	}
}

export default Request;
