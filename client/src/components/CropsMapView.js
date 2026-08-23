import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon paths in React/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom green farmer marker icon
const farmerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom user location blue marker
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const CropsMapView = ({ crops = [], userLocation = null, onClose }) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center to user location or Maharashtra center (19.7515, 75.7139)
    const initialLat = userLocation?.latitude || 18.5204;
    const initialLon = userLocation?.longitude || 73.8567;
    const initialZoom = userLocation ? 9 : 7;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLon], initialZoom);
    mapInstanceRef.current = map;

    // Free OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    const markersGroup = L.featureGroup();

    // Add User Location Marker
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #2563eb; font-size: 13px;">📍 ${t('location.nearMe', 'Your Current Location')}</strong>
            <p style="margin: 4px 0 0 0; color: #64748b;">Searching for produce near here</p>
          </div>
        `);
      markersGroup.addLayer(userMarker);
    }

    // Add Crop Markers
    crops.forEach((crop) => {
      const coords = crop.location?.coordinates;
      if (coords && coords.latitude && coords.longitude) {
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 180px; padding: 2px;">
            <div style="font-weight: bold; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
              ${crop.name} ${crop.quality?.organic ? '🌱' : ''}
            </div>
            <div style="font-size: 12px; color: #047857; font-weight: bold; margin-bottom: 2px;">
              ₹${crop.price?.perUnit || 0} / ${crop.quantity?.unit || 'kg'}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              📍 ${crop.location?.district || crop.location?.state || 'Maharashtra'}
              ${crop.distance ? ` (${crop.distance} km away)` : ''}
            </div>
            <a href="/crop/${crop._id}" style="display: inline-block; background: #059669; color: white; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
              ${t('dashboard.viewDetails', 'View Details')} →
            </a>
          </div>
        `;

        const marker = L.marker([coords.latitude, coords.longitude], { icon: farmerIcon })
          .bindPopup(popupContent);
        markersGroup.addLayer(marker);
      }
    });

    markersGroup.addTo(map);

    // Fit map bounds to show all markers if any exist
    if (markersGroup.getLayers().length > 0) {
      try {
        map.fitBounds(markersGroup.getBounds().pad(0.15));
      } catch (e) {
        // Safe fallback if only 1 point exists
      }
    }

    return () => {
      map.remove();
    };
  }, [crops, userLocation, t]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col h-[85vh] animate-scale-up">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">
                {t('marketplace.mapView', 'Produce Map View')}
              </h3>
              <p className="text-xs text-slate-400">
                {crops.length} {t('marketplace.cropsAvailable', 'Crops Available')} (OpenStreetMap / GPS)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Leaflet Container */}
        <div className="flex-1 w-full h-full relative">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '350px' }} />

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-slate-200/80 text-xs space-y-1.5 pointer-events-auto">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
              <span className="font-bold text-slate-800">Farmer Produce Location</span>
            </div>
            {userLocation && (
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-sm"></span>
                <span className="font-bold text-slate-800">Your Current GPS</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CropsMapView;
