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
        $invoiceController = new InvoiceController();
        $invoiceController->generateInvoice($request, $appointment->id);

        return response()->json([
            'message' => 'Paiement confirmé avec succès',
            'appointment' => $appointment
        ]);
    }

    /**
     * Create a Stripe Payment Intent (Online Payment)
     */
    public function createPaymentIntent(Request $request, $appointmentId)
    {
        $appointment = Appointment::findOrFail($appointmentId);
        
        // Example check to avoid double paying
        if ($appointment->payment_status === 'paid') {
            return response()->json(['message' => 'Ce rendez-vous est déjà payé.'], 400);
        }

        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Amount needs to be dynamic based on your logic, we'll use a fixed value * 100 for cents here
        $amountInCents = 150 * 100;

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'mad', // Moroccan Dirham or 'usd' / 'eur'
                'metadata' => ['appointment_id' => $appointment->id],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'appointment_id' => $appointment->id
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Webhook or callback handler for Stripe success
     */
    public function confirmStripePayment(Request $request)
    {
        // For security, you should use Stripe Webhooks. 
        // This is a simplified callback for demonstration.
        $appointmentId = $request->input('appointment_id');
        
        $appointment = Appointment::findOrFail($appointmentId);
        $appointment->payment_status = 'paid';
        $appointment->payment_method = 'online';
        $appointment->save();

        // Generate invoice automatically
        $invoiceController = new InvoiceController();
        $invoiceController->generateInvoice($request, $appointment->id);

        return response()->json(['message' => 'Paiement en ligne confirmé.']);
    }
}
