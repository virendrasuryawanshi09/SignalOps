const incidentService = require("./incident.service");

class IncidentController {
  async getAllIncidents(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const skip = parseInt(req.query.skip, 10) || 0;

      const filters = {};
      if (req.query.service) filters.service = req.query.service;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.severity) filters.severity = req.query.severity;

      const { list, total } = await incidentService.getIncidentsList(filters, limit, skip);

      return res.status(200).json({
        success: true,
        count: list.length,
        total,
        data: list,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getIncidentById(req, res) {
    try {
      const incident = await incidentService.getIncidentById(req.params.id);
      return res.status(200).json({
        success: true,
        data: incident,
      });
    } catch (error) {
      return res.status(error.message.includes("not found") ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const updated = await incidentService.updateStatus(req.params.id, status);
      return res.status(200).json({
        success: true,
        message: `Incident status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async assignUser(req, res) {
    try {
      const { assignedTo } = req.body;
      if (assignedTo === undefined) {
        return res.status(400).json({
          success: false,
          message: "assignedTo field is required",
        });
      }

      const updated = await incidentService.assignUser(req.params.id, assignedTo);
      return res.status(200).json({
        success: true,
        message: "Incident assignment updated successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new IncidentController();
