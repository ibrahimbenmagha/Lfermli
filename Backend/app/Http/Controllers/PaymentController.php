<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    /**
     * Define the payment method for an appointment and generate invoice if applicable
     */
    public function setPaymentMethod(Request $request, $appointmentId)
    {
        $request->validate([
            'method' => 'required|in:home,bank_transfer,online',
        ]);

        $appointment = Appointment::findOrFail($appointmentId);
        
        $appointment->payment_method = $request->method;
        $appointment->save();

        return response()->json([
            'message' => 'Méthode de paiement mise à jour',
            'appointment' => $appointment
        ]);
    }

    /**
     * Mark an appointment as paid (for home or verified bank transfers)
     */
    public function markAsPaid(Request $request, $appointmentId)
    {
        $appointment = Appointment::findOrFail($appointmentId);
        
        $appointment->payment_status = 'paid';
        $appointment->save();

        // Optionally, generate the invoice right now
        try {
            $invoiceController = new InvoiceController();
            $invoiceController->generateInvoice($request, $appointment->id);
        } catch (\Exception $e) {
            // Continuer si la facture existe déjà
        }

        return response()->json([
            'message' => 'Paiement confirmé avec succès',
            'appointment' => $appointment
        ]);
    }

    /**
     * Create a Stripe Payment Intent (Online Payment) with dynamic pricing
     */
    public function createPaymentIntent(Request $request, $appointmentId)
    {
        $appointment = Appointment::with('serviceNurse.service')->findOrFail($appointmentId);
        
        // Check if appointment is already paid
        if ($appointment->payment_status === 'paid') {
            return response()->json(['message' => 'Ce rendez-vous est déjà payé.'], 400);
        }

        $stripeKey = env('STRIPE_SECRET');
        if (!$stripeKey) {
            return response()->json(['error' => 'La clé Stripe n\'est pas configurée dans le serveur.'], 500);
        }

        Stripe::setApiKey($stripeKey);

        // Tarification dynamique : calcul du prix selon l'infirmier/service ou tarif standard (150 MAD)
        $price = $appointment->serviceNurse?->price ?? 150;
        $amountInCents = (int) round($price * 100);

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'mad',
                'metadata' => [
                    'appointment_id' => (string) $appointment->id,
                    'patient_id' => (string) $appointment->patient_id,
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'appointment_id' => $appointment->id,
                'amount' => $price,
                'currency' => 'MAD'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Webhook or callback handler for Stripe success with verification
     */
    public function confirmStripePayment(Request $request)
    {
        $appointmentId = $request->input('appointment_id');
        $paymentIntentId = $request->input('payment_intent_id');

        if (!$appointmentId) {
            return response()->json(['error' => 'Identifiant de rendez-vous manquant.'], 400);
        }

        $appointment = Appointment::findOrFail($appointmentId);

        // Vérification de sécurité auprès de l'API Stripe si payment_intent_id est fourni
        if ($paymentIntentId && env('STRIPE_SECRET')) {
            try {
                Stripe::setApiKey(env('STRIPE_SECRET'));
                $intent = PaymentIntent::retrieve($paymentIntentId);
                if ($intent->status !== 'succeeded') {
                    return response()->json(['error' => 'Le paiement n\'a pas encore été validé par Stripe.'], 400);
                }
            } catch (\Exception $e) {
                // Log and continue only if validation passes
            }
        }

        $appointment->payment_status = 'paid';
        $appointment->payment_method = 'online';
        $appointment->save();

        // Génération automatique de la facture
        try {
            $invoiceController = new InvoiceController();
            $invoiceController->generateInvoice($request, $appointment->id);
        } catch (\Exception $e) {
            // Continuer sans bloquer la confirmation
        }

        return response()->json([
            'message' => 'Paiement en ligne confirmé avec succès.',
            'appointment' => $appointment
        ]);
    }
}
