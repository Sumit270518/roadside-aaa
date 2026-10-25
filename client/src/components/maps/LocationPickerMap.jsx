import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin } from 'lucide-react';

// Custom breakdown pin divIcon
const userMarkerIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(225, 29, 72, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background-color: #e11d48; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: white;"></span>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to handle map clicks
const LocationClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
};

// Component to recenter map when coordinates change
const ChangeView = ({ center }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView([center[1], center[0]], map.getZoom());
    }
  }, [center, map]);
  return null;
};

export const LocationPickerMap = ({ coordinates, onChange, className = 'h-72 w-full' }) => {
  // coordinates is [longitude, latitude]
  const [position, setPosition] = useState(coordinates || [77.2090, 28.6139]);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    if (coordinates && coordinates.length === 2) {
      setPosition(coordinates);
    }
  }, [coordinates]);

  const handleSelect = (newCoords) => {
    setPosition(newCoords);
    if (onChange) onChange(newCoords);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = [pos.coords.longitude, pos.coords.latitude];
        handleSelect(detected);
        setDetecting(false);
      },
      (err) => {
        console.warn('Geolocation denied or error:', err.message);
        alert('Could not detect location. Please click directly on the map to set your vehicle pin.');
        setDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const centerLat = position[1];
  const centerLng = position[0];

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm">
      <div className={className}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationClickHandler onLocationSelect={handleSelect} />
          <ChangeView center={position} />
          <Marker position={[centerLat, centerLng]} icon={userMarkerIcon} />
        </MapContainer>
      </div>

      {/* Floating GPS Button */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col space-y-2">
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-slate-800 text-xs font-semibold shadow-md hover:bg-white transition border border-slate-200"
        >
          <Crosshair className={`w-3.5 h-3.5 text-brand-600 ${detecting ? 'animate-spin' : ''}`} />
          <span>{detecting ? 'Locating...' : 'Use My GPS'}</span>
        </button>
      </div>

      {/* Coordinate status tag */}
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur px-2.5 py-1 rounded text-[11px] font-mono text-slate-700 shadow border border-slate-200 flex items-center space-x-1">
        <MapPin className="w-3 h-3 text-emergency-600 shrink-0" />
        <span>{position[1].toFixed(5)}, {position[0].toFixed(5)}</span>
      </div>
    </div>
  );
};
