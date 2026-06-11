const Log = require("../logs/log.model");
const Incident = require("../incidents/incident.model");

class AnalyticsRepository {

  async getErrorTrends(filters, startTime) {
    const matchQuery = { ...filters };
    if (startTime) {
      matchQuery.createdAt = { $gte: startTime };
    }

    return await Log.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          time: "$_id",
          count: 1,
        },
      },
    ]);
  }

  async getSeverityDistribution(filters) {
    return await Incident.aggregate([
      { $match: filters },
      {
        $group: {
          _id: "$severity",
          count: { $sum: "$occurrences" },
        },
      },
      {
        $project: {
          _id: 0,
          severity: "$_id",
          count: 1,
        },
      },
    ]);
  }
}

module.exports = new AnalyticsRepository();
