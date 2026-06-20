const Incident = require("./incident.model");

class IncidentRepository {
  async findByFingerprint(fingerprint) {
    return await Incident.findOne({ fingerprint });
  }

  async create(incidentData) {
    const incident = new Incident(incidentData);
    return await incident.save();
  }

  async findById(id) {
    return await Incident.findById(id).populate("assignedTo", "name email role");
  }

  async update(id, updateData) {
    return await Incident.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async incrementOccurrences(fingerprint, lastSeenAt = new Date()) {
    return await Incident.findOneAndUpdate(
      { fingerprint },
      {
        $inc: { occurrences: 1 },
        $set: { lastSeenAt, status: "OPEN" }, 
      },
      { new: true }
    );
  }

  async findAll(query = {}, limit = 50, skip = 0) {
    return await Incident.find(query)
      .sort({ lastSeenAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("assignedTo", "name email role");
  }

  async count(query = {}) {
    return await Incident.countDocuments(query);
  }
}

module.exports = new IncidentRepository();
