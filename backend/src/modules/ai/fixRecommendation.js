
class FixRecommendation {

  formatRecommendation(rawFix, incident) {
    if (!rawFix || rawFix.trim() === "") {
      return this._getDefaultRecommendation(incident);
    }

    
    const lines = rawFix.split("\n");
    const steps = [];
    const notes = [];

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      if (/^(\d+\.|\*|-)\s+/.test(cleanLine)) {
        steps.push(cleanLine.replace(/^(\d+\.|\*|-)\s+/, ""));
      } else {
        notes.push(cleanLine);
      }
    });

    return {
      incidentId: incident._id,
      steps: steps.length > 0 ? steps : [rawFix],
      notes: notes.join("\n"),
      priority: ["HIGH", "CRITICAL"].includes(incident.severity) ? "IMMEDIATE" : "STANDARD",
      remediationType: this._guessRemediationType(rawFix, incident),
    };
  }

  _guessRemediationType(rawFix, incident) {
    const text = (rawFix + " " + incident.title).toLowerCase();
    if (text.includes("index") || text.includes("query") || text.includes("db") || text.includes("mongodb")) {
      return "DATABASE_TUNING";
    }
    if (text.includes("config") || text.includes("env") || text.includes("pool")) {
      return "CONFIGURATION_CHANGE";
    }
    if (text.includes("rollback") || text.includes("deploy") || text.includes("version")) {
      return "CODE_ROLLBACK";
    }
    return "CODE_REFACTORS";
  }

  _getDefaultRecommendation(incident) {
    return {
      incidentId: incident._id,
      steps: [
        "Inspect the raw logs surrounding this incident in the live logs stream.",
        "Check recently deployed commits for the service: " + incident.service,
        "Verify environment configurations and database pool status.",
      ],
      notes: "No automated recommendation was generated. Manual triage required.",
      priority: ["HIGH", "CRITICAL"].includes(incident.severity) ? "IMMEDIATE" : "STANDARD",
      remediationType: "MANUAL_TRIAGE",
    };
  }
}

module.exports = new FixRecommendation();
