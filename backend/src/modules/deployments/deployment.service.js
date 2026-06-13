const deploymentRepository = require("./deployment.repository");

class DeploymentService {
  async registerDeployment(deploymentData) {
    if (!deploymentData.version || !deploymentData.commitSha || !deploymentData.service) {
      throw new Error("Deployment validation failed: 'version', 'commitSha', and 'service' are required");
    }

    return await deploymentRepository.create(deploymentData);
  }

  async getRecentDeployments(service, limit = 5) {
    return await deploymentRepository.findRecent(service, limit);
  }

  async getDeploymentsList(filters = {}, limit = 50, skip = 0) {
    return await deploymentRepository.findAll(filters, limit, skip);
  }
}

module.exports = new DeploymentService();
