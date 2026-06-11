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

  async getServiceHealth() {
    return await Incident.aggregate([
      {
        $group: {
          _id: "$service",
          totalIncidents: { $sum: 1 },
          activeIncidents: {
            $sum: {
              $cond: [{ $in: ["$status", ["OPEN", "INVESTIGATING"]] }, 1, 0],
            },
          },
          resolvedIncidents: {
            $sum: {
              $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          service: "$_id",
          totalIncidents: 1,
          activeIncidents: 1,
          resolvedIncidents: 1,
          status: {
            $cond: [
              { $gt: ["$activeIncidents", 5] },
              "CRITICAL",
              { $cond: [{ $gt: ["$activeIncidents", 0] }, "DEGRADED", "HEALTHY"] },
            ],
          },
        },
      },
    ]);
  }

  async getMeanTimeToResolution(filters) {
    const matchQuery = { ...filters, status: "RESOLVED" };

    const result = await Incident.aggregate([
      { $match: matchQuery },
      {
        $project: {
          durationMs: { $subtract: ["$updatedAt", "$firstSeenAt"] },
        },
      },
      {
        $group: {
          _id: null,
          averageDurationMs: { $avg: "$durationMs" },
          count: { $sum: 1 },
        },
      },
    ]);

    return result[0] || { averageDurationMs: 0, count: 0 };
  }
}

module.exports = new AnalyticsRepository();
