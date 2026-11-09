import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingComponent from "./components/LoadingComponent";
import { AuthRoute, NurseRoute, PatientRoute, AdminRoute } from "./components/AuthRoutes";

// Code splitting avec React.lazy pour alléger le bundle initial
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Inscription = lazy(() => import("./pages/inscription"));
const RegisterPatient = lazy(() => import("./pages/patient/RegisterPatient"));
const RegisterNurse = lazy(() => import("./pages/nurse/RegisterNurse"));
const NurseCreationSuccess = lazy(() => import("./pages/nurse/NurseCreationSuccess"));
const Services = lazy(() => import("./pages/service"));
const Blog = lazy(() => import("./pages/blog"));
const About = lazy(() => import("./pages/about"));
const Contact = lazy(() => import("./pages/contact"));
const NursesList = lazy(() => import("./pages/NursesList"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Espace Patient
const BookingPage = lazy(() => import("./pages/BookingPage"));
const PatientDashboard = lazy(() => import("./pages/patient/PatientDashboard"));
const HistoryPage = lazy(() => import("./pages/patient/HistoryPage"));
const ProfilePage = lazy(() => import("./pages/patient/ProfilePage"));
const UpcomingAppointmentsPage = lazy(() => import("./pages/patient/UpcomingAppointmentsPage"));
const PatientMessages = lazy(() => import("./pages/patient/PatientMessages"));

// Espace Infirmier
const NurseDashboard = lazy(() => import("./pages/nurse/NurseDashboard"));
const ScheduleManagement = lazy(() => import("./pages/nurse/ScheduleManagement"));
const AppointmentHistory = lazy(() => import("./pages/nurse/service"));
const NurseProfile = lazy(() => import("./pages/nurse/NurseProfile"));
const NurseMessages = lazy(() => import("./pages/nurse/NurseMessages"));

// Espace Administrateur
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const PatientManagement = lazy(() => import("./pages/admin/PatientManagement"));
const GPatients = lazy(() => import("./pages/admin/patients"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Suspense fallback={<LoadingComponent />}>
            <Routes>
              {/* Page d'accueil */}
              <Route
                path="/"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <Home />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Connexion & Inscriptions */}
              <Route
                path="/login"
                element={
                  <AuthRoute>
                    <main className="flex-1">
                      <Login />
                    </main>
                    <Footer />
                  </AuthRoute>
                }
              />

              <Route
                path="/RegisterPatient"
                element={
                  <AuthRoute>
                    <main className="flex-1">
                      <RegisterPatient />
                    </main>
                    <Footer />
                  </AuthRoute>
                }
              />

              <Route
                path="/RegisterNurse"
                element={
                  <AuthRoute>
                    <main className="flex-1">
                      <RegisterNurse />
                    </main>
                    <Footer />
                  </AuthRoute>
                }
              />

              <Route
                path="/NurseCreationSuccess"
                element={
                  <AuthRoute>
                    <main className="flex-1">
                      <NurseCreationSuccess />
                    </main>
                    <Footer />
                  </AuthRoute>
                }
              />

              <Route
                path="/inscription"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <Inscription />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Pages publiques d'information */}
              <Route
                path="/services"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <Services />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/blog"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <Blog />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/about"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <About />
                    </main>
                    <Footer />
                  </>
                }
              />

              <Route
                path="/contact"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <Contact />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Annuaire des soignants */}
              <Route
                path="/infirmieres"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <NursesList />
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* Espace Patient Protégé */}
              <Route
                path="/patient/booking"
                element={
                  <PatientRoute>
                    <main className="flex-1">
                      <BookingPage />
                    </main>
                    <Footer />
                  </PatientRoute>
                }
              />
              <Route
                path="/patient/dashboard"
                element={
                  <PatientRoute>
                    <PatientDashboard />
                  </PatientRoute>
                }
              />
              <Route
                path="/patient/history"
                element={
                  <PatientRoute>
                    <HistoryPage />
                  </PatientRoute>
                }
              />
              <Route
                path="/patient/profilePage"
                element={
                  <PatientRoute>
                    <ProfilePage />
                  </PatientRoute>
                }
              />
              <Route
                path="/patient/appointments"
                element={
                  <PatientRoute>
                    <UpcomingAppointmentsPage />
                  </PatientRoute>
                }
              />
              <Route
                path="/patient/PatientMessages"
                element={
                  <PatientRoute>
                    <PatientMessages />
                  </PatientRoute>
                }
              />

              {/* Espace Infirmier Protégé */}
              <Route
                path="/nurse/dashboard"
                element={
                  <NurseRoute>
                    <NurseDashboard />
                  </NurseRoute>
                }
              />
              <Route
                path="/nurse/schedule"
                element={
                  <NurseRoute>
                    <ScheduleManagement />
                  </NurseRoute>
                }
              />
              <Route
                path="/nurse/services"
                element={
                  <NurseRoute>
                    <AppointmentHistory />
                  </NurseRoute>
                }
              />
              <Route
                path="/nurse/profile"
                element={
                  <NurseRoute>
                    <main className="flex-1">
                      <NurseProfile />
                    </main>
                  </NurseRoute>
                }
              />
              <Route
                path="/nurse/NurseMessages"
                element={
                  <NurseRoute>
                    <NurseMessages />
                  </NurseRoute>
                }
              />

              {/* Espace Administrateur Protégé */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/nurses"
                element={
                  <AdminRoute>
                    <PatientManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/patients"
                element={
                  <AdminRoute>
                    <GPatients />
                  </AdminRoute>
                }
              />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
