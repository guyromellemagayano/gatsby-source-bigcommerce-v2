// Environment
export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";

// App
export const APP_NAME = "gatsby-source-bigcommerce-v2";

// Cache
export const CACHE_KEY = "gatsby-source-bigcommerce-v2";

// Request
export const REQUEST_BIGCOMMERCE_API_URL = "https://api.bigcommerce.com";
export const REQUEST_ACCEPT_HEADER = "application/json";
export const REQUEST_TIMEOUT = 60000;
export const REQUEST_THROTTLE_INTERVAL = 500;
export const REQUEST_DEBOUNCE_INTERVAL = 500;
export const REQUEST_CONCURRENCY = 100;
export const REQUEST_PENDING_COUNT = 0;
export const REQUEST_RESPONSE_TYPE = "json";

// Headers
export const ACCESS_CONTROL_ALLOW_HEADERS = "Content-Type,Accept";
export const ACCESS_CONTROL_ALLOW_CREDENTIALS = true;
export const CORS_ORIGIN = "*";

// Hooks
export const BIGCOMMERCE_WEBHOOK_API_ENDPOINT = "/v3/hooks";

// Auth
export const AUTH_HEADERS = {};
