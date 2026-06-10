const incidentRepository = require("./incident.repository");
const aiService = require("../ai/ai.service");
const socketManager = require("../../sockets/socketManager");

class IncidentService {
  async handleLogIngestion(logData, fingerprint) {
    const existingIncident = await incidentRepository.findByFingerprint(fingerprint);

    if (existingIncident) {
      const updatedIncident = await incidentRepository.incrementOccurrences(fingerprint, new Date());
      socketManager.emit("incident:updated", updatedIncident, "dashboard:logs");
      return updatedIncident;
    }

    const newIncidentData = {
      title: logData.message || "Unknown error occurred",
      fingerprint,
      service: logData.service,
      severity: logData.severity || "LOW",
      status: "OPEN",
      occurrences: 1,
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
    };

    const incident = await incidentRepository.create(newIncidentData);

    socketManager.emit("incident:new", incident, "dashboard:logs");

    this.triggerAsyncWorkflows(incident);

    return incident;
  }

  async getIncidentById(id) {
    const incident = await incidentRepository.findById(id);
    if (!incident) {
      throw new Error("Incident not found");
    }
    return incident;
  }

  async updateStatus(id, status) {
    const updatedIncident = await incidentRepository.update(id, { status });
    socketManager.emit("incident:updated", updatedIncident, "dashboard:logs");
    return updatedIncident;
  }

  async assignUser(id, userId) {
    const updatedIncident = await incidentRepository.update(id, { assignedTo: userId });
    socketManager.emit("incident:updated", updatedIncident, "dashboard:logs");
    return updatedIncident;
  }

  triggerAsyncWorkflows(incident) {
    setImmediate(async () => {
      try {
        console.log(`[Async Job] Triggered pipelines for Incident ID: ${incident._id}`);
        await aiService.analyzeIncident(incident._id);
        console.log(`[Async Job] AI analysis completed successfully for Incident ID: ${incident._id}`);

      } catch (err) {
        console.error(`[Async Job Error] Failed to process workflows for Incident: ${incident._id}`, err);
      }
    });
  }
}

module.exports = new IncidentService();
