import { useCallback, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import HazardMarker from './HazardMarker';

// Google Maps is the ONLY map provider, per the brief's requirement.
// Waze-style behavior (hazards, ETA, re-routing) is layered on top of it
// using our own Supabase data — see blueprint §6.
const containerStyle = { width: '100%', height: '100%', minHeight: '480px' };
const defaultCenter = { lat: -33.9249, lng: 18.4241 }; // Cape Town fallback

export default function MapContainer({ services = [], hazards = [], onMarkerClick }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY,
  });

  const [map, setMap] = useState(null);
  const onLoad = useCallback((m) => setMap(m), []);
  const onUnmount = useCallback(() => setMap(null), []);

  const center = useMemo(() => defaultCenter, []);

  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {services.map((service) => (
        <MarkerF
          key={service.id}
          position={{ lat: service.lat, lng: service.lng }}
          title={service.name}
          onClick={() => onMarkerClick?.(service)}
        />
      ))}

      {hazards
        .filter((h) => h.status !== 'expired')
        .map((hazard) => (
          <HazardMarker key={hazard.id} hazard={hazard} />
        ))}
    </GoogleMap>
  );
}
