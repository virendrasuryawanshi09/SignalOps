class PromptBuilder {
  buildAnalysisPrompt({ incident, relatedLogs = [], deployments = [] }) {
    const serializedLogs = this._formatLogs(relatedLogs);
    const serializedDeployments = this._formatDeployments(deployments);

    return `
You are an expert Production Observability Agent and Staff SRE Engineer.
Analyze the production outage or exception details below and output a structured root cause analysis and code remediation plan.

<incident_details>
ID: ${incident._id}
Title: ${incident.title}
Service: ${incident.service}
Severity: ${incident.severity}
Status: ${incident.status}
Occurrences: ${incident.occurrences}
First Seen: ${incident.firstSeenAt}
Last Seen: ${incident.lastSeenAt}
</incident_details>

<recent_service_logs>
${serializedLogs || "No surrounding log logs available."}
</recent_service_logs>

<recent_deployments>
${serializedDeployments || "No deployments recorded within the time window."}
</recent_deployments>

Your response must strictly match the following JSON schema:
{
  "rootCause": "A clear, concise 2-3 sentence explanation of the technical root cause.",
  "confidenceScore": 85, // Integer from 0 to 100 based on log match details
  "evidence": [
    "Specific log message, trace detail, or deployment action that proves the root cause."
  ],
  "suggestedFix": "Detailed step-by-step code change, database migration, config adjustment, or rollback instruction to fix the issue."
}

Do not include any chat formatting, markdown formatting (like \`\`\`json), or text outside the JSON object. The response must be valid, parseable JSON.
`;
  }

  _formatLogs(logs) {
    return logs
      .map((log, index) => {
        return `[LOG #${index + 1}]
Timestamp: ${log.createdAt || log.timestamp}
Severity: ${log.severity}
Message: ${log.message}
Stack Trace: ${log.stackTrace || "None"}
Endpoint: ${log.method || ""} ${log.endpoint || ""} ${log.statusCode || ""}
Metadata: ${JSON.stringify(log.metadata || {})}`;
      })
      .join("\n\n");
  }

  _formatDeployments(deployments) {
    return deployments
      .map((dep, index) => {
        return `[DEPLOYMENT #${index + 1}]
Version: ${dep.version}
Commit SHA: ${dep.commitSha}
Deployed At: ${dep.deployedAt}
Environment: ${dep.environment}
Author: ${dep.deployedBy || "CI/CD Pipeline"}
Metadata: ${JSON.stringify(dep.metadata || {})}`;
      })
      .join("\n\n");
  }
}

module.exports = new PromptBuilder();
