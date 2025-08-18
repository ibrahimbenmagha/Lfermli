<?php

use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NursesController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AppointAppointmentController;



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
    Route::get('getNurseAppointmentsTermine', [AppointAppointmentController::class, 'getNurseAppointmentsTermine']);
    Route::get('updateStatusToConfirmed', [AppointAppointmentController::class, 'updateStatusToConfirmed']);
    Route::get('updateStatusToTermine', [AppointAppointmentController::class, 'updateStatusToTermine']);
    Route::get('updateStatusToRefuse', [AppointAppointmentController::class, 'updateStatusToRefuse']);
    Route::get('updateStatusToAnnule', [AppointAppointmentController::class, 'updateStatusToAnnule']);

    Route::get('getNurseStats', [NursesController::class, 'getNurseStats']);
    Route::get('GetNurseInfosById', [NursesController::class, 'GetNurseInfosById']);

});



Route::middleware(["check.role:patient"])->group(function () {

    Route::post('createAppointment', [AppointAppointmentController::class, 'createAppointment']);
    Route::get('getPatientAppointments', [AppointAppointmentController::class, 'getPatientAppointmentsNotDone']);
    Route::get('getPatientAppointmentsTermine', [AppointAppointmentController::class, 'getPatientAppointmentsTermine']);
    Route::get('getPatientAppointments', [AppointAppointmentController::class, 'getPatientAppointments']);
    Route::get('getPatientById', [PatientController::class, 'getPatientById']);

    //


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
