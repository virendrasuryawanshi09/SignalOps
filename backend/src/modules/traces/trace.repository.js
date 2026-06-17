const Trace = require("./trace.model");

class TraceRepository {
  async create(traceData) {
    const trace = new Trace(traceData);
    return await trace.save();
  }

  async findByTraceId(traceId) {
    return await Trace.findOne({ traceId }).populate("relatedIncident");
  }

  async findAll(query = {}, limit = 50, skip = 0) {
    return await Trace.find(query)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("relatedIncident");
  }

  async count(query = {}) {
    return await Trace.countDocuments(query);
  }
}

module.exports = new TraceRepository();
