const analyticsRepository = require("./analytics.repository");

class AnalyticsService {

  getStartDateFromRange(range) {
    if (!range) return null;

    const date = new Date();
    const durationValue = parseInt(range.slice(0, -1), 10);
    const durationUnit = range.slice(-1).toLowerCase();

    if (isNaN(durationValue)) return null;

    switch (durationUnit) {
      case "h":
        date.setHours(date.getHours() - durationValue);
        break;
      case "d":
        date.setDate(date.getDate() - durationValue);
        break;
      default:
        return null;
    }

    return date;
  }

  async getTrends(range, service) {
    const filters = {};
    if (service) filters.service = service;

    const startTime = this.getStartDateFromRange(range || "24h");
    return await analyticsRepository.getErrorTrends(filters, startTime);
  }

  async getSeverityBreakdown(service) {
    const filters = {};
    if (service) filters.service = service;

    return await analyticsRepository.getSeverityDistribution(filters);
  }

  async getHealthOverview() {
    return await analyticsRepository.getServiceHealth();
  }

  async getMTTRMetrics(service) {
    const filters = {};
    if (service) filters.service = service;

    const mttrData = await analyticsRepository.getMeanTimeToResolution(filters);


    const avgMinutes = mttrData.averageDurationMs
      ? Math.round(mttrData.averageDurationMs / (1000 * 60))
      : 0;

    return {
      averageResolutionTimeMinutes: avgMinutes,
      resolvedIncidentCount: mttrData.count,
    };
  }
}

module.exports = new AnalyticsService();
