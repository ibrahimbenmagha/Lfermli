<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NursesController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AppointAppointmentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\SOSController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\InvoiceController;

/*
|--------------------------------------------------------------------------
| Public Authentication & Discovery Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    // Auth endpoints with rate limiting
    Route::middleware('throttle:15,1')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('loginpatient', [AuthController::class, 'loginPatient']);
        Route::post('loginnurse', [AuthController::class, 'loginNurse']);
        Route::post('loginadmin', [AuthController::class, 'loginAdmin']);
        Route::post('CreateNurse', [NursesController::class, 'CreateNurse']);
        Route::post('CreatePatient', [PatientController::class, 'CreatePatient']);
    });

    Route::get('checkAuth', [AuthController::class, 'checkAuth']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::put('updatePatient', [PatientController::class, 'updatePatient']);
    Route::post('updatePatientPhoto', [PatientController::class, 'updatePatientPhoto']);

    // Public Nurses & Services queries
    Route::get('GetNursesByServices', [NursesController::class, 'GetNursesByServices']);
    Route::get('getNurseByServiceId', [NursesController::class, 'getNurseByServiceId']);
    Route::get('GetNurseByUserName', [NursesController::class, 'GetNurseByUserName']);
    Route::get('GetAllServices', [ServiceController::class, 'GetAllServices']);
    Route::get('GetAllCities', [ServiceController::class, 'GetAllCities']);
    Route::get('GetAllZones', [ServiceController::class, 'GetAllZones']);

    // Nurse filtering by location & Map view
    Route::get('getNursesByCity', [NursesController::class, 'getNursesByCity']);
    Route::get('getNursesByZone', [NursesController::class, 'getNursesByZone']);
    Route::get('getNursesByServiceAndZone', [NursesController::class, 'getNursesByServiceAndZone']);
    Route::get('getNearbyNursesForMap', [NursesController::class, 'getNearbyNursesForMap']);

    // Availability routes
    Route::get('availability/slots', [AvailabilityController::class, 'getAvailableSlots']);

    // Public reviews
    Route::get('getReviewsByNurse/{nurseId}', [ReviewController::class, 'getReviewsByNurse']);
    Route::get('getNurseAverageRating/{nurseId}', [ReviewController::class, 'getNurseAverageRating']);
});

/*
|--------------------------------------------------------------------------
| Admin Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(["check.role:admin"])->group(function () {
    Route::post('CreateService', [ServiceController::class, 'CreateService']);
    Route::get('GetNurseByUserId', [NursesController::class, 'GetNurseByUserId']);
    Route::get('GetAllNurses', [NursesController::class, 'GetAllNurses']);
    Route::put('toggleNurseStatus', [NursesController::class, 'toggleNurseStatus']);
    Route::put('verifyNurse', [NursesController::class, 'verifyNurse']);

    Route::get('getNurseCount', [AdminController::class, 'getNurseCount']);
    Route::get('getAdminStats', [AdminController::class, 'getAdminStats']);
    Route::get('getRecentAppointments', [AdminController::class, 'getRecentAppointments']);
    Route::get('GetAllPatients', [PatientController::class, 'GetAllPatients']);
    Route::get('getAllPatientsInfos', [PatientController::class, 'getAllPatientsInfos']);
    Route::get('getPatientStatistics', [PatientController::class, 'getPatientStatistics']);
});

/*
|--------------------------------------------------------------------------
| Nurse Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(["check.role:nurse"])->group(function () {
    Route::get('getNurseAppointments', [AppointAppointmentController::class, 'getNurseAppointments']);
    Route::post('nurse/availability/weekly', [AvailabilityController::class, 'setWeeklySchedule']);
    Route::post('nurse/availability/specific', [AvailabilityController::class, 'setSpecificAvailability']);
    
    // Emergency SOS alerts for nurse
    Route::get('sos/alerts', [SOSController::class, 'getActiveAlerts']);
    Route::post('sos/accept/{id}', [SOSController::class, 'acceptAlert']);
    Route::post('sos/resolve/{id}', [SOSController::class, 'resolveAlert']);

    Route::get('getNurseAppointmentsTermine', [AppointAppointmentController::class, 'getNurseAppointmentsTermine']);
    Route::put('updateStatusToConfirmed', [AppointAppointmentController::class, 'updateStatusToConfirmed']);
    Route::put('updateStatusToTermine', [AppointAppointmentController::class, 'updateStatusToTermine']);
    Route::put('updateStatusToRefuse', [AppointAppointmentController::class, 'updateStatusToRefuse']);
    Route::put('updateStatusToAnnule', [AppointAppointmentController::class, 'updateStatusToAnnule']);

    Route::get('getNurseStats', [NursesController::class, 'getNurseStats']);
    Route::get('GetNurseInfosById', [NursesController::class, 'GetNurseInfosById']);
    Route::post('nurse/upload-diploma', [NursesController::class, 'uploadDiploma']);

    // Medical Records - Nurse
    Route::post('createMedicalRecord', [MedicalRecordController::class, 'createMedicalRecord']);
    Route::get('getMedicalRecordByAppointment/{id}', [MedicalRecordController::class, 'getMedicalRecordByAppointment']);
    
    // Payments & Invoices - Nurse
    Route::post('appointment/{id}/mark-as-paid', [PaymentController::class, 'markAsPaid']);
});

/*
|--------------------------------------------------------------------------
| Patient Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(["check.role:patient"])->group(function () {
    Route::post('createAppointment', [AppointAppointmentController::class, 'createAppointment']);
    Route::get('getPatientAppointmentsActive', [AppointAppointmentController::class, 'getPatientAppointmentsNotDone']);
    Route::get('getPatientAppointmentsTermine', [AppointAppointmentController::class, 'getPatientAppointmentsTermine']);
    Route::get('getPatientAppointmentsAll', [AppointAppointmentController::class, 'getPatientAppointments']);
    Route::get('getPatientById', [PatientController::class, 'getPatientById']);

    // Patient appointment management
    Route::put('cancelAppointmentByPatient', [AppointAppointmentController::class, 'cancelAppointmentByPatient']);
    Route::put('updateAppointmentByPatient', [AppointAppointmentController::class, 'updateAppointmentByPatient']);

    // Reviews - Patient
    Route::post('createReview', [ReviewController::class, 'createReview']);
    Route::get('getMyReviews', [ReviewController::class, 'getReviewsByPatient']);

    // Medical Records & Vital signs - Patient
    Route::get('getMyMedicalHistory', [MedicalRecordController::class, 'getPatientMedicalHistory']);
    
    // Emergency SOS Trigger
    Route::post('sos/trigger', [SOSController::class, 'triggerSOS']);
    Route::get('sos/active', [SOSController::class, 'getPatientActiveSOS']);

    // Payments & Invoices - Patient
    Route::post('appointment/{id}/payment-method', [PaymentController::class, 'setPaymentMethod']);
    Route::post('appointment/{id}/create-payment-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('stripe-webhook', [PaymentController::class, 'confirmStripePayment']);
    Route::get('invoice/{id}/download', [InvoiceController::class, 'downloadInvoice']);
});

/*
|--------------------------------------------------------------------------
| Shared Authenticated Routes (Patient, Nurse, Admin)
|--------------------------------------------------------------------------
*/
Route::middleware(["check.role:patient,nurse,admin"])->group(function () {
    Route::get('GetServiceById', [ServiceController::class, 'GetServiceById']);
    Route::get('GetServiceByNurse', [ServiceController::class, 'GetServiceByNurse']);
    Route::post('sendMessage', [MessageController::class, 'sendMessage']);
    Route::get('getReceivedMessages', [MessageController::class, 'getReceivedMessages']);
    Route::get('getFullConversation', [MessageController::class, 'getFullConversation']);
    Route::post('markAsRead', [MessageController::class, 'markAsRead']);
    Route::get('getUnreadConversationsCount', [MessageController::class, 'getUnreadConversationsCount']);
});
