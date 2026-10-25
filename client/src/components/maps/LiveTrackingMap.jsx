import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { calculateHaversineDistance } from '../../utils/geo';

// Breakdown user marker icon (red)
const breakdownMarkerIcon = L.divIcon({
  className: 'custom-breakdown-marker',
  html: `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: rgba(225, 29, 72, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background-color: #e11d48; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 10px; font-weight: bold;">SOS</span>
      </div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Partner vehicle marker icon (blue)
const partnerMarkerIcon = L.divIcon({
  className: 'custom-partner-marker',
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #2563eb; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.35); display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12v4h2"></path>
          <circle cx="6.5" cy="16.5" r="2.5"></circle>
          <circle cx="16.5" cy="16.5" r="2.5"></circle>
        </svg>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Auto bounds adjuster
const FitBounds = ({ userCoords, partnerCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (userCoords && partnerCoords) {
      const bounds = L.latLngBounds([
        [userCoords[1], userCoords[0]],
        [partnerCoords[1], partnerCoords[0]],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (userCoords) {
      map.setView([userCoords[1], userCoords[0]], 14);
    }
  }, [userCoords, partnerCoords, map]);

  return null;
};

export const LiveTrackingMap = ({
  userCoords, // [longitude, latitude]
  partnerCoords, // [longitude, latitude]
  partnerName = 'Mechanic En Route',
  className = 'h-96 w-full',
}) => {
  const defaultPos = userCoords || [77.2090, 28.6139];
  const distanceKm = userCoords && partnerCoords ? calculateHaversineDistance(userCoords, partnerCoords) : null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-md">
      <div className={className}>
        <MapContainer
          center={[defaultPos[1], defaultPos[0]]}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds userCoords={userCoords} partnerCoords={partnerCoords} />

          {/* User Breakdown Marker */}
          {userCoords && (
            <Marker position={[userCoords[1], userCoords[0]]} icon={breakdownMarkerIcon}>
              <Popup>
                <div className="text-xs font-semibold text-slate-800">
                  <p className="text-emergency-600 font-bold">Your Breakdown Location</p>
                  <p className="text-[11px] text-slate-500">Awaiting roadside assistance</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Partner Vehicle Marker */}
          {partnerCoords && (
            <Marker position={[partnerCoords[1], partnerCoords[0]]} icon={partnerMarkerIcon}>
              <Popup>
                <div className="text-xs font-semibold text-slate-800">
                  <p className="text-brand-600 font-bold">{partnerName}</p>
                  <p className="text-[11px] text-slate-500">Live GPS position</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Straight-line connector */}
          {userCoords && partnerCoords && (
            <Polyline
              positions={[
                [userCoords[1], userCoords[0]],
                [partnerCoords[1], partnerCoords[0]],
              ]}
              color="#2563eb"
              weight={3}
              dashArray="6, 8"
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>

      {/* Real-time distance info card */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur px-3 py-2 rounded-xl shadow-md border border-slate-200">
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Estimated Distance</p>
        <p className="text-lg font-black text-slate-900">
          {distanceKm !== null ? `${distanceKm} km away` : 'Connecting to GPS...'}
        </p>
        <p className="text-[10px] text-slate-500">Straight-line estimate. Real road travel time depends on traffic.</p>
      </div>
    </div>
  );
};
