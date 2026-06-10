const promptBuilder = require("./prompt.builder");
const rootCauseAnalyzer = require("./rootCauseAnalyzer");
const logRepository = require("../logs/log.repository");
const incidentRepository = require("../incidents/incident.repository");
const socketManager = require("../../sockets/socketManager");

class AIService {

  async analyzeIncident(incidentId) {
    const incident = await incidentRepository.findById(incidentId);
    if (!incident) {
      throw new Error(`Incident with ID ${incidentId} not found`);
    }

    const contextLogs = await logRepository.findAll(
      { service: incident.service },
      20,
      0
    );

    const prompt = promptBuilder.buildAnalysisPrompt({
      incident,
      relatedLogs: contextLogs,
      deployments: []
    });
    const analysisResult = await rootCauseAnalyzer.analyze(prompt);

    const updatedIncident = await incidentRepository.update(incidentId, {
      rootCauseAnalysis: analysisResult.rootCause,
      fixRecommendation: analysisResult.suggestedFix,
    });

    socketManager.emit("incident:updated", updatedIncident, "dashboard:logs");

    return updatedIncident;
  }
}

module.exports = new AIService();
