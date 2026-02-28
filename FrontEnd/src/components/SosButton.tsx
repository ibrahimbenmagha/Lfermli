import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/axiosConfig';

const SosButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSOS = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erreur",
        description: "La géolocalisation n'est pas supportée par votre navigateur.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await axiosInstance.post('sos/trigger', { latitude, longitude });
          
          toast({
            title: "SOS Envoyé !",
            description: "Votre position a été envoyée aux infirmiers les plus proches.",
            variant: "destructive",
          });
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible d'envoyer l'alerte SOS.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        toast({
          title: "Erreur de localisation",
          description: "Veuillez autoriser l'accès à votre position pour utiliser le SOS.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-bounce">
      <Button
        variant="destructive"
        size="lg"
        className="h-20 w-20 rounded-full shadow-2xl border-4 border-white hover:scale-110 transition-transform flex flex-col items-center justify-center gap-1"
        onClick={handleSOS}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <>
            <AlertTriangle className="h-8 w-8" />
            <span className="text-xs font-bold leading-none">SOS</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default SosButton;
