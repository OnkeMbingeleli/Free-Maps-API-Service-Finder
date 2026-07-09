import axios from 'axios';
import { config } from '../config/index.js';

/**
 * Fetches traffic flow data from HERE Maps API for a given bounding box.
 * @param {string} bbox - Bounding box in format "minLon,minLat,maxLon,maxLat"
 * @returns {Promise<Object>} - Traffic flow data
 */
export async function getTrafficFlow(bbox) {
  if (!config.hereApiKey) {
    throw new Error('HERE_API_KEY is not configured');
  }

  const url = `https://data.traffic.hereapi.com/v7/flow?locationReferencing=shape&in=bbox:${bbox}&apiKey=${config.hereApiKey}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching traffic from HERE:', error.response?.data || error.message);
    throw error;
  }
}
