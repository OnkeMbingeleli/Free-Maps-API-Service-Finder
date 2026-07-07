import { config } from '../../config/index.js';

// Placeholder for a real email provider (SendGrid, Resend, SES, etc.)
// Wire in an actual API call here — kept provider-agnostic in the scaffold.
export async function sendEmailAlert(subject, body) {
  if (!config.alertEmailTo) {
    console.warn('[alert] ALERT_EMAIL_TO not set, email not sent:', subject);
    return;
  }
  console.log(`[alert:email] Would send to ${config.alertEmailTo} — ${subject}: ${body}`);
  // e.g. await sendgrid.send({ to: config.alertEmailTo, subject, text: body });
}
