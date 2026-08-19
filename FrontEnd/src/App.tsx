import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookingPage from "./pages/BookingPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import HistoryPage from "./pages/patient/HistoryPage";
import ProfilePage from "./pages/patient/ProfilePage";
import Inscription from "./pages/inscription";
import About from "./pages/about";
import Services from "./pages/service";
import Blog from "./pages/blog";
import Contact from "./pages/contact";
import PatientDashboard from "./pages/patient/PatientDashboard";
import NurseDashboard from "./pages/nurse/NurseDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import NursesList from "./pages/NursesList";
import UpcomingAppointmentsPage from "./pages/patient/UpcomingAppointmentsPage";
import ScheduleManagement from "./pages/nurse/ScheduleManagement";
import NurseProfile from "./pages/nurse/NurseProfile";
import GPatients from "./pages/admin/patients";
import { AuthRoute, NurseRoute, PatientRoute, AdminRoute } from "./components/AuthRoutes";
import AppointmentHistory from "./pages/nurse/service";
import PatientManagement from "./pages/admin/PatientManagement";
import NurseMessages from "./pages/nurse/NurseMessages";
import PatientMessages from "./pages/patient/PatientMessages";
import RegisterPatient from "./pages/patient/RegisterPatient";
import RegisterNurse from "./pages/nurse/RegisterNurse";
import NurseCreationSuccess from "./pages/nurse/NurseCreationSuccess";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
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

            {/* Connexion */}
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

            {/* Inscription */}
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

            {/* Services */}
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

            {/* Blog */}
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

            {/* À propos */}
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

            {/* Contact */}
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

            {/* Liste des infirmières */}
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
              path="/admin/nurses"
              element={
                <AdminRoute>
                  <PatientManagement />

                </AdminRoute>
              } />
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



            {/* Routes des infirmiers */}
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



            {/* Routes des administrateurs */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />            <Route
              path="/admin/patients"
              element={
                <AdminRoute>
                  <GPatients />
                </AdminRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;



