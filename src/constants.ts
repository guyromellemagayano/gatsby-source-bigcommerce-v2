// Environment
export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";

// Console colors
export const FG_BLACK = "\x1b[30m%s\x1b[0m";
export const FG_RED = "\x1b[31m%s\x1b[0m";
export const FG_GREEN = "\x1b[32m%s\x1b[0m";
export const FG_YELLOW = "\x1b[33m%s\x1b[0m";
export const FG_BLUE = "\x1b[34m%s\x1b[0m";
export const FG_MAGENTA = "\x1b[35m%s\x1b[0m";
export const FG_CYAN = "\x1b[36m%s\x1b[0m";
export const FG_WHITE = "\x1b[37m%s\x1b[0m";

// String
export const REQUEST_BIGCOMMERCE_LOGIN_URL = "https://login.bigcommerce.com";
export const REQUEST_BIGCOMMERCE_API_URL = "https://api.bigcommerce.com";

// Numbers
export const REQUEST_BIGCOMMERCE_API_PORT = 443;

// Hooks
export const BIGCOMMERCE_WEBHOOK_API_ENDPOINT = "/v3/hooks";
