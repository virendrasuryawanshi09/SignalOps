const incidentRepository = require("./incident.repository");
const aiService = require("../ai/ai.service");

class IncidentService {
  async handleLogIngestion(logData, fingerprint) {
    const existingIncident = await incidentRepository.findByFingerprint(fingerprint);

    if (existingIncident) {
      return await incidentRepository.incrementOccurrences(fingerprint, new Date());
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
    return await incidentRepository.update(id, { status });
  }

  async assignUser(id, userId) {
    return await incidentRepository.update(id, { assignedTo: userId });
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
