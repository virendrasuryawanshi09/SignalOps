const incidentRepository = require("./incident.repository");

class IncidentService {
  async handleLogIngestion(logData, fingerprint) {
    const existingIncident = await incidentRepository.findByFingerprint(fingerprint);

    if (existingIncident) {
      // Atomic increment for performance under high write load
      return await incidentRepository.incrementOccurrences(fingerprint, new Date());
    }

    // Create a new incident if this fingerprint has not been seen before
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
    
    // Trigger asynchronous integrations (e.g., AI Root Cause Analyzer job, WebSockets)
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
    // Process asynchronously: Don't block the main event loop
    setImmediate(async () => {
      try {
        console.log(`[Async Job] Triggered pipelines for Incident ID: ${incident._id}`);
        // 1. Call AI Analyzer background worker
        // 2. Dispatch real-time notifications via Socket.io
        // 3. Fire Slack webhooks or trigger alerts
      } catch (err) {
        console.error(`[Async Job Error] Failed to process workflows for Incident: ${incident._id}`, err);
      }
    });
  }
}

module.exports = new IncidentService();
