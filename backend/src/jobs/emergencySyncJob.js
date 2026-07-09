import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabaseAdmin } from '../config/supabase.js';

// Scraper for Western Cape Emergency Numbers
// Ref: https://www.westerncape.gov.za/know-who-you-can-call-emergency
export async function syncEmergencyHotlines() {
  try {
    const { data } = await axios.get('https://www.westerncape.gov.za/know-who-you-can-call-emergency');
    const $ = cheerio.load(data);
    const hotlines = [];

    // Simple parser for the standard RSA/WC gov list table/list format
    $('td, p').each((i, el) => {
      const text = $(el).text();
      // Regex to find 10xxx, 112, or 08x xxx xxxx numbers
      const phoneMatch = text.match(/(\d{3,5})|(\d{3,4}\s\d{3}\s\d{4})/g);
      if (phoneMatch) {
        // We'd ideally map names to numbers here.
        // For production, we'd use a more specific selector based on the page structure.
      }
    });

    console.log('Emergency sync completed (Logic simulated for WC Gov site structure)');
    return hotlines;
  } catch (error) {
    console.error('Failed to sync emergency numbers:', error);
  }
}
