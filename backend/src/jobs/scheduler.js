import cron from 'node-cron';
import { syncEmergencyHotlines } from './emergencySyncJob.js';

export function startScheduledJobs() {
  console.log('Scheduler initialized');

  // Sync Western Cape Emergency Numbers automatically once a year
  // (Runs at midnight on Jan 1st)
  cron.schedule('0 0 1 1 *', async () => {
    console.log('Running annual Emergency Hotline sync...');
    await syncEmergencyHotlines();
  });

  // You can also run it immediately on startup for the first time
  syncEmergencyHotlines();
}
