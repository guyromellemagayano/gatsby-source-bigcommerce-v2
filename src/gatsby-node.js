"use strict";

const { onCreateDevServer, sourceNodes } = require("./gatsby/sourceNodes");

module.exports = {
	onCreateDevServer: onCreateDevServer,
	sourceNodes: sourceNodes
};
