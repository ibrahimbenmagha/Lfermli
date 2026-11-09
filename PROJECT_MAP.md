# 🗺️ Guide d'Architecture & Index du Projet — Lfermli (PROJECT_MAP.md)

> **Document de Référence Rapide** : Ce fichier centralise toute l'architecture, la structure des dossiers, les routes API, les modèles, les composants Frontend, ainsi qu'un index des fonctionnalités pour localiser et modifier le code instantanément sans avoir à scanner tout le projet.

---

## 📌 Sommaire
1. [Vue d'Ensemble & Stack Technique](#1-vue-densemble--stack-technique)
2. [Commandes de Démarrage Rapide](#2-commandes-de-démarrage-rapide)
3. [Base de Données & Modèles (Backend)](#3-base-de-données--modèles-backend)
4. [Cartographie des Contrôleurs & Routes API (Backend)](#4-cartographie-des-contrôleurs--routes-api-backend)
5. [Architecture Frontend (React / Vite)](#5-architecture-frontend-react--vite)
6. [Guide de Modification Rapide : Où modifier quoi ?](#6-guide-de-modification-rapide--où-modifier-quoi-)
7. [Flux Métier Clés & Règles de Gestion](#7-flux-métier-clés--règles-de-gestion)

---

## 1. Vue d'Ensemble & Stack Technique

**Lfermli** est une plateforme marocaine de santé et de soins infirmiers à domicile. Elle connecte les **patients** avec des **infirmiers diplômés**, gère les rendez-vous, les dossiers médicaux, les urgences géolocalisées (SOS), les paiements et le suivi administratif.

### Backend
- **Framework** : Laravel 12 (PHP 8.2+)
- **Authentification** : JWT (`tymon/jwt-auth`), Laravel Sanctum, Cookies sécurisés (`access_token`)
- **Paiements** : Stripe PHP SDK (`stripe/stripe-php`)
- **Documents & Export** : DomPDF (`dompdf/dompdf`), Maatwebsite Excel, PHPOffice
- **IA / Analyse** : OpenAI PHP Client (`openai-php/client`), Math Parser
- **Base de données** : MySQL / SQLite (selon environnement)

### Frontend
- **Framework** : React 18 + TypeScript + Vite
- **UI & Styles** : TailwindCSS + Shadcn/ui (Radix UI) + Lucide React + Ant Design (partiel)
- **Routage** : React Router v6 (`react-router-dom`)
- **State & Requêtes** : TanStack Query v5 (`@tanstack/react-query`) + Axios (`src/axiosConfig.ts`)
- **Cartographie** : Leaflet (`leaflet`, `@types/leaflet`)
- **Internationalisation** : i18next (Français `fr`, Arabe `ar`)

---

## 2. Commandes de Démarrage Rapide

### Backend (`/Backend`)
```bash
cd Backend
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan serve # Lance l'API sur http://127.0.0.1:8000
```

### Frontend (`/FrontEnd`)
```bash
cd FrontEnd
npm install
npm run dev # Lance l'application sur http://localhost:5173
```

---

## 3. Base de Données & Modèles (Backend)

Emplacement : `Backend/app/Models/` et `Backend/database/migrations/`

| Modèle | Fichier | Table associée | Responsabilité & Relations |
| :--- | :--- | :--- | :--- |
| **User** | `User.php` | `users` | Utilisateur de base (role: `admin`, `nurse`, `patient`), coords GPS (`latitude`, `longitude`). Relations : `hasOne(Nurse)`, `hasOne(Patient)`, `hasMany(Message)` |
| **Nurse** | `Nurse.php` | `nurses` | Profil infirmier (`status`, `is_verified`, `license_number`, `diploma_document`, `note_over_5`). Relations : `belongsTo(User)`, `belongsTo(City)`, `belongsTo(Zone)`, `belongsToMany(Service)` |
| **Patient** | `Patient.php` | `patients` | Profil patient. Relations : `belongsTo(User)`, `hasMany(Appointment)` |
| **Appointment** | `Appointment.php` | `appointments` | Rendez-vous (`apointementsDate`, `statut`, `emergency_level`, `adress`). Relations : `belongsTo(Patient)`, `belongsTo(NurseService)`, `hasOne(MedicalRecord)`, `hasOne(Invoice)`, `hasMany(Payment)` |
| **Service** | `Service.php` | `services` | Types d'actes (injection, pansement, perfusion...). Relations : `belongsToMany(Nurse)` via `nurse_service` |
| **NurseService** | `NurseService.php` | `nurse_service` | Table pivot associant un infirmier à ses services avec ses tarifs spécifiques |
| **NurseAvailability**| `NurseAvailability.php` | `nurse_availabilities` | Plages horaires hebdomadaires et disponibilités spécifiques par date |
| **MedicalRecord**| `MedicalRecord.php` | `medical_records` | Dossier de soins (`prescriptions`, `resultats_tests`, `blood_pressure`, `heart_rate`, `blood_sugar`, `temperature`, `oxygen_saturation`) |
| **SosAlert** | `SosAlert.php` | `sos_alerts` | Alertes d'urgence avec coordonnées GPS (`patient_id`, `responder_id`, `latitude`, `longitude`, `status`) |
| **Message** | `Message.php` | `messages` | Chat en direct (`id_expediteur`, `id_destinataire`, `contenu`, `lu`, `date_envoi`) |
| **Payment** | `Payment.php` | `payments` | Transactions (`appointment_id`, `amount`, `payment_method`: stripe/cash, `status`: pending/paid/failed) |
| **Invoice** | `Invoice.php` | `invoices` | Factures PDF générées pour les rendez-vous terminés |
| **Review** | `Review.php` | `reviews` | Avis et notes laissés par les patients pour les infirmiers (`nurse_id`, `patient_id`, `rating`, `comment`) |
| **City** | `City.php` | `cities` | Villes couvertes (Casablanca, Rabat, Marrakech, etc.) |
| **Zone** | `Zone.php` | `zones` | Quartiers / zones d'intervention rattachés à une ville |

---

## 4. Cartographie des Contrôleurs & Routes API (Backend)

Fichier des routes : `Backend/routes/api.php`  
Gestion de l'authentification et des jetons : `Backend/app/Helpers/JwtHelper.php`  
Middleware de vérification des rôles : `Backend/app/Http/Middleware/CheckUserRole.php`

### 1. Routes Publiques & Authentification (`Route::prefix('auth')`)
Contrôleurs : `AuthController.php`, `NursesController.php`, `PatientController.php`, `ServiceController.php`, `ReviewController.php`

- `POST /api/auth/login` : Connexion générique
- `POST /api/auth/loginpatient` : Connexion espace patient
- `POST /api/auth/loginnurse` : Connexion espace infirmier
- `POST /api/auth/loginadmin` : Connexion backoffice admin
- `POST /api/auth/CreatePatient` : Inscription d'un nouveau patient
- `POST /api/auth/CreateNurse` : Inscription d'un nouvel infirmier
- `GET /api/auth/checkAuth` : Vérification du cookie JWT et restitution de l'identité / rôle
- `POST /api/auth/logout` : Révocation du token et suppression des cookies
- `GET /api/auth/GetAllServices` : Liste de tous les services médicaux
- `GET /api/auth/GetAllCities` : Liste des villes
- `GET /api/auth/GetAllZones` : Liste des zones / quartiers
- `GET /api/auth/GetNursesByServices` : Recherche d'infirmiers par service
- `GET /api/auth/getNursesByCity` / `getNursesByZone` : Filtrage géographique
- `GET /api/auth/getNearbyNursesForMap` : Infirmiers à proximité pour affichage Leaflet
- `GET /api/auth/availability/slots` : Récupération des créneaux horaires disponibles
- `GET /api/auth/getReviewsByNurse/{id}` : Avis publics d'un infirmier

### 2. Routes Patient (`check.role:patient`)
Contrôleurs : `AppointAppointmentController.php`, `PatientController.php`, `ReviewController.php`, `MedicalRecordController.php`, `SOSController.php`, `PaymentController.php`, `InvoiceController.php`

- `POST /api/createAppointment` : Réservation d'un soin à domicile
- `GET /api/getPatientAppointmentsActive` : Rendez-vous actifs / en cours
- `GET /api/getPatientAppointmentsTermine` : Historique des soins terminés
- `GET /api/getPatientAppointmentsAll` : Ensemble des rendez-vous
- `PUT /api/cancelAppointmentByPatient` : Annulation d'un rendez-vous par le patient
- `PUT /api/updateAppointmentByPatient` : Modification de la date ou de l'adresse
- `POST /api/createReview` : Dépôt d'un avis post-soin
- `GET /api/getMyReviews` : Historique des avis déposés
- `GET /api/getMyMedicalHistory` : Historique médical du patient et suivi des constantes vitales
- `POST /api/sos/trigger` : Déclenchement d'un appel SOS d'urgence avec coordonnées GPS
- `GET /api/sos/active` : Statut de l'alerte SOS en cours
- `POST /api/appointment/{id}/payment-method` : Sélection du mode de paiement (espèce / en ligne)
- `POST /api/appointment/{id}/create-payment-intent` : Création du PaymentIntent Stripe
- `GET /api/invoice/{id}/download` : Téléchargement de la facture PDF

### 3. Routes Infirmier (`check.role:nurse`)
Contrôleurs : `AppointAppointmentController.php`, `AvailabilityController.php`, `SOSController.php`, `NursesController.php`, `MedicalRecordController.php`, `PaymentController.php`

- `GET /api/getNurseAppointments` : Liste des demandes et rendez-vous planifiés
- `GET /api/getNurseAppointmentsTermine` : Historique des interventions achevées
- `PUT /api/updateStatusToConfirmed` : Confirmation de la prise en charge
- `PUT /api/updateStatusToTermine` : Clôture du soin
- `PUT /api/updateStatusToRefuse` : Refus d'une demande
- `PUT /api/updateStatusToAnnule` : Annulation
- `POST /api/nurse/availability/weekly` : Configuration de l'emploi du temps hebdomadaire
- `POST /api/nurse/availability/specific` : Ajout / blocage d'une date spécifique
- `GET /api/sos/alerts` : Consultation des alertes SOS actives à proximité
- `POST /api/sos/accept/{id}` : Prise en charge d'un SOS
- `POST /api/sos/resolve/{id}` : Résolution / clôture du SOS
- `GET /api/getNurseStats` : Statistiques de performance de l'infirmier
- `POST /api/nurse/upload-diploma` : Envoi du diplôme pour validation du compte
- `POST /api/createMedicalRecord` : Saisie du rapport de soin et des constantes vitales
- `GET /api/getMedicalRecordByAppointment/{id}` : Consultation du dossier lié à une intervention
- `POST /api/appointment/{id}/mark-as-paid` : Validation d'un paiement en espèces (cash)

### 4. Routes Administrateur (`check.role:admin`)
Contrôleurs : `AdminController.php`, `NursesController.php`, `PatientController.php`, `ServiceController.php`

- `GET /api/getAdminStats` : Chiffres clés (nombre de soins, revenus, utilisateurs)
- `GET /api/getNurseCount` : Nombre total d'infirmiers
- `GET /api/GetAllNurses` : Gestion des infirmiers et vérification
- `PUT /api/toggleNurseStatus` : Activation / désactivation d'un compte infirmier
- `PUT /api/verifyNurse` : Validation officielle du diplôme / certification
- `GET /api/GetAllPatients` / `getAllPatientsInfos` : Gestion des patients
- `GET /api/getPatientStatistics` : Statistiques d'inscriptions et de réservations
- `POST /api/CreateService` : Création de nouveaux types de prestations de soin

### 5. Routes Partagées Authentifiées (`check.role:patient,nurse,admin`)
Contrôleur : `MessageController.php`, `ServiceController.php`

- `POST /api/sendMessage` : Envoi d'un message textuel
- `GET /api/getReceivedMessages` : Boîte de réception
- `GET /api/getFullConversation` : Historique complet des échanges avec un interlocuteur
- `POST /api/markAsRead` : Accusé de lecture
- `GET /api/getUnreadConversationsCount` : Badge de messages non lus

---

## 5. Architecture Frontend (React / Vite)

Emplacement racine : `FrontEnd/src/`

### 1. Routes & Pages (`src/App.tsx` & `src/pages/`)

| URL | Fichier Page | Accès / Rôle | Description |
| :--- | :--- | :--- | :--- |
| `/` | `pages/Home.tsx` | Public | Page d'accueil, recherche rapide, mise en avant |
| `/login` | `pages/Login.tsx` | Public (AuthRoute) | Formulaire de connexion unifié (Patient / Infirmier / Admin) |
| `/inscription` | `pages/inscription.tsx` | Public | Choix du type de compte à créer |
| `/RegisterPatient` | `pages/patient/RegisterPatient.tsx` | Public | Formulaire complet d'inscription patient |
| `/RegisterNurse` | `pages/nurse/RegisterNurse.tsx` | Public | Formulaire d'inscription infirmier avec sélection des services |
| `/NurseCreationSuccess`| `pages/nurse/NurseCreationSuccess.tsx`| Public | Confirmation et invitation à soumettre son diplôme |
| `/services` | `pages/service.tsx` | Public | Présentation du catalogue des actes de soins |
| `/infirmieres` | `pages/NursesList.tsx` | Public | Annuaire avec filtres (ville, spécialité) et vue Carte |
| `/about` | `pages/about.tsx` | Public | À propos de la plateforme |
| `/contact` | `pages/contact.tsx` | Public | Formulaire de contact |
| `/blog` | `pages/blog.tsx` | Public | Articles de santé et conseils médicaux |
| **Patient** | | | |
| `/patient/dashboard` | `pages/patient/PatientDashboard.tsx` | `PatientRoute` | Tableau de bord patient, raccourcis, alertes SOS |
| `/patient/booking` | `pages/BookingPage.tsx` | `PatientRoute` | Tunnel de réservation complet avec sélection créneau et Stripe |
| `/patient/appointments`| `pages/patient/UpcomingAppointmentsPage.tsx`| `PatientRoute` | Rendez-vous à venir avec actions (modifier, annuler) |
| `/patient/history` | `pages/patient/HistoryPage.tsx` | `PatientRoute` | Historique des soins, factures PDF, avis |
| `/patient/profilePage`| `pages/patient/ProfilePage.tsx` | `PatientRoute` | Profil patient, coordonnées et antécédents |
| `/patient/PatientMessages`| `pages/patient/PatientMessages.tsx`| `PatientRoute` | Messagerie sécurisée avec les soignants |
| **Infirmier** | | | |
| `/nurse/dashboard` | `pages/nurse/NurseDashboard.tsx` | `NurseRoute` | Tableau de bord soignant, demandes entrantes, stats |
| `/nurse/schedule` | `pages/nurse/ScheduleManagement.tsx` | `NurseRoute` | Gestion de l'emploi du temps et des disponibilités |
| `/nurse/services` | `pages/nurse/service.tsx` | `NurseRoute` | Historique des interventions et validation des soins |
| `/nurse/profile` | `pages/nurse/NurseProfile.tsx` | `NurseRoute` | Profil public, téléversement diplôme, tarifs |
| `/nurse/NurseMessages` | `pages/nurse/NurseMessages.tsx` | `NurseRoute` | Messagerie avec les patients |
| **Admin** | | | |
| `/admin/dashboard` | `pages/admin/AdminDashboard.tsx` | `AdminRoute` | Indicateurs de pilotage globaux, revenus, validation |
| `/admin/nurses` | `pages/admin/PatientManagement.tsx` | `AdminRoute` | Validation des diplômes infirmiers et statuts |
| `/admin/patients` | `pages/admin/patients.tsx` | `AdminRoute` | Vue détaillée et gestion de la base patients |

### 2. Composants Métier Réutilisables (`src/components/`)
- `NurseMap.tsx` : Carte interactive Leaflet géolocalisant les infirmiers disponibles autour du patient.
- `SosButton.tsx` / `SOSButtonModal.tsx` : Bouton flottant d'urgence déclenchant la localisation GPS et l'alerte.
- `SOSNurseWatcher.tsx` : Composant d'écoute en arrière-plan pour avertir immédiatement l'infirmier en cas de SOS à proximité.
- `StripePaymentForm.tsx` : Composant de paiement en ligne sécurisé intégré via Stripe Elements.
- `VitalSignsWidget.tsx` : Affichage graphique des constantes vitales (pouls, tension, glycémie, SPO2).
- `NurseCard.tsx` / `NurseVerificationBadge.tsx` : Cartes de présentation des infirmiers et badge de certification officielle.
- `Header.tsx` & `Footer.tsx` : En-tête avec navigation responsive et pied de page.
- `LanguageSelector.tsx` : Sélecteur de langue Fr / Ar.
- `AuthRoutes.tsx` : Gardes de navigation React Router (`PatientRoute`, `NurseRoute`, `AdminRoute`, `AuthRoute`).

### 3. Client HTTP & Configuration API
- `src/axiosConfig.ts` : Instance Axios centralisée pointant sur `http://127.0.0.1:8000/api` avec `withCredentials: true` pour la transmission automatique des cookies d'authentification.

---

## 6. Guide de Modification Rapide : Où modifier quoi ?

Utilise ce tableau pour trouver directement les fichiers à modifier selon le besoin exprimé :

### 🩺 1. Prise de Rendez-vous & Calendrier
- **Frontend Formulaire & Réservation** : `FrontEnd/src/pages/BookingPage.tsx`
- **Frontend Consultation des RDV** : `FrontEnd/src/pages/patient/UpcomingAppointmentsPage.tsx`
- **Backend Logique de Réservation** : `Backend/app/Http/Controllers/AppointAppointmentController.php` (méthode `createAppointment`)
- **Backend Modèle & Données** : `Backend/app/Models/Appointment.php`
- **Disponibilités & Créneaux** : `Backend/app/Http/Controllers/AvailabilityController.php` & `FrontEnd/src/pages/nurse/ScheduleManagement.tsx`

### 🚨 2. Système d'Urgence SOS
- **Frontend Déclencheur Patient** : `FrontEnd/src/components/SosButton.tsx` & `FrontEnd/src/components/SOSButtonModal.tsx`
- **Frontend Récepteur Infirmier** : `FrontEnd/src/components/SOSNurseWatcher.tsx` & `FrontEnd/src/pages/nurse/NurseDashboard.tsx`
- **Backend Logique SOS** : `Backend/app/Http/Controllers/SOSController.php` (`triggerSOS`, `acceptAlert`, `resolveAlert`)
- **Backend Modèle & Base** : `Backend/app/Models/SosAlert.php` & `Backend/database/migrations/2026_02_28_202459_create_sos_alerts_table.php`

### 💳 3. Paiements & Factures PDF
- **Frontend Formulaire Stripe** : `FrontEnd/src/components/StripePaymentForm.tsx`
- **Backend Traitement Paiement** : `Backend/app/Http/Controllers/PaymentController.php` (`createPaymentIntent`, `markAsPaid`)
- **Backend Factures PDF** : `Backend/app/Http/Controllers/InvoiceController.php` (utilise `DomPDF`)
- **Backend Modèles** : `Backend/app/Models/Payment.php` & `Backend/app/Models/Invoice.php`

### 🩺 4. Constantes Vitales & Dossier Médical
- **Frontend Saisie Infirmier** : `FrontEnd/src/pages/nurse/service.tsx`
- **Frontend Affichage Patient** : `FrontEnd/src/components/VitalSignsWidget.tsx` & `FrontEnd/src/pages/patient/HistoryPage.tsx`
- **Backend Logique** : `Backend/app/Http/Controllers/MedicalRecordController.php`
- **Backend Modèle** : `Backend/app/Models/MedicalRecord.php` (champs : `blood_pressure`, `heart_rate`, `blood_sugar`, etc.)

### 💬 5. Messagerie & Chat en Direct
- **Frontend Écran Patient** : `FrontEnd/src/pages/patient/PatientMessages.tsx`
- **Frontend Écran Infirmier** : `FrontEnd/src/pages/nurse/NurseMessages.tsx`
- **Backend Logique** : `Backend/app/Http/Controllers/MessageController.php` (`sendMessage`, `getFullConversation`, `markAsRead`)
- **Backend Modèle** : `Backend/app/Models/Message.php`

### 🧑‍⚕️ 6. Gestion & Certification des Infirmiers
- **Frontend Profil & Diplôme** : `FrontEnd/src/pages/nurse/NurseProfile.tsx`
- **Frontend Validation Admin** : `FrontEnd/src/pages/admin/PatientManagement.tsx`
- **Backend Validation** : `Backend/app/Http/Controllers/NursesController.php` (`verifyNurse`, `uploadDiploma`, `toggleNurseStatus`)
- **Backend Modèle** : `Backend/app/Models/Nurse.php`

### 🗺️ 7. Cartographie Leaflet & Villes / Zones
- **Frontend Carte** : `FrontEnd/src/components/NurseMap.tsx` & `FrontEnd/src/pages/NursesList.tsx`
- **Backend Endpoints GPS** : `Backend/app/Http/Controllers/NursesController.php` (`getNearbyNursesForMap`, `getNursesByZone`)
- **Backend Services & Lieux** : `Backend/app/Http/Controllers/ServiceController.php`

### ⭐ 8. Avis & Notations
- **Frontend Dépôt Avis** : `FrontEnd/src/pages/patient/HistoryPage.tsx`
- **Backend Traitement** : `Backend/app/Http/Controllers/ReviewController.php` (`createReview`, `getReviewsByNurse`)
- **Backend Modèle** : `Backend/app/Models/Review.php`

### 🔐 9. Authentification, Inscription & Rôles
- **Frontend Formulaires** : `FrontEnd/src/pages/Login.tsx`, `RegisterPatient.tsx`, `RegisterNurse.tsx`
- **Frontend Protection de Routes** : `FrontEnd/src/components/AuthRoutes.tsx`
- **Backend Contrôleur** : `Backend/app/Http/Controllers/AuthController.php`
- **Backend Middleware & JWT** : `Backend/app/Http/Middleware/CheckUserRole.php` & `Backend/app/Helpers/JwtHelper.php`

### 🌐 10. Textes & Traductions (i18n)
- **Configuration** : `FrontEnd/src/i18n/i18n.ts`
- **Fichier Français** : `FrontEnd/src/i18n/locales/fr.json`
- **Fichier Arabe** : `FrontEnd/src/i18n/locales/ar.json`

---

## 7. Flux Métier Clés & Règles de Gestion

### Cycle de vie d'un Rendez-vous (`statut`)
1. **Création** : Le patient réserve sur `/patient/booking` $\rightarrow$ statut `en_attente`.
2. **Acceptation** : L'infirmier confirme depuis `/nurse/dashboard` $\rightarrow$ statut `confirme`.
3. **Réalisation du soin** : L'infirmier renseigne le rapport médical (constantes vitales) $\rightarrow$ statut `termine`.
4. **Paiement & Facturation** : Paiement en ligne Stripe validé ou paiement en espèces encaissé $\rightarrow$ Facture générée automatiquement.
5. **Avis** : Le patient peut noter l'intervention sur son historique.
*(Possibilité d'annulation : statut `annule` par le patient, ou `refuse` par l'infirmier).*

### Gestion des Rôles
- `patient` : Accès aux recherches, réservations, historique personnel, SOS, paiement de ses soins.
- `nurse` : Accès à l'emploi du temps, acceptation des demandes, saisie des dossiers de soins, réception des SOS.
- `admin` : Supervise les utilisateurs, valide les diplômes des soignants, suit les métriques globales.

