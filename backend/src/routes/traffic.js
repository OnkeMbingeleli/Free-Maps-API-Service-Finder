import express from 'express';
import { getTrafficFlow } from '../services/trafficService.js';

const router = express.Router();

router.get('/flow', async (req, res) => {
  const { bbox } = req.query;
  if (!bbox) {
    return res.status(400).json({ error: 'bbox parameter is required (minLon,minLat,maxLon,maxLat)' });
  }

  try {
    const data = await getTrafficFlow(bbox);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch traffic data' });
  }
});

export default router;
