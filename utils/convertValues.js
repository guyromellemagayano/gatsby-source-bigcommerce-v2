"use strict";

exports.__esModule = true;
exports.handleConversionStringToUppercase =
	exports.handleConversionStringToTitleCase =
	exports.handleConversionStringToSnakeCase =
	exports.handleConversionStringToSentenceCase =
	exports.handleConversionStringToObject =
	exports.handleConversionStringToNumber =
	exports.handleConversionStringToLowercase =
	exports.handleConversionStringToKebabCase =
	exports.handleConversionStringToConstantCase =
	exports.handleConversionStringToCamelCase =
	exports.handleConversionStringToBoolean =
	exports.handleConversionStringToArray =
	exports.handleConversionObjectToString =
		void 0;

var handleConversionStringToLowercase = function handleConversionStringToLowercase(e) {
	return typeof e === "string" ? e.toLowerCase() : e;
};

exports.handleConversionStringToLowercase = handleConversionStringToLowercase;

var handleConversionStringToUppercase = function handleConversionStringToUppercase(e) {
	return typeof e === "string" ? e.toUpperCase() : e;
};

exports.handleConversionStringToUppercase = handleConversionStringToUppercase;

var handleConversionStringToTitleCase = function handleConversionStringToTitleCase(e) {
	return typeof e === "string"
		? e.replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		  })
		: e;
};

exports.handleConversionStringToTitleCase = handleConversionStringToTitleCase;

var handleConversionStringToCamelCase = function handleConversionStringToCamelCase(e) {
	return typeof e === "string"
		? e.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
				return str.toUpperCase();
		  })
		: e;
};

exports.handleConversionStringToCamelCase = handleConversionStringToCamelCase;

var handleConversionStringToSnakeCase = function handleConversionStringToSnakeCase(e) {
	return typeof e === "string" ? e.replace(/\s/g, "_").toLowerCase() : e;
};

exports.handleConversionStringToSnakeCase = handleConversionStringToSnakeCase;

var handleConversionStringToKebabCase = function handleConversionStringToKebabCase(e) {
	return typeof e === "string" ? e.replace(/\s/g, "-").toLowerCase() : e;
};

exports.handleConversionStringToKebabCase = handleConversionStringToKebabCase;

var handleConversionStringToConstantCase = function handleConversionStringToConstantCase(e) {
	return typeof e === "string" ? e.replace(/\s/g, "_").toUpperCase() : e;
};

exports.handleConversionStringToConstantCase = handleConversionStringToConstantCase;

var handleConversionStringToSentenceCase = function handleConversionStringToSentenceCase(e) {
	return typeof e === "string"
		? e.replace(/\s/g, " ").replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		  })
		: e;
};

exports.handleConversionStringToSentenceCase = handleConversionStringToSentenceCase;

var handleConversionStringToNumber = function handleConversionStringToNumber(e) {
	return typeof e === "string" ? Number(e) : e;
};

exports.handleConversionStringToNumber = handleConversionStringToNumber;

var handleConversionStringToBoolean = function handleConversionStringToBoolean(e) {
	return typeof e === "string" ? e === "true" : e;
};

exports.handleConversionStringToBoolean = handleConversionStringToBoolean;

var handleConversionStringToArray = function handleConversionStringToArray(e) {
	return typeof e === "string" ? e.split(",") : e;
};

exports.handleConversionStringToArray = handleConversionStringToArray;

var handleConversionStringToObject = function handleConversionStringToObject(e) {
	return typeof e === "string" ? JSON.parse(e) : e;
};

exports.handleConversionStringToObject = handleConversionStringToObject;

var handleConversionObjectToString = function handleConversionObjectToString(e) {
	return typeof e === "object" ? JSON.stringify(e) : e;
};

exports.handleConversionObjectToString = handleConversionObjectToString;
//# sourceMappingURL=convertValues.js.map
