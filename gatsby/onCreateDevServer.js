"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _httpProxyMiddleware = require("http-proxy-middleware");

exports.onCreateDevServer = function () {
  var _ref2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(_ref) {
    var app;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            app = _ref.app;
            _context.next = 3;
            return app.use("/__BCPreview/", (0, _httpProxyMiddleware.createProxyMiddleware)({
              target: "http://localhost:8033",
              secure: false
            }));

          case 3:
            return _context.abrupt("return", _context.sent);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();
//# sourceMappingURL=onCreateDevServer.js.map