import { supabaseAdmin } from '../config/supabase.js';

// Sweeps stale, unconfirmed hazards to 'expired' — belt-and-braces alongside
// the DB trigger in db/schema.sql (some rows may not receive an UPDATE
// naturally, so this job forces a periodic check).
export async function expireStaleHazards() {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from('hazards')
    .update({ status: 'expired' })
    .lt('created_at', cutoff)
    .lt('confirmations', 3)
    .eq('status', 'active')
    .select();

  if (error) {
    console.error('[hazardExpiryJob] FAILED', error.message);
    return;
  }
  console.log(`[hazardExpiryJob] expired ${data?.length || 0} stale hazard(s)`);
}
