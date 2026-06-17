const mongoose = require("mongoose");
const metricsCollector = require("./metricsCollector");

class MonitoringController {
  async getMetrics(req, res) {
    try {
      const metricsText = await metricsCollector.getPrometheusMetrics();
      res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
      return res.status(200).send(metricsText);
    } catch (error) {
      return res.status(500).send(`# ERROR: ${error.message}\n`);
    }
  }

  getHealth(req, res) {
    return res.status(200).json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  getReady(req, res) {
    const dbState = mongoose.connection.readyState;
    const isReady = dbState === 1;

    return res.status(isReady ? 200 : 503).json({
      status: isReady ? "ready" : "not_ready",
      database: isReady ? "connected" : "disconnected",
    });
  }
}

module.exports = new MonitoringController();
