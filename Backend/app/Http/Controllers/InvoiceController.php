<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    /**
     * Generate an invoice for a specific appointment
     */
    public function generateInvoice(Request $request, $appointmentId)
    {
        $appointment = Appointment::with(['patient.user', 'serviceNurse.nurse.user', 'serviceNurse.service'])->find($appointmentId);

        if (!$appointment) {
            return response()->json(['message' => 'Rendez-vous introuvable'], 404);
        }

        // Check if invoice already exists
        $invoice = Invoice::where('appointment_id', $appointmentId)->first();
        
        if (!$invoice) {
            // Example flat rate or fetch from service if service has price
            // $amount = $appointment->serviceNurse->service->price ?? 150.00;
            $amount = 150.00; // Hardcoded default for example

            $invoice = Invoice::create([
                'appointment_id' => $appointment->id,
                'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
                'amount' => $amount,
                'status' => $appointment->payment_status === 'paid' ? 'paid' : 'pending',
            ]);
        } else {
             // Update status if needed
             if($appointment->payment_status === 'paid' && $invoice->status !== 'paid'){
                 $invoice->status = 'paid';
                 $invoice->save();
             }
        }

        // Generate PDF
        $html = view('pdf.invoice', compact('invoice', 'appointment'))->render();

        $options = new Options();
        $options->set('defaultFont', 'Helvetica');
        
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $output = $dompdf->output();
        
        // Save PDF to storage
        $pdfFileName = 'invoices/' . $invoice->invoice_number . '.pdf';
        Storage::disk('public')->put($pdfFileName, $output);

        // Update DB
        $invoice->pdf_path = '/storage/' . $pdfFileName;
        $invoice->save();

        return response()->json([
            'message' => 'Facture générée avec succès',
            'invoice' => $invoice
        ]);
    }

    /**
     * Download or view the PDF
     */
    public function downloadInvoice($id)
    {
        $invoice = Invoice::find($id);

        if (!$invoice || !$invoice->pdf_path) {
            return response()->json(['message' => 'Facture introuvable'], 404);
        }

        $filePath = str_replace('/storage/', '', $invoice->pdf_path);
        
        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }

        return Storage::disk('public')->download($filePath);
    }
}
