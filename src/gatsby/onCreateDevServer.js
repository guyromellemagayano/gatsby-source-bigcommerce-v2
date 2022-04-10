import { createProxyMiddleware } from "http-proxy-middleware";

exports.onCreateDevServer = async ({ app }) =>
	await app.use(
		"/__BCPreview/",
		createProxyMiddleware({
			target: `http://localhost:8033`,
			secure: false
		})
	);
