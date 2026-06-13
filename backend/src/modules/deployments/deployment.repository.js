const Deployment = require("./deployment.model");

class DeploymentRepository {
  async create(deploymentData) {
    const deployment = new Deployment(deploymentData);
    return await deployment.save();
  }

  async findById(id) {
    return await Deployment.findById(id);
  }

  async findRecent(service, limit = 5) {
    const query = service ? { service } : {};
    return await Deployment.find(query)
      .sort({ deployedAt: -1 })
      .limit(limit);
  }

  async findAll(query = {}, limit = 50, skip = 0) {
    return await Deployment.find(query)
      .sort({ deployedAt: -1 })
      .skip(skip)
      .limit(limit);
  }
}

module.exports = new DeploymentRepository();
