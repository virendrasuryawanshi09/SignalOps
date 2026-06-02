const Log = require("./log.model");

async function createLog(req, res) {
  try {
    const log = await Log.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Log created successfully",
      data: log,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAllLogs(req, res) {
  try {
    const logs = await Log.find().sort({ createdAt: -1 });

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
    const log = await Log.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Log not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    return res.status(500).json({
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
