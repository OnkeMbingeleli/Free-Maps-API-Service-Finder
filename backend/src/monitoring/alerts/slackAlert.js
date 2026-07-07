import axios from 'axios';
import { config } from '../../config/index.js';

// Notifies Scrum Masters/PO in Slack when a scraper/integration fails
// (blueprint §12C — this is how a silently-dead feed gets caught fast).
export async function sendAlert(message) {
  if (!config.slackWebhookUrl) {
    console.warn('[alert] SLACK_WEBHOOK_URL not set, alert not sent:', message);
    return;
  }
  try {
    await axios.post(config.slackWebhookUrl, { text: `🚨 Service Finder alert: ${message}` });
  } catch (err) {
    console.error('[alert] Failed to send Slack alert:', err.message);
  }
}
