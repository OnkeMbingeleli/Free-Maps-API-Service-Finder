import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';

// Admin review queue for user-submitted services
// (blueprint §10 ADMIN / CONTROLLER PANEL).
// RLS in backend/db/schema.sql restricts this table's writes to admin/moderator roles.
export default function ServiceApprovalQueue() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    const { data } = await supabase
      .from('service_suggestions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setPending(data || []);
  }

  async function approve(suggestion) {
    await supabase.from('services').insert({
      name: suggestion.name,
      type: suggestion.type,
      lat: suggestion.lat,
      lng: suggestion.lng,
      status: 'approved',
      source: 'user_submitted',
      submitted_by: suggestion.submitted_by,
    });
    await supabase
      .from('service_suggestions')
      .update({ status: 'approved' })
      .eq('id', suggestion.id);
    loadPending();
  }

  async function reject(suggestion) {
    await supabase
      .from('service_suggestions')
      .update({ status: 'rejected' })
      .eq('id', suggestion.id);
    loadPending();
  }

  return (
    <div className="approval-queue">
      <h2>Pending service suggestions ({pending.length})</h2>
      {pending.map((s) => (
        <div key={s.id} className="approval-row">
          <strong>{s.name}</strong> — {s.type}
          <button onClick={() => approve(s)}>Approve</button>
          <button onClick={() => reject(s)}>Reject</button>
        </div>
      ))}
    </div>
  );
}
