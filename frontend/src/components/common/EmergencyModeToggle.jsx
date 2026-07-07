import { useState } from 'react';

// One-tap Emergency Mode: narrows map to hospitals/police/shelters,
// enlarges icons, auto-shares location (blueprint §12 stunning features).
export default function EmergencyModeToggle({ onToggle }) {
  const [active, setActive] = useState(false);

  function handleClick() {
    const next = !active;
    setActive(next);
    onToggle?.(next);
    if (next && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        // Wire this up to your emergency-contact share flow (SMS/WhatsApp)
        console.log('Sharing location:', pos.coords.latitude, pos.coords.longitude);
      });
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`emergency-toggle ${active ? 'active' : ''}`}
      aria-pressed={active}
    >
      {active ? '🚨 Emergency Mode ON' : 'Emergency Mode'}
    </button>
  );
}
