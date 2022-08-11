// Environment
export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";

// Request
export const REQUEST_BIGCOMMERCE_API_URL = "https://api.bigcommerce.com";
export const REQUEST_ACCEPT_HEADER = "application/json";
export const REQUEST_TIMEOUT = 0;

// Hooks
export const BIGCOMMERCE_WEBHOOK_API_ENDPOINT = "/v3/hooks";

// Headers
export const ACCESS_CONTROL_ALLOW_HEADERS = "Content-Type,Accept";
export const ACCESS_CONTROL_ALLOW_CREDENTIALS = true;
export const CORS_ORIGIN = "*";
