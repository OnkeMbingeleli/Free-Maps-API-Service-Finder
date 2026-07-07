import { supabaseAdmin } from '../config/supabase.js';

// GET /api/admin/suggestions — pending queue
export async function listPendingSuggestions(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_suggestions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/suggestions/:id/approve
export async function approveSuggestion(req, res, next) {
  try {
    const { id } = req.params;
    const { data: suggestion, error: fetchErr } = await supabaseAdmin
      .from('service_suggestions')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;

    const { error: insertErr } = await supabaseAdmin.from('services').insert({
      name: suggestion.name,
      type: suggestion.type,
      lat: suggestion.lat,
      lng: suggestion.lng,
      status: 'approved',
      source: 'user_submitted',
      submitted_by: suggestion.submitted_by,
    });
    if (insertErr) throw insertErr;

    await supabaseAdmin
      .from('service_suggestions')
      .update({ status: 'approved', reviewed_by: req.user.id, reviewed_at: new Date().toISOString() })
      .eq('id', id);

    await logAdminAction(req, 'approve_suggestion', 'service_suggestions', id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/suggestions/:id/reject
export async function rejectSuggestion(req, res, next) {
  try {
    const { id } = req.params;
    await supabaseAdmin
      .from('service_suggestions')
      .update({ status: 'rejected', reviewed_by: req.user.id, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    await logAdminAction(req, 'reject_suggestion', 'service_suggestions', id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/data-source-health — powers the "Data Source Health" panel (§10)
export async function dataSourceHealth(req, res, next) {
  try {
    const [social, gov, radio] = await Promise.all([
      supabaseAdmin.from('social_feed_items').select('fetched_at').order('fetched_at', { ascending: false }).limit(1),
      supabaseAdmin.from('gov_stats_cache').select('fetched_at').order('fetched_at', { ascending: false }).limit(1),
      supabaseAdmin.from('radio_announcements').select('ingested_at').order('ingested_at', { ascending: false }).limit(1),
    ]);
    res.json({
      social_last_sync: social.data?.[0]?.fetched_at || null,
      gov_stats_last_sync: gov.data?.[0]?.fetched_at || null,
      radio_last_sync: radio.data?.[0]?.ingested_at || null,
    });
  } catch (err) {
    next(err);
  }
}

async function logAdminAction(req, actionType, targetTable, targetId) {
  await supabaseAdmin.from('admin_actions').insert({
    admin_id: req.user.id,
    action_type: actionType,
    target_table: targetTable,
    target_id: targetId,
    ip_address: req.ip,
  });
}
