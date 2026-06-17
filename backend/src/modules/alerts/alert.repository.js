const Alert = require("./alert.model");

class AlertRepository {
  async create(alertData) {
    const alert = new Alert(alertData);
    return await alert.save();
  }

  async findById(id) {
    return await Alert.findById(id).populate("createdBy", "name email");
  }

  async findAll(query = {}, limit = 50, skip = 0) {
    return await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");
  }

  async update(id, updateData) {
    return await Alert.findByIdAndUpdate(id, updateData, { new: true }).populate("createdBy", "name email");
  }

  async delete(id) {
    return await Alert.findByIdAndDelete(id);
  }

  async count(query = {}) {
    return await Alert.countDocuments(query);
  }
}

module.exports = new AlertRepository();
