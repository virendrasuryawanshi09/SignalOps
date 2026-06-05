const logService = require("./log.service");

async function createLog(req, res) {
  try {
    const result = await logService.ingestLog(req.body);

    return res.status(201).json({
      success: true,
      message: "Log ingested and mapped successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.message.includes("validation") ? 400 : 500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAllLogs(req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = parseInt(req.query.skip, 10) || 0;
    
    // Abstracting query filters to isolate controller from DB querying logic
    const filters = {};
    if (req.query.service) filters.service = req.query.service;
    if (req.query.severity) filters.severity = req.query.severity;
    if (req.query.fingerprint) filters.fingerprint = req.query.fingerprint;

    const logs = await logService.getLogsList(filters, limit, skip);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getLogById(req, res) {
  try {
    const log = await logService.getLogDetails(req.params.id);

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createLog,
  getAllLogs,
  getLogById,
};
