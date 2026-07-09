import { useState } from 'react';

export default function SOSButton({ userLocation }) {
  const [loading, setLoading] = useState(false);

  const triggerSOS = async () => {
    setLoading(true);

    const message = `EMERGENCY SOS\n\nI am not safe.\nLocation: https://www.openstreetmap.org/?mlat=${userLocation.lat}&mlon=${userLocation.lng}#map=18/${userLocation.lat}/${userLocation.lng}\nCoordinates: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}\n\nPlease send help immediately!`;

    // 1. Social Media Trigger (Simulated via Web Share API or direct X/FB Intents)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency SOS',
          text: message,
          url: window.location.href,
        });
      } catch (err) {
        console.log('User cancelled share');
      }
    } else {
      // Fallback: Open WhatsApp with the message
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }

    setLoading(false);
  };

  return (
    <button
      onClick={triggerSOS}
      disabled={loading}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '2rem',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #ef4444, #991b1b)',
        border: '2px solid white',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
        animation: 'pulse 2s infinite'
      }}
    >
      {loading ? '...' : 'SOS'}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}
      </style>
    </button>
  );
}
