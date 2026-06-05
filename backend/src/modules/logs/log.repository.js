const Log = require("./log.model");

class LogRepository {
  async create(logData) {
    const log = new Log(logData);
    return await log.save();
  }

  async findById(id) {
    return await Log.findById(id);
  }

  async findAll(query = {}, limit = 100, skip = 0) {
    return await Log.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async count(query = {}) {
    return await Log.countDocuments(query);
  }

  async delete(id) {
    return await Log.findByIdAndDelete(id);
  }
}

module.exports = new LogRepository();
