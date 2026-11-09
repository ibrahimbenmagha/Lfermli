import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Loader2 } from 'lucide-react';
import axiosInstance from '@/axiosConfig';

interface StripePaymentFormProps {
  clientSecret: string;
  appointmentId: string;
  onSuccess: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ clientSecret, appointmentId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
        setLoading(false);
        return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      toast({
        title: "Erreur de paiement",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else if (paymentIntent.status === 'succeeded') {
      try {
        await axiosInstance.post('stripe-webhook', {
          appointment_id: appointmentId,
          payment_intent_id: paymentIntent.id,
        });
      } catch (confirmError) {
        console.warn("Notification de paiement au backend:", confirmError);
      }

      toast({
        title: "Paiement réussi",
        description: "Votre paiement a été traité avec succès.",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md bg-white">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }} />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-6 text-lg"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Traitement...</>
        ) : (
          <><CheckCircle className="mr-2 h-5 w-5" /> Payer maintenant</>
        )}
      </Button>
    </form>
  );
};

export default StripePaymentForm;
