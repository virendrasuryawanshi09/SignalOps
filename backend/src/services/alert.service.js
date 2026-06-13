
class AlertService {
  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  }

  async sendIncidentAlert(incident) {
    if (!this.slackWebhookUrl) {
      console.log(`[AlertService] Slack alerts skipped: SLACK_WEBHOOK_URL is not configured.`);
      return;
    }

    if (incident.severity !== "HIGH" && incident.severity !== "CRITICAL") {
      return;
    }

    const triageLink = `${this.clientUrl}/incidents/${incident._id}`;

    const payload = {
      text: `*Critical Incident Alert in ${incident.service.toUpperCase()}* 🚨`,
      attachments: [
        {
          color: incident.severity === "CRITICAL" ? "#F43F5E" : "#F59E0B",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Incident:* ${incident.title}\n*Service:* \`${incident.service}\`\n*Severity:* *${incident.severity}*\n*Occurrences:* ${incident.occurrences}`,
              },
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "View in Dashboard",
                  },
                  url: triageLink,
                  style: "primary",
                },
              ],
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(this.slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        console.error(`[AlertService] Slack webhook returned status ${response.status}: ${errorDetail}`);
      } else {
        console.log(`[AlertService] Slack alert dispatched successfully for Incident: ${incident._id}`);
      }
    } catch (error) {
      console.error(`[AlertService] Failed to send Slack alert: ${error.message}`);
    }
  }
}

module.exports = new AlertService();
