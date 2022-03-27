import https from "https";
import zlib from "zlib";
import { FG_BLUE, FG_CYAN, FG_GREEN, FG_RED, FG_WHITE, FG_YELLOW, HTTPS_PROTOCOL } from "../constants";
import { handleConversionObjectToString, handleConversionStringToObject, handleConversionStringToUppercase } from "./convertValues";

// Handle parsing the response from the BigCommerce API
function handleBodyResponse(res, body, resolve, reject) {
	try {
		if (!/application\/json/.test(res.headers["content-type"]) || body.trim() === "") {
			console.error(FG_RED, "\nThe response body from the BigCommerce API is not in JSON format.");

			return resolve(body);
		}

		// Convert string to object
		const JSONObject = handleConversionStringToObject(body);

		// Check for errors in the body response, if there is found, reject the promise
		const JSONError = JSONObject?.error ?? null;
		const JSONErrors = JSONObject?.errors ?? null;

		if (JSONError !== null || JSONErrors !== null) {
			const err = new Error(JSONError || handleConversionObjectToString(JSONErrors));

			return reject(err);
		}

		// Return the body response as a JSON object
		return resolve(JSONObject);
	} catch (err) {
		err.responseBody = body;

		return reject(err);
	}
}
class Request {
	constructor(hostname = null, { headers = {}, failOnLimitReached = false, agent = null } = {}) {
		hostname == null && headers == null
			? (() => {
					const errMessage = new Error("The hostname and headers are required to make the call to the server.");

					throw errMessage;
			  })()
			: null;

		this.hostname = hostname;
		this.headers = headers;
		this.failOnLimitReached = failOnLimitReached;
		this.agent = agent;
		this.protocol = "https:";
	}

	// Handle running plugin
	run(method, path, data = null) {
		const dataString = data !== null ? handleConversionObjectToString(data) : null;

		const options = {
			path,
			protocol: this.protocol,
			hostname: this.hostname,
			port: 443,
			method: handleConversionStringToUppercase(method),
			gzip: true,
			headers: Object.assign(
				{
					"Content-Type": "application/json"
				},
				this.headers
			)
		};

		if (this.agent !== null) {
			options.agent = this.agent;
		}

		if (dataString !== null) {
			options.headers["Content-Length"] = Buffer.from(dataString).length;
		}

		return new Promise((resolve, reject) => {
			const req = https.request(options, (res) => {
				// Send log message when requesting data
				console.log(FG_GREEN, `\n${"[" + method.toUpperCase() + "] " + HTTPS_PROTOCOL + this.hostname + path}`);

				if (Math.round(res.statusCode / 100) === 2) {
					console.log(FG_BLUE, `\nStatus:`, FG_GREEN, `${res.statusCode + " " + res.statusMessage}`);
				} else if (Math.round(res.statusCode / 100) === 4 || Math.round(res.statusCode / 100) === 5) {
					console.log(FG_BLUE, `\nStatus:`, FG_RED, `${res.statusCode + " " + res.statusMessage}`);
				} else {
					console.log(FG_BLUE, `\nStatus:`, FG_WHITE, `${res.statusCode + " " + res.statusMessage}`);
				}

				console.log(FG_BLUE, `\nHeaders:`, FG_CYAN, `${handleConversionObjectToString(res.headers)}\n`);

				let body = "";

				// Handle API rate limit
				const statusCode = res.statusCode;

				if (Math.round(statusCode / 100) === 4) {
					if (statusCode === 429) {
						const xRetryAfterHeader = res?.headers?.["x-retry-after"] ?? null;

						if (this.failOnLimitReached) {
							if (xRetryAfterHeader !== null) {
								console.log(FG_RED, `\nThe BigCommerce API rate limit has been reached. Please wait ${xRetryAfterHeader} seconds before making another request.`);
							}

							return setTimeout(() => {
								// Send log message when restarting request
								console.log(FG_YELLOW, "\nRestarting request...");

								// Send log message when restarting request
								console.log(FG_GREEN, `\n${"[" + method.toUpperCase() + "] " + HTTPS_PROTOCOL + this.hostname + path}\n\n`);

								this.run(method, path, data).then(resolve).catch(reject);
							}, xRetryAfterHeader * 1000);
						}
					}
				}

				// Append the response body to the body variable
				res.on("data", (chunk) => (body += chunk));

				// End BigCommerce response execution
				res.on("end", () => {
					if (statusCode >= 400 && statusCode <= 600) {
						const errMessage = new Error(`BigCommerce API request failed with status code ${statusCode}.`);
						errMessage.statusCode = statusCode;
						errMessage.body = body;

						return reject(errMessage);
					}

					// Calling gzip method
					return zlib.gzip(body, (err, data) => {
						if (err) {
							return reject(err);
						}

						// Calling gunzip method
						zlib.gunzip(data, (err, data) => {
							if (err) {
								return reject(err);
							}

							return handleBodyResponse(res, data.toString("utf8"), resolve, reject);
						});
					});
				});
			});

			dataString !== null
				? () => {
						// Send log message when sending data
						console.log(FG_YELLOW, "\nSending BigCommerce data...");

						// Send log message when requesting data
						console.log(FG_GREEN, `\n${"[" + method.toUpperCase() + "] " + HTTPS_PROTOCOL + this.hostname + path}\n`);

						req.write(dataString);

						console.log(FG_GREEN, "\nSending complete.");
				  }
				: null;

			// Handle BigCommerce API request errors
			req.on("error", (err) => reject(err));

			// End BigCommerce request execution
			req.end();
		});
	}
}

export default Request;
