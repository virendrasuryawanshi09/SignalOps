const logRepository = require("./log.repository");
const incidentService = require("../incidents/incident.service");
const { generateFingerprint } = require("../../utils/fingerprint");

class LogService {
  async ingestLog(logData) {
    if (!logData.service || !logData.message) {
      throw new Error("Log schema validation failed: 'service' and 'message' are required");
    }

    // 1. Generate unique deterministic fingerprint based on stack trace details and service
    const fingerprint = generateFingerprint(
      logData.service,
      logData.message,
      logData.stackTrace || ""
    );

    // 2. Map log to an Incident structure (handles state, auto-reopen, and count aggregation)
    const incident = await incidentService.handleLogIngestion(logData, fingerprint);

    // 3. Persist the log referencing the generated fingerprint
    const enrichedLogData = {
      ...logData,
      fingerprint,
    };

    const log = await logRepository.create(enrichedLogData);

    return {
      log,
      incidentId: incident._id,
    };
  }

  async getLogDetails(id) {
    const log = await logRepository.findById(id);
    if (!log) {
      throw new Error("Log record not found");
    }
    return log;
  }

  async getLogsList(filters = {}, limit = 100, skip = 0) {
    return await logRepository.findAll(filters, limit, skip);
  }
}

module.exports = new LogService();
