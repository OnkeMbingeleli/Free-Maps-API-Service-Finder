import axios from 'axios';
import { supabaseAdmin } from '../../config/supabase.js';
import { config } from '../../config/index.js';
import { sendAlert } from '../../monitoring/alerts/slackAlert.js';

// AUTOMATIC job — polls configured Page IDs (municipalities, clinics, radio stations).
const PAGE_IDS = (process.env.FACEBOOK_PAGE_IDS || '').split(',').filter(Boolean);

export async function syncFacebook() {
  for (const pageId of PAGE_IDS) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v19.0/${pageId}/posts`, {
        params: {
          access_token: config.facebookPageAccessToken,
          fields: 'message,created_time,full_picture',
          limit: 10,
        },
      });

      for (const post of data?.data || []) {
        await supabaseAdmin.from('social_feed_items').upsert(
          {
            platform: 'facebook',
            external_id: post.id,
            content: post.message || '',
            media_url: post.full_picture || null,
            fetched_at: new Date().toISOString(),
          },
          { onConflict: 'platform,external_id' }
        );
      }
      console.log(`[socialSync:facebook] page ${pageId} synced`);
    } catch (err) {
      console.error(`[socialSync:facebook] page ${pageId} FAILED`, err.message);
      await sendAlert(`Facebook sync failed for page ${pageId}: ${err.message}`);
    }
  }
}
