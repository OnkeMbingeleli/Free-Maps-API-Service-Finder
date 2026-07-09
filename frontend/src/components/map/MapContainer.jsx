import { useEffect, useMemo, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle, Rectangle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const containerStyle = { width: '100%', height: '100%', minHeight: '560px', borderRadius: '1rem', overflow: 'hidden' };
const TYPE_COLORS = {
  hospital: '#ef4444',
  clinic: '#f87171',
  police: '#3b82f6',
  fire_station: '#f97316',
  school: '#a855f7',
  library: '#10b981',
  shelter: '#f59e0b',
  default: '#64748b',
};

function MapEvents({ onMapClick, center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      onMapClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

export default function MapContainer({ services = [], center = { lat: -33.9249, lng: 18.4241 }, onMapClick, selectedService, onSelectService }) {
  const mapCenter = useMemo(() => [center.lat, center.lng], [center]);
  const bounds = useMemo(() => {
    const offset = 0.09;
    return [
      [center.lat - offset, center.lng - offset],
      [center.lat + offset, center.lng + offset],
    ];
  }, [center]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <LeafletMap center={mapCenter} zoom={13} style={containerStyle}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapEvents onMapClick={onMapClick} center={mapCenter} />

        <Rectangle bounds={bounds} pathOptions={{ color: '#38bdf8', weight: 2, opacity: 0.25, fillOpacity: 0.03 }} />

        <Circle
          center={mapCenter}
          radius={100}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#38bdf8', fillOpacity: 1 }}
        />

        {services.map((service) => (
          <Marker
            key={service.id}
            position={[service.lat, service.lng]}
            eventHandlers={{ click: () => onSelectService?.(service) }}
          >
            <Popup>
              <div style={{ color: '#0f172a', minWidth: '180px' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{service.name}</h3>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748b' }}>{service.address}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <a
                    href={`https://waze.com/ul?ll=${service.lat},${service.lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0284c7', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Waze directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMap>
    </div>
  );
}
