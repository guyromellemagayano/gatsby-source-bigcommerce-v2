"use strict";

const { onCreateDevServer, sourceNodes } = require("./gatsby/sourceNodes");

module.exports = {
	sourceNodes: sourceNodes,
	onCreateDevServer: onCreateDevServer
};
