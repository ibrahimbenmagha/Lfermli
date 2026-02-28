<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', 'Helvetica', sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            font-size: 16px;
            line-height: 24px;
        }
        .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
            border-collapse: collapse;
        }
        .invoice-box table td {
            padding: 5px;
            vertical-align: top;
        }
        .invoice-box table tr td:nth-child(2) {
            text-align: right;
        }
        .invoice-box table tr.top table td {
            padding-bottom: 20px;
        }
        .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
        }
        .invoice-box table tr.information table td {
            padding-bottom: 40px;
        }
        .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
        }
        .invoice-box table tr.details td {
            padding-bottom: 20px;
        }
        .invoice-box table tr.item td {
            border-bottom: 1px solid #eee;
        }
        .invoice-box table tr.item.last td {
            border-bottom: none;
        }
        .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <h1>Lfermli - Facture</h1>
        </div>

        <table cellpadding="0" cellspacing="0">
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title">
                                <!-- Logo could go here -->
                                <h2>Lfermli</h2>
                            </td>
                            
                            <td>
                                Facture N°: {{ $invoice->invoice_number }}<br>
                                Date de création: {{ $invoice->created_at->format('d/m/Y') }}<br>
                                Statut: {{ ucfirst($invoice->status) }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <tr class="information">
                <td colspan="2">
                    <table>
                        <tr>
                            <td>
                                <strong>Prestataire:</strong><br>
                                Lfermli Soins à Domicile<br>
                                contact@lfermli.com
                            </td>
                            
                            <td>
                                <strong>Patient:</strong><br>
                                {{ $appointment->patient->user->nom ?? 'Nom Inconnu' }} {{ $appointment->patient->user->prenom ?? '' }}<br>
                                {{ $appointment->adress ?? 'Adresse non spécifiée' }}<br>
                                Tel: {{ $appointment->patient->user->telephone ?? 'Non spécifié' }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            
            <tr class="heading">
                <td>Détails du Service</td>
                <td>Montant</td>
            </tr>
            
            <tr class="item">
                <td>
                    Service infirmier: {{ $appointment->serviceNurse->service->titre ?? 'Service de soins' }}<br>
                    <small>Date du rendez-vous: {{ \Carbon\Carbon::parse($appointment->apointementsDate)->format('d/m/Y H:i') }}</small>
                </td>
                <td>{{ number_format($invoice->amount, 2) }} MAD</td>
            </tr>
            
            <tr class="total">
                <td></td>
                <td>
                   Total: {{ number_format($invoice->amount, 2) }} MAD
                </td>
            </tr>
            
            <tr class="details">
                <td>
                    <br><br>
                    <strong>Méthode de paiement:</strong> {{ ucfirst($appointment->payment_method) }}<br>
                    <strong>Infirmier assigné:</strong> {{ $appointment->serviceNurse->nurse->user->nom ?? '' }} {{ $appointment->serviceNurse->nurse->user->prenom ?? '' }}
                </td>
                <td></td>
            </tr>
        </table>
        
        <div class="footer">
            <p>Merci pour votre confiance.</p>
            <p>Lfermli - Votre santé à domicile</p>
        </div>
    </div>
</body>
</html>
