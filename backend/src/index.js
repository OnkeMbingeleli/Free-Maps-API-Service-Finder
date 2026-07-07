import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { trackRequest } from './monitoring/metrics.js';
import { startScheduledJobs } from './jobs/scheduler.js';
import { expireStaleHazards } from './jobs/hazardExpiryJob.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(trackRequest);
app.use('/api', apiLimiter, routes);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Service Finder backend running on port ${config.port}`);

  // Start all automatic ingestion jobs (social/radio/gov) — see §4 of the blueprint.
  startScheduledJobs();

  // Hazard expiry sweep every 30 minutes, belt-and-braces alongside the DB trigger.
  cron.schedule('*/30 * * * *', expireStaleHazards);
});
