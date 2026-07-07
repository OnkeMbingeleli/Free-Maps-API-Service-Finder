import { MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useState } from 'react';

// Renders a Waze-style hazard/incident report on the Google Map.
// Backed by the `hazards` + `hazard_confirmations` tables
// (blueprint §6A hazard auto-decay).
const HAZARD_ICONS = {
  flood: '🌊',
  road_closure: '🚧',
  protest: '⚠️',
  loadshedding: '🔌',
};

export default function HazardMarker({ hazard }) {
  const [open, setOpen] = useState(false);

  return (
    <MarkerF
      position={{ lat: hazard.lat, lng: hazard.lng }}
      label={HAZARD_ICONS[hazard.type] || '❗'}
      onClick={() => setOpen(true)}
    >
      {open && (
        <InfoWindowF onCloseClick={() => setOpen(false)}>
          <div>
            <strong>{hazard.type.replace('_', ' ')}</strong>
            <p>{hazard.confirmations} confirmation(s)</p>
            <button onClick={() => confirmHazard(hazard.id)}>Still there?</button>
          </div>
        </InfoWindowF>
      )}
    </MarkerF>
  );
}

async function confirmHazard(hazardId) {
  const { supabase } = await import('../../config/supabaseClient');
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return;

  // Unique constraint on (hazard_id, user_id) prevents duplicate upvotes —
  // see backend/db/schema.sql
  await supabase.from('hazard_confirmations').insert({
    hazard_id: hazardId,
    user_id: userData.user.id,
  });
}
