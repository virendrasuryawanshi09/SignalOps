const traceRepository = require("./trace.repository");

class TraceController {
  async createTrace(req, res) {
    try {
      const { traceId, serviceFlow, durationMs, startedAt, endedAt, status, failingNode, relatedIncident } = req.body;
      
      if (!traceId || !serviceFlow || !durationMs || !startedAt || !endedAt) {
        return res.status(400).json({
          success: false,
          message: "Validation failed: 'traceId', 'serviceFlow', 'durationMs', 'startedAt', and 'endedAt' are required.",
        });
      }

      const existing = await traceRepository.findByTraceId(traceId);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Trace with ID ${traceId} already exists.`,
        });
      }

      const trace = await traceRepository.create({
        traceId,
        serviceFlow,
        durationMs,
        startedAt,
        endedAt,
        status,
        failingNode,
        relatedIncident,
      });

      return res.status(201).json({
        success: true,
        message: "Trace registered successfully",
        data: trace,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllTraces(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const skip = parseInt(req.query.skip, 10) || 0;
      
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.failingNode) filters.failingNode = req.query.failingNode;

      const traces = await traceRepository.findAll(filters, limit, skip);
      const total = await traceRepository.count(filters);

      return res.status(200).json({
        success: true,
        count: traces.length,
        total,
        data: traces,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTraceById(req, res) {
    try {
      const trace = await traceRepository.findByTraceId(req.params.traceId);
      if (!trace) {
        return res.status(404).json({
          success: false,
          message: "Trace not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: trace,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new TraceController();
