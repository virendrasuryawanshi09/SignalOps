const deploymentService = require("./deployment.service");

class DeploymentController {
  async createDeployment(req, res) {
    try {
      const deployment = await deploymentService.registerDeployment(req.body);

      return res.status(201).json({
        success: true,
        message: "Deployment registered successfully",
        data: deployment,
      });
    } catch (error) {
      const isValidationError = error.message.includes("validation");
      return res.status(isValidationError ? 400 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllDeployments(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const skip = parseInt(req.query.skip, 10) || 0;

      const filters = {};
      if (req.query.service) filters.service = req.query.service;
      if (req.query.environment) filters.environment = req.query.environment;

      const deployments = await deploymentService.getDeploymentsList(filters, limit, skip);

      return res.status(200).json({
        success: true,
        count: deployments.length,
        data: deployments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new DeploymentController();
