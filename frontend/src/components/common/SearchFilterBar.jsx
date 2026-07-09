import { useState } from 'react';

const SERVICE_TYPES = [
  'all',
  'clinic',
  'hospital',
  'library',
  'shelter',
  'police',
  'fire_station',
  'pharmacy',
  'school',
  'community_center',
  'social_services',
  'mental_health',
  'disability_services',
];

function prettyLabel(value) {
  if (value === 'all') return 'All';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function SearchFilterBar({ search, setSearch, activeType, setActiveType, onPlaceSelected }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Free Geocoding via Nominatim (OpenStreetMap)
  const handleSearch = async (val) => {
    setSearch(val);
    if (val.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=za&limit=5`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectPlace = (place) => {
    const loc = {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      name: place.display_name
    };
    onPlaceSelected?.(loc);
    setSearch(place.display_name);
    setResults([]);
  };

  return (
    <section
      style={{
        display: 'grid',
        gap: '0.85rem',
        padding: '1rem',
        borderRadius: '1rem',
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}
    >
      <div style={{ position: 'relative' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0.5rem',
            padding: '0.8rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <span aria-hidden="true">🔎</span>
          <input
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search addresses or towns in RSA..."
            aria-label="Search services"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#e2e8f0',
              fontSize: '1rem',
            }}
          />
          {loading && <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>⌛</span>}
        </label>

        {results.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            listStyle: 'none',
            padding: 0,
            margin: '0.5rem 0 0 0',
            zIndex: 2000,
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            {results.map((r, i) => (
              <li key={i}>
                <button
                  onClick={() => selectPlace(r)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    color: '#e2e8f0',
                    padding: '0.8rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    borderBottom: '1px solid #334155'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(56, 189, 248, 0.1)'}
                  onMouseOut={(e) => e.target.style.background = 'transparent'}
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'flex-start',
        }}
      >
        {SERVICE_TYPES.map((type) => {
          const active = activeType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.8rem',
                borderRadius: '0.4rem',
                background: active ? '#38bdf8' : 'rgba(56, 189, 248, 0.1)',
                color: active ? '#0f172a' : '#38bdf8',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              {prettyLabel(type)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
