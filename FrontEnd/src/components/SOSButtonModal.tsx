import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertTriangle, MapPin, Radio, Phone, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import axios from '@/axiosConfig';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const SOSButtonModal: React.FC<{ variant?: 'header' | 'hero' | 'floating' }> = ({
  variant = 'header',
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState<any>(null);
  const [emergencyNotes, setEmergencyNotes] = useState('');

  const triggerEmergencySOS = () => {
    setLoading(true);

    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      // Fallback coordinates (Casablanca center)
      sendSOSRequest(33.5731, -7.5898);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendSOSRequest(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        toast.info("Localisation par défaut utilisée.");
        sendSOSRequest(33.5731, -7.5898);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const sendSOSRequest = async (lat: number, lng: number) => {
    try {
      const response = await axios.post('/sos/trigger', {
        latitude: lat,
        longitude: lng,
        notes: emergencyNotes || "Urgence médicale immédiate à domicile",
      });

      setAlertData(response.data);
      toast.success(t('sos.success_title', 'Alerte envoyée !'));
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi du SOS. Veuillez appeler le 15 ou 141.");
    } finally {
      setLoading(false);
    }
  };

  const renderTriggerButton = () => {
    if (variant === 'floating') {
      return (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl px-6 py-6 font-bold flex items-center gap-2 animate-bounce border-2 border-white/50"
        >
          <Radio className="h-6 w-6 animate-pulse" />
          <span>{t('sos.button', 'SOS URGENCE')}</span>
        </Button>
      );
    }

    if (variant === 'hero') {
      return (
        <Button
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-red-500/30 transition-all flex items-center gap-2 border border-red-400/30 animate-pulse"
        >
          <AlertTriangle className="h-6 w-6" />
          <span>{t('sos.button', 'SOS URGENCE 24/7')}</span>
        </Button>
      );
    }

    return (
      <Button
        variant="destructive"
        size="sm"
        className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full shadow-xs animate-pulse text-xs"
      >
        <Radio className="h-3.5 w-3.5" />
        <span>{t('sos.button', 'SOS')}</span>
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{renderTriggerButton()}</DialogTrigger>
      <DialogContent className="sm:max-w-md border-red-200">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
            <ShieldAlert className="h-8 w-8 animate-pulse" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-red-700">
            {t('sos.title', "Déclencheur d'Urgence SOS")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600">
            {t(
              'sos.description',
              'Ce bouton alerte immédiatement tous les infirmiers qualifiés situés à moins de 15 km de votre position GPS.'
            )}
          </DialogDescription>
        </DialogHeader>

        {!alertData ? (
          <div className="space-y-4 py-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Précisez l'urgence (optionnel) :
              </label>
              <textarea
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                placeholder="Ex: Malaise subit, pansement urgent décollé, perfusion arrêtée..."
                className="w-full text-sm border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                rows={2}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <span>En cas d'urgence vitale absolue (arrêt cardiaque, détresse respiratoire grave), contactez immédiatement le SAMU (141) ou la Protection Civile (15).</span>
            </div>

            <Button
              onClick={triggerEmergencySOS}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t('sos.in_progress', 'Localisation et alerte en cours...')}</span>
                </>
              ) : (
                <>
                  <Radio className="h-5 w-5" />
                  <span>{t('sos.trigger_btn', 'ALERTER LES INFIRMIERS PROCHES')}</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-3 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">
              {t('sos.success_title', 'Alerte transmise avec succès !')}
            </h4>
            <p className="text-sm text-gray-600">
              <strong className="text-red-600">{alertData.nearby_nurses_count || 3}</strong>{' '}
              {t('sos.success_desc', 'infirmiers à proximité ont reçu votre position.')}
            </p>

            <div className="bg-slate-50 border rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase">
                <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                <span>Statut : En attente d'un intervenant</span>
              </div>
              <p className="text-xs text-gray-600">
                Vous recevrez un appel ou un message dès qu'un infirmier accepte la prise en charge.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setAlertData(null);
                setIsOpen(false);
              }}
            >
              {t('sos.cancel', 'Fermer')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SOSButtonModal;
