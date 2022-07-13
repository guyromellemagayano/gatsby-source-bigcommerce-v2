// Environment
export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";

// String
export const REQUEST_BIGCOMMERCE_API_URL = "https://api.bigcommerce.com";
export const REQUEST_ACCEPT_HEADER = "application/json";
export const REQUEST_CONTENT_TYPE_HEADER = "application/json";
export const REQUEST_HEADERS = {
	"Accept": REQUEST_ACCEPT_HEADER,
	"Content-Type": REQUEST_CONTENT_TYPE_HEADER
};
export const REQUEST_TIMEOUT = 10000;

// Numbers
export const REQUEST_BIGCOMMERCE_API_PORT = 443;

// Hooks
export const BIGCOMMERCE_WEBHOOK_API_ENDPOINT = "/v3/hooks";
