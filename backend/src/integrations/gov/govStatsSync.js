import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabaseAdmin } from '../../config/supabase.js';
import { config } from '../../config/index.js';
import { sendAlert } from '../../monitoring/alerts/slackAlert.js';

// AUTOMATIC job — pulls published stats from configured gov sources
// every 6 hours. Each source is wrapped in its own try/catch so one
// broken source never takes down the whole sync (blueprint §4.3).
export async function syncGovStats() {
  for (const sourceUrl of config.govStatsSources) {
    try {
      const { data: html } = await axios.get(sourceUrl, { timeout: 15000 });
      const $ = cheerio.load(html);

      // Placeholder extraction — replace selectors per each real source's markup.
      const statBlocks = [];
      $('.stat, .statistic, table tr').each((_, el) => {
        const label = $(el).find('.label, td:first-child').text().trim();
        const value = $(el).find('.value, td:nth-child(2)').text().trim();
        if (label && value) statBlocks.push({ label, value });
      });

      await supabaseAdmin.from('gov_stats_cache').insert({
        source_url: sourceUrl,
        category: 'general',
        data_json: statBlocks,
        fetched_at: new Date().toISOString(),
      });

      console.log(`[govStatsSync] synced ${sourceUrl} (${statBlocks.length} stats)`);
    } catch (err) {
      console.error(`[govStatsSync] source ${sourceUrl} FAILED`, err.message);
      await sendAlert(`Gov stats sync failed for ${sourceUrl}: ${err.message}`);
      // continue to next source — one bad source must never kill the whole job
    }
  }
}
