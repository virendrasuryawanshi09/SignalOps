const logger = require("../config/logger");


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
  });

  next();
}

module.exports = loggerMiddleware;
