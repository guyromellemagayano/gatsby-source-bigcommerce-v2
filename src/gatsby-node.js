const { sourceNodes } = require("./gatsby/sourceNodes");
const { onCreateDevServer } = require("./gatsby/onCreateDevServer");

module.exports = {
	onCreateDevServer: onCreateDevServer,
	sourceNodes: sourceNodes
};
