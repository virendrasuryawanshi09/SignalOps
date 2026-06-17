const logger = require("../config/logger");
const metricsCollector = require("../modules/monitoring/metricsCollector");

function loggerMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    logger.info({
      type: "http",
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    }, `HTTP ${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${durationMs}ms`);

    try {
      const routePath = req.route ? req.baseUrl + req.route.path : req.baseUrl + req.path;
      metricsCollector.recordHttpRequest(req.method, routePath, res.statusCode, durationMs);
    } catch (e) {

    }
  });

  next();
}

module.exports = loggerMiddleware;
