const analyticsService = require("./analytics.service");

class AnalyticsController {
  async getErrorTrends(req, res) {
    try {
      const { range, service } = req.query;
      const trends = await analyticsService.getTrends(range, service);

      return res.status(200).json({
        success: true,
        data: trends,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getSeverityDistribution(req, res) {
    try {
      const { service } = req.query;
      const severity = await analyticsService.getSeverityBreakdown(service);

      return res.status(200).json({
        success: true,
        data: severity,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getServiceHealth(req, res) {
    try {
      const health = await analyticsService.getHealthOverview();

      return res.status(200).json({
        success: true,
        data: health,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMTTR(req, res) {
    try {
      const { service } = req.query;
      const mttr = await analyticsService.getMTTRMetrics(service);

      return res.status(200).json({
        success: true,
        data: mttr,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AnalyticsController();
