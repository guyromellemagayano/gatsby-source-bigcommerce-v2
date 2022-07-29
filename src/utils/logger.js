import { addColors, createLogger, format, transports } from "winston";

/**
 * ============================================================================
 * Logger settings
 * ============================================================================
 */
const logLevels = {
	levels: {
		info: 1,
		warn: 2,
		error: 3,
		debug: 4
	},
	colors: {
		info: "bold green",
		warn: "bold yellow",
		error: "bold red",
		debug: "bold cyan"
	}
};

addColors(logLevels.colors);

const { combine, timestamp, colorize, simple } = format;

// Init `winston` logger
export const logger = (log_level) =>
	createLogger({
		level: log_level || "info",
		levels: logLevels.levels,
		format: combine(colorize(), simple(), timestamp()),
		transports: [new transports.Console()]
	});
