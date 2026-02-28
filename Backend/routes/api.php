<?php

use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NursesController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AppointAppointmentController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\MedicalRecordController;



Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::get('checkAuth', [AuthController::class, 'checkAuth']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('CreateNurse', [NursesController::class, 'CreateNurse']);



    Route::post('loginpatient', [AuthController::class, 'loginPatient']);
    Route::post('loginnurse', [AuthController::class, 'loginNurse']);
    Route::post('loginadmin', [AuthController::class, 'loginAdmin']);

    Route::post('CreatePatient', [PatientController::class, 'CreatePatient']);
    Route::put('updatePatient', [PatientController::class, 'updatePatient']);
    Route::post('updatePatientPhoto', [PatientController::class, 'updatePatientPhoto']);


    Route::get('GetNursesByServices', [NursesController::class, 'GetNursesByServices']);
    Route::get('getNurseByServiceId', [NursesController::class, 'getNurseByServiceId']);

    Route::get('GetNurseByUserName', [NursesController::class, 'GetNurseByUserName']);
    Route::get('GetAllServices', [ServiceController::class, 'GetAllServices']);
    Route::get('GetAllCities', [ServiceController::class, 'GetAllCities']);
    Route::get('GetAllZones', [ServiceController::class, 'GetAllZones']);

    // Nurse filtering by location
    Route::get('getNursesByCity', [NursesController::class, 'getNursesByCity']);
    Route::get('getNursesByZone', [NursesController::class, 'getNursesByZone']);
    Route::get('getNursesByServiceAndZone', [NursesController::class, 'getNursesByServiceAndZone']);

    // Availability routes
    Route::get('availability/slots', [AvailabilityController::class, 'getAvailableSlots']);

    // Public reviews
    Route::get('getReviewsByNurse/{nurseId}', [ReviewController::class, 'getReviewsByNurse']);
    Route::get('getNurseAverageRating/{nurseId}', [ReviewController::class, 'getNurseAverageRating']);


});

// Route::post( 'CreateAdmin', [AdminController::class, 'CreateAdmin']);




Route::middleware(["check.role:admin"])->group(function () {

    Route::post('CreateService', [ServiceController::class, 'CreateService']);


    Route::get('GetNurseByUserId', [NursesController::class, 'GetNurseByUserId']);
    Route::get('GetAllNurses', [NursesController::class, 'GetAllNurses']);
    Route::put('toggleNurseStatus', [NursesController::class, 'toggleNurseStatus']);

    Route::get('getNurseCount', [AdminController::class, 'getNurseCount']);
    Route::get('getAdminStats', [AdminController::class, 'getAdminStats']);
    Route::get('getRecentAppointments', [AdminController::class, 'getRecentAppointments']);
    Route::get('GetAllPatients', [PatientController::class, 'GetAllPatients']);
    Route::get('getAllPatientsInfos', [PatientController::class, 'getAllPatientsInfos']);
    Route::get('getPatientStatistics', [PatientController::class, 'getPatientStatistics']);


});


Route::middleware(["check.role:nurse"])->group(function () {
    Route::get('getNurseAppointments', [AppointAppointmentController::class, 'getNurseAppointments']);
    Route::post('nurse/availability/weekly', [AvailabilityController::class, 'setWeeklySchedule']);
    Route::post('nurse/availability/specific', [AvailabilityController::class, 'setSpecificAvailability']);
    Route::get('sos/alerts', [SOSController::class, 'getActiveAlerts']);
    Route::get('getNurseAppointmentsTermine', [AppointAppointmentController::class, 'getNurseAppointmentsTermine']);
    Route::put('updateStatusToConfirmed', [AppointAppointmentController::class, 'updateStatusToConfirmed']);
    Route::put('updateStatusToTermine', [AppointAppointmentController::class, 'updateStatusToTermine']);
    Route::put('updateStatusToRefuse', [AppointAppointmentController::class, 'updateStatusToRefuse']);
    Route::put('updateStatusToAnnule', [AppointAppointmentController::class, 'updateStatusToAnnule']);

    Route::get('getNurseStats', [NursesController::class, 'getNurseStats']);
    Route::get('GetNurseInfosById', [NursesController::class, 'GetNurseInfosById']);

    // Medical Records - Nurse
    Route::post('createMedicalRecord', [MedicalRecordController::class, 'createMedicalRecord']);
    Route::get('getMedicalRecordByAppointment/{id}', [MedicalRecordController::class, 'getMedicalRecordByAppointment']);
    
    // Payments & Invoices - Nurse
    Route::post('appointment/{id}/mark-as-paid', [\App\Http\Controllers\PaymentController::class, 'markAsPaid']);
});



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

    // Medical Records - Patient
    Route::get('getMyMedicalHistory', [MedicalRecordController::class, 'getPatientMedicalHistory']);
    
    // Payments & Invoices - Patient
    Route::post('appointment/{id}/payment-method', [\App\Http\Controllers\PaymentController::class, 'setPaymentMethod']);
    Route::post('appointment/{id}/create-payment-intent', [\App\Http\Controllers\PaymentController::class, 'createPaymentIntent']);
    Route::post('sos/trigger', [SOSController::class, 'triggerSOS']);
    Route::post('stripe-webhook', [\App\Http\Controllers\PaymentController::class, 'confirmStripePayment']); // Ideally public for actual Webhooks
    Route::get('invoice/{id}/download', [\App\Http\Controllers\InvoiceController::class, 'downloadInvoice']);
});



Route::middleware(["check.role:patient,nurse,admin"])->group(function () {
    Route::get('GetServiceById', [ServiceController::class, 'GetServiceById']);
    Route::get('GetServiceByNurse', [ServiceController::class, 'GetServiceByNurse']);
    Route::post('sendMessage', [MessageController::class, 'sendMessage']);
    Route::get('getReceivedMessages', [MessageController::class, 'getReceivedMessages']);
    Route::get('getFullConversation', [MessageController::class, 'getFullConversation']);
    Route::post('markAsRead', [MessageController::class, 'markAsRead']);
    Route::get('getUnreadConversationsCount', [MessageController::class, 'getUnreadConversationsCount']);





});
