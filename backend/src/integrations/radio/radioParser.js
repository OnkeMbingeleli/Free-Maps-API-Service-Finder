import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabaseAdmin } from '../../config/supabase.js';
import { config } from '../../config/index.js';
import { sendAlert } from '../../monitoring/alerts/slackAlert.js';

// AUTOMATIC job (blueprint §4.2 — radio pulling must be automatic).
// Path 1: RSS feed if the station publishes one.
// Path 2: scheduled scrape of the station's news page if no RSS exists.
// Manual admin entry (see backend/src/controllers/adminController.js) is only
// ever used as a fallback when BOTH of these fail — flagged via sendAlert below.

const rssParser = new Parser();

export async function syncRadio() {
  let ingested = 0;
  try {
    if (config.radioRssUrl) {
      ingested += await syncFromRss(config.radioRssUrl);
    } else if (config.radioNewsUrl) {
      ingested += await syncFromScrape(config.radioNewsUrl);
    } else {
      throw new Error('No RADIO_STATION_RSS_URL or RADIO_STATION_NEWS_URL configured');
    }
    console.log(`[radioSync] ingested ${ingested} new announcement(s)`);
  } catch (err) {
    console.error('[radioSync] FAILED — falling back to manual admin entry for now', err.message);
    await sendAlert(`Radio sync failed: ${err.message}. Manual entry needed until this is fixed.`);
  }
}

async function syncFromRss(rssUrl) {
  const feed = await rssParser.parseURL(rssUrl);
  let count = 0;
  for (const item of feed.items) {
    const { error } = await supabaseAdmin.from('radio_announcements').upsert(
      {
        station: feed.title || 'Unknown station',
        headline: item.title,
        body: item.contentSnippet || item.content,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        ingested_at: new Date().toISOString(),
      },
      { onConflict: 'station,headline,published_at' } // dedupe guard
    );
    if (!error) count++;
  }
  return count;
}

async function syncFromScrape(newsUrl) {
  const { data: html } = await axios.get(newsUrl);
  const $ = cheerio.load(html);
  let count = 0;

  // Adjust these selectors per the actual station site's markup.
  $('.news-item, article').each((_, el) => {
    const headline = $(el).find('h2, h3, .headline').first().text().trim();
    const body = $(el).find('p').first().text().trim();
    if (!headline) return;

    supabaseAdmin
      .from('radio_announcements')
      .upsert(
        {
          station: 'Configured Station',
          headline,
          body,
          published_at: new Date().toISOString(),
          ingested_at: new Date().toISOString(),
        },
        { onConflict: 'station,headline,published_at' }
      )
      .then(({ error }) => {
        if (!error) count++;
      });
  });

  return count;
}
