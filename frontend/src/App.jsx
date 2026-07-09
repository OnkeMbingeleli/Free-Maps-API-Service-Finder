import { useEffect, useMemo, useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import MapContainer from './components/map/MapContainer';
import SearchFilterBar from './components/common/SearchFilterBar';
import { saveServiceSuggestion } from './config/firestore';

const DEFAULT_CENTER = { lat: -33.9249, lng: 18.4241 };
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const FALLBACK_SERVICES = [
  { id: 'ct-library', name: 'Cape Town Central Library', type: 'library', address: 'Old Drill Hall, Cnr Parade & Darling St', lat: -33.9248, lng: 18.4241 },
  { id: 'ct-police', name: 'Cape Town Central Police Station', type: 'police', address: 'Buitenkant St, Cape Town', lat: -33.9264, lng: 18.423 },
  { id: 'groote-schuur', name: 'Groote Schuur Hospital', type: 'hospital', address: 'Main Rd, Observatory', lat: -33.9381, lng: 18.4636 },
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function App() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  const [selectedService, setSelectedService] = useState(null);
  const [suggestionPoint, setSuggestionPoint] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadServices();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => setUserLocation(DEFAULT_CENTER)
      );
    }
  }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/services`);
      const data = await response.json();
      setServices(Array.isArray(data) && data.length > 0 ? data : FALLBACK_SERVICES);
    } catch (error) {
      console.error('Failed to load services', error);
      setServices(FALLBACK_SERVICES);
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return services.filter((service) => {
      const typeMatch = activeType === 'all' || service.type === activeType;
      const keywordMatch = !searchTerm || `${service.name} ${service.address ?? ''} ${service.type}`.toLowerCase().includes(searchTerm);
      const distance = calculateDistance(userLocation.lat, userLocation.lng, service.lat, service.lng);
      const radiusMatch = !radius || distance <= radius;

      return typeMatch && keywordMatch && radiusMatch;
    });
  }, [services, search, activeType, radius, userLocation]);

  async function submitSuggestion(event) {
    event.preventDefault();
    if (!suggestionPoint) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get('name'),
      type: formData.get('type'),
      address: formData.get('address'),
      notes: formData.get('notes'),
      lat: suggestionPoint.lat,
      lng: suggestionPoint.lng,
      submittedBy: formData.get('submittedBy') || 'guest',
    };

    await saveServiceSuggestion(payload);
    setSuggestionPoint(null);
    event.currentTarget.reset();
    alert('Suggestion saved to Firestore for review.');
  }

  const visibleCount = filteredServices.length;

  return (
    <AuthProvider>
      <div style={{
        minHeight: '100vh',
        padding: '1rem',
        background: 'radial-gradient(circle at top, #0f172a 0%, #020617 55%, #000 100%)',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: '1rem',
          alignItems: 'start',
        }}>
          <section style={{ display: 'grid', gap: '1rem' }}>
            <header style={{
              background: 'rgba(15, 23, 42, 0.88)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '1.25rem',
              padding: '1.25rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.03em' }}>Service Finder</h1>
                  <p style={{ margin: '0.35rem 0 0', color: '#94a3b8' }}>
                    Leaflet + OpenStreetMap, Nominatim search, Waze deep links, Firestore suggestions
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Radius: {radius} km</div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    style={{ width: 220 }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <SearchFilterBar
                  search={search}
                  setSearch={setSearch}
                  activeType={activeType}
                  setActiveType={setActiveType}
                  onPlaceSelected={setUserLocation}
                />
              </div>
            </header>

            <main style={{ position: 'relative', minHeight: 560 }}>
              <MapContainer
                services={filteredServices}
                center={userLocation}
                onMapClick={setSuggestionPoint}
                selectedService={selectedService}
                onSelectService={setSelectedService}
              />

              {suggestionPoint && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 320,
                  background: '#0f172a',
                  border: '1px solid #38bdf8',
                  borderRadius: '1rem',
                  padding: '1rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
                }}>
                  <h3 style={{ marginTop: 0 }}>Suggest a service</h3>
                  <form onSubmit={submitSuggestion} style={{ display: 'grid', gap: '0.75rem' }}>
                    <input name="name" placeholder="Service name" required />
                    <input name="address" placeholder="Address or landmark" />
                    <input name="submittedBy" placeholder="Your name (optional)" />
                    <select name="type" defaultValue="library">
                      <option value="clinic">Clinic</option>
                      <option value="hospital">Hospital</option>
                      <option value="library">Library</option>
                      <option value="shelter">Shelter</option>
                      <option value="police">Police Station</option>
                      <option value="fire_station">Fire Station</option>
                      <option value="school">School</option>
                    </select>
                    <textarea name="notes" rows="3" placeholder="Notes for the admin" />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit">Save to Firestore</button>
                      <button type="button" onClick={() => setSuggestionPoint(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
            </main>
          </section>

          <aside style={{
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '1.25rem',
            padding: '1rem',
            minHeight: 640,
          }}>
            <h2 style={{ marginTop: 0 }}>Nearby services</h2>
            <p style={{ color: '#94a3b8', marginTop: 0 }}>{visibleCount} results {loading ? 'loading...' : ''}</p>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  style={{
                    cursor: 'pointer',
                    padding: '0.9rem',
                    borderRadius: '0.9rem',
                    background: selectedService?.id === service.id ? 'rgba(56, 189, 248, 0.14)' : 'rgba(30, 41, 59, 0.9)',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                  }}
                >
                  <strong>{service.name}</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{service.type}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: 4 }}>{service.address}</div>
                  <a
                    href={`https://waze.com/ul?ll=${service.lat},${service.lng}&navigate=yes`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-block', marginTop: 8, color: '#38bdf8' }}
                  >
                    Open in Waze
                  </a>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </AuthProvider>
  );
}
