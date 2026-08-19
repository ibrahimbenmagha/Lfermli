import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Radio, Phone, User, Check, Clock } from 'lucide-react';
import axios from '@/axiosConfig';
import { toast } from 'sonner';

interface SOSAlert {
  id: number;
  patient_id: number;
  latitude: number;
  longitude: number;
  status: 'active' | 'in_progress' | 'resolved';
  notes?: string;
  created_at: string;
  patient?: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  };
  responder?: {
    id: number;
    name: string;
  };
}

export const SOSNurseWatcher: React.FC = () => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActiveAlerts = async () => {
    try {
      const response = await axios.get('/api/sos/alerts');
      const data = response.data?.data || [];
      setAlerts(data);
    } catch (err) {
      console.warn('Error fetching SOS alerts:', err);
    }
  };

  useEffect(() => {
    fetchActiveAlerts();
    // Poll every 12 seconds for active SOS alerts
    const interval = setInterval(fetchActiveAlerts, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptAlert = async (alertId: number) => {
    setLoading(true);
    try {
      await axios.post(`/api/sos/accept/${alertId}`);
      toast.success('Vous avez pris en charge cette urgence ! Le patient est notifié.');
      fetchActiveAlerts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la prise en charge');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    setLoading(true);
    try {
      await axios.post(`/api/sos/resolve/${alertId}`);
      toast.success('Urgence clôturée avec succès.');
      fetchActiveAlerts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la clôture');
    } finally {
      setLoading(false);
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={`border-2 transition-all ${
            alert.status === 'active'
              ? 'border-red-500 bg-red-50/70 shadow-lg shadow-red-500/10 animate-pulse'
              : 'border-amber-400 bg-amber-50/50'
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-red-600 text-white rounded-full">
                  <Radio className="h-5 w-5 animate-spin" />
                </span>
                <div>
                  <CardTitle className="text-red-700 text-base font-bold flex items-center gap-2">
                    <span>🚨 ALERTE URGENCE SOS PATIENT</span>
                    {alert.status === 'in_progress' && (
                      <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                        Pris en charge
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>Reçue il y a {Math.round((Date.now() - new Date(alert.created_at).getTime()) / 60000)} min</span>
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-3 rounded-lg border border-red-100 mb-3">
              <div>
                <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-red-500" />
                  <span>Patient : {alert.patient?.name || 'Patient Anonyme'}</span>
                </p>
                {alert.patient?.phone && (
                  <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-1">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <a href={`tel:${alert.patient.phone}`} className="text-blue-600 hover:underline font-medium">
                      {alert.patient.phone}
                    </a>
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span>Position GPS : {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                </p>
                <p className="text-xs italic text-gray-700 mt-1 bg-slate-50 p-1.5 rounded">
                  "{alert.notes || 'Demande de soins immédiate'}"
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`, '_blank')}
              >
                <MapPin className="h-3.5 w-3.5 mr-1" />
                Itinéraire GPS
              </Button>

              {alert.status === 'active' ? (
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                  onClick={() => handleAcceptAlert(alert.id)}
                  disabled={loading}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Accepter & Intervenir
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  onClick={() => handleResolveAlert(alert.id)}
                  disabled={loading}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Marquer comme résolu
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SOSNurseWatcher;
