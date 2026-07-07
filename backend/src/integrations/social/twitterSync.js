import axios from 'axios';
import { supabaseAdmin } from '../../config/supabase.js';
import { config } from '../../config/index.js';
import { sendAlert } from '../../monitoring/alerts/slackAlert.js';

// AUTOMATIC job — no admin ever pastes tweets in by hand.
// Runs on a schedule from src/jobs/scheduler.js (every 5–10 min).
const TRACK_KEYWORDS = ['#loadshedding', '#serviceoutage', '#clinicclosed', '#watershortage'];

export async function syncTwitter() {
  try {
    const query = TRACK_KEYWORDS.join(' OR ');
    const { data } = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: { Authorization: `Bearer ${config.twitterBearerToken}` },
      params: { query, max_results: 25, 'tweet.fields': 'created_at' },
    });

    const tweets = data?.data || [];
    for (const tweet of tweets) {
      await supabaseAdmin
        .from('social_feed_items')
        .upsert(
          {
            platform: 'x',
            external_id: tweet.id,
            content: tweet.text,
            service_type_tag: guessServiceTag(tweet.text),
            fetched_at: new Date().toISOString(),
          },
          { onConflict: 'platform,external_id' }
        );
    }
    console.log(`[socialSync:twitter] ingested ${tweets.length} tweets`);
  } catch (err) {
    console.error('[socialSync:twitter] FAILED', err.message);
    await sendAlert(`Twitter sync failed: ${err.message}`);
  }
}

function guessServiceTag(text) {
  const lower = text.toLowerCase();
  if (lower.includes('clinic') || lower.includes('hospital')) return 'clinic';
  if (lower.includes('water')) return 'water';
  if (lower.includes('loadshedding') || lower.includes('power')) return 'power';
  return 'general';
}
