const alertRepository = require("./alert.repository");
const alertService = require("../../services/alert.service");

class AlertController {
  async createAlert(req, res) {
    try {
      const { type, channel, threshold, destination, enabled, service, severity } = req.body;

      if (!channel || !destination || !service) {
        return res.status(400).json({
          success: false,
          message: "Validation failed: 'channel', 'destination', and 'service' are required.",
        });
      }

      const alert = await alertRepository.create({
        type,
        channel,
        threshold,
        destination,
        enabled,
        service,
        severity,
        createdBy: req.user.id,
      });

      return res.status(201).json({
        success: true,
        message: "Alert configured successfully",
        data: alert,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllAlerts(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const skip = parseInt(req.query.skip, 10) || 0;

      const filters = {};
      if (req.query.service) filters.service = req.query.service;
      if (req.query.enabled) filters.enabled = req.query.enabled === "true";
      if (req.query.severity) filters.severity = req.query.severity;

      const alerts = await alertRepository.findAll(filters, limit, skip);
      const total = await alertRepository.count(filters);

      return res.status(200).json({
        success: true,
        count: alerts.length,
        total,
        data: alerts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateAlert(req, res) {
    try {
      const { enabled, threshold, destination, severity } = req.body;
      const updated = await alertRepository.update(req.params.id, {
        enabled,
        threshold,
        destination,
        severity,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Alert config not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Alert configuration updated successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteAlert(req, res) {
    try {
      const deleted = await alertRepository.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Alert config not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Alert configuration deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async testAlert(req, res) {
    try {
      const { channel, destination } = req.body;

      if (!channel || !destination) {
        return res.status(400).json({
          success: false,
          message: "Validation failed: 'channel' and 'destination' are required to fire test.",
        });
      }

      const mockIncident = {
        _id: "test_id_12345678",
        title: "Test connection check fired from SignalOps console",
        service: "SignalOps-Core",
        severity: "HIGH",
        occurrences: 1,
      };


      if (channel === "SLACK") {
        const testService = Object.create(alertService);
        testService.slackWebhookUrl = destination;
        await testService.sendIncidentAlert(mockIncident);
      } else {
        console.log(`[Alert Test] Dispatched connection verification to ${destination} via ${channel}`);
      }

      return res.status(200).json({
        success: true,
        message: `Test alert dispatched successfully to channel ${channel}`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AlertController();
