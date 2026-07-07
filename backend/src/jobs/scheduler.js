import cron from 'node-cron';
import { syncTwitter } from '../integrations/social/twitterSync.js';
import { syncFacebook } from '../integrations/social/facebookSync.js';
import { syncRadio } from '../integrations/radio/radioParser.js';
import { syncGovStats } from '../integrations/gov/govStatsSync.js';

// Every source in this file pulls automatically on its own schedule —
// per the project requirement, nothing here waits on a human to trigger it.
export function startScheduledJobs() {
  // Social media — every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    console.log('[scheduler] running social media sync…');
    syncTwitter();
    syncFacebook();
  });

  // Radio announcements — every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    console.log('[scheduler] running radio sync…');
    syncRadio();
  });

  // Government stats — every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('[scheduler] running gov stats sync…');
    syncGovStats();
  });

  console.log('[scheduler] all automatic ingestion jobs scheduled.');
}
