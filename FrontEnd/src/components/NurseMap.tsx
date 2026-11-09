import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Star, ShieldCheck, Phone, Calendar, Search } from 'lucide-react';
import axios from '@/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NurseMapItem {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  email: string;
  photo?: string;
  city: string;
  zone: string;
  note_over_5: number;
  is_verified: boolean;
  latitude: number;
  longitude: number;
  distance_km: number;
  services: { id: number; name: string; price: number }[];
}

export const NurseMap: React.FC<{ initialCity?: string; selectedServiceId?: number }> = ({
  selectedServiceId,
}) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [nurses, setNurses] = useState<NurseMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number }>({ lat: 33.5731, lng: -7.5898 });
  const [selectedNurse, setSelectedNurse] = useState<NurseMapItem | null>(null);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const navigate = useNavigate();

  // Fetch nurses for map
  const fetchMapNurses = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const params: any = { lat, lng };
      if (selectedServiceId) params.service_id = selectedServiceId;

      const response = await axios.get('/auth/getNearbyNursesForMap', { params });
      if (response.data?.success) {
        setNurses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching map nurses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(coords);
          fetchMapNurses(coords.lat, coords.lng);
        },
        () => {
          fetchMapNurses(33.5731, -7.5898);
        }
      );
    } else {
      fetchMapNurses(33.5731, -7.5898);
    }
  }, [selectedServiceId]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([userPos.lat, userPos.lng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([userPos.lat, userPos.lng]);
    }
  }, [userPos]);

  // Update Markers on nurses list change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Add User position marker (Blue pulse)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="background-color: #2563eb; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(37,99,235,0.8);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([userPos.lat, userPos.lng], { icon: userIcon })
      .bindPopup(`<b>${t('map.my_location', 'Votre position actuelle')}</b>`)
      .addTo(markersLayerRef.current);

    // 2. Add Nurse Markers (Green pin / Verified badge)
    const filteredNurses = onlyVerified ? nurses.filter((n) => n.is_verified) : nurses;

    filteredNurses.forEach((nurse) => {
      const isVerif = nurse.is_verified;
      const markerColor = isVerif ? '#059669' : '#0284c7';

      const nurseIcon = L.divIcon({
        className: 'custom-nurse-marker',
        html: `
          <div style="background-color: ${markerColor}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.25); font-weight: bold; cursor: pointer;">
            ${isVerif ? '✓' : '🩺'}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([nurse.latitude, nurse.longitude], { icon: nurseIcon });
      marker.on('click', () => {
        setSelectedNurse(nurse);
      });

      marker.bindPopup(`
        <div style="min-width: 160px; font-family: sans-serif;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${nurse.name}</div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">${nurse.city} - ${nurse.zone}</div>
          <div style="font-size: 12px; color: #059669; font-weight: 600;">⭐ ${nurse.note_over_5}/5 • ${nurse.distance_km} km</div>
        </div>
      `);

      marker.addTo(markersLayerRef.current!);
    });
  }, [nurses, onlyVerified, userPos]);

  return (
    <Card className="overflow-hidden border shadow-xl rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-teal-600" />
              <span>{t('map.title', 'Carte Interactive des Infirmiers')}</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              {t('map.subtitle', 'Visualisez en temps réel les praticiens disponibles autour de vous.')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={onlyVerified ? 'default' : 'outline'}
              className={`text-xs ${onlyVerified ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
              onClick={() => setOnlyVerified(!onlyVerified)}
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              <span>{t('map.verified_only', 'Certifiés uniquement')}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Leaflet Map container */}
        <div className="lg:col-span-2 relative h-[420px] w-full">
          <div ref={mapContainerRef} className="h-full w-full z-0" />

          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white px-4 py-2 rounded-full shadow-md">
                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span>Chargement des infirmiers sur la carte...</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected or nearest nurse detail sidebar */}
        <div className="p-4 bg-slate-50 border-t lg:border-t-0 lg:border-l flex flex-col justify-between h-[420px] overflow-y-auto">
          {selectedNurse ? (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg border-2 border-teal-500/20 shrink-0">
                  {selectedNurse.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-snug">{selectedNurse.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-red-500" />
                    <span>{selectedNurse.city} ({selectedNurse.zone})</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {selectedNurse.note_over_5} / 5
                    </span>
                    <Badge variant="outline" className="text-xs text-slate-600">
                      {selectedNurse.distance_km} km
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedNurse.is_verified && (
                <div className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium border border-emerald-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Infirmier Certifié & Diplôme Vérifié</span>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1.5">Prestations proposées :</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNurse.services.map((svc) => (
                    <span
                      key={svc.id}
                      className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-700 font-medium"
                    >
                      {svc.name} <strong className="text-teal-700">({svc.price} MAD)</strong>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs"
                  onClick={() => navigate(`/patient/booking?nurseId=${selectedNurse.id}`)}
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  {t('map.book', 'Prendre Rendez-vous')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => setSelectedNurse(null)}
                >
                  Voir tous les infirmiers ({nurses.length})
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Infirmiers à proximité ({nurses.length})
                </h4>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {nurses.slice(0, 5).map((nurse) => (
                  <div
                    key={nurse.id}
                    onClick={() => setSelectedNurse(nurse)}
                    className="bg-white p-2.5 rounded-xl border border-slate-200/80 hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {nurse.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{nurse.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{nurse.city}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-teal-700 block">
                        {nurse.distance_km} km
                      </span>
                      {nurse.is_verified && (
                        <span className="text-[10px] text-emerald-600 font-semibold">Vérifié ✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NurseMap;
