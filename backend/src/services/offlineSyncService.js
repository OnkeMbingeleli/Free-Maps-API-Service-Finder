import { supabaseAdmin } from '../config/supabase.js';

// Resolves conflicts when a queued offline write hits the server
// (blueprint §7 conflict resolution: last-write-wins / merge / flag-for-review).
export async function resolveAndApplySync(userId, table, payload, clientTimestamp, strategy = 'last_write_wins') {
  if (!payload.id) {
    // brand-new record, no conflict possible
    const { data, error } = await supabaseAdmin.from(table).insert(payload).select().single();
    if (error) throw error;
    return { applied: data, conflict: false };
  }

  const { data: serverRecord, error: fetchErr } = await supabaseAdmin
    .from(table)
    .select('*')
    .eq('id', payload.id)
    .single();
  if (fetchErr) throw fetchErr;

  if (strategy === 'last_write_wins') {
    if (new Date(clientTimestamp) > new Date(serverRecord.updated_at || serverRecord.created_at)) {
      const { data, error } = await supabaseAdmin.from(table).update(payload).eq('id', payload.id).select().single();
      if (error) throw error;
      return { applied: data, conflict: false };
    }
    return { applied: serverRecord, conflict: false }; // server version already newer, keep it
  }

  if (strategy === 'merge') {
    const merged = { ...serverRecord, ...payload };
    const { data, error } = await supabaseAdmin.from(table).update(merged).eq('id', payload.id).select().single();
    if (error) throw error;
    return { applied: data, conflict: false };
  }

  // fallback: flag for admin review rather than silently overwrite core fields
  await supabaseAdmin.from('admin_actions').insert({
    admin_id: null,
    action_type: 'sync_conflict_flagged',
    target_table: table,
    target_id: payload.id,
    note: JSON.stringify({ serverRecord, clientPayload: payload }),
  });
  return { applied: serverRecord, conflict: true, needsReview: true };
}
