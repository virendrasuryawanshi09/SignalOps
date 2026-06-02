const Log = require("./log.model");

async function createLog(logData) {
  try {
    const log = new Log(logData);
    return await log.save();
  } catch (error) {
    throw new Error(`Failed to create log: ${error.message}`);
  }
}

async function getAllLogs() {
  try {
    return await Log.find().sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }
}

async function getLogById(logId) {
  try {
    return await Log.findById(logId);
  } catch (error) {
    throw new Error(`Failed to fetch log by ID: ${error.message}`);
  }
}

async function deleteLog(logId) {
  try {
    return await Log.findByIdAndDelete(logId);
  } catch (error) {
    throw new Error(`Failed to delete log: ${error.message}`);
  }
}

async function updateLogStatus(logId, status) {
  try {
    return await Log.findByIdAndUpdate(logId, { status }, { new: true, runValidators: true });
  } catch (error) {
    throw new Error(`Failed to update log status: ${error.message}`);
  }
}

module.exports = {
  createLog,
  getAllLogs,
  getLogById,
  deleteLog,
  updateLogStatus,
};
