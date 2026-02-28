import { useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import LoadingComponent from './LoadingComponent';

interface RouteProps {
  children: ReactNode;
}

// Route protégée pour les patients
export const PatientRoute = ({ children }: RouteProps) => {
     const navigate = useNavigate();
     const [loading, setLoading] = useState(true);
     const [authenticated, setAuthenticated] = useState(false);

     useEffect(() => {
       const checkAuth = async () => {
         try {
           const response = await axiosInstance.get('/auth/checkAuth');
           if (response.data.authenticated && response.data.role === 'patient') {
             setAuthenticated(true);
           } else {
             navigate('/login');
           }
         } catch (error) {
           navigate('/login');
         } finally {
           setLoading(false);
         }
       };

       checkAuth();
     }, [navigate]);

     if (loading) {
       return <LoadingComponent />;
     }

     return authenticated ? children : null;
   };

// Route protégée pour les infirmières
export const NurseRoute = ({ children }: RouteProps) => {
     const navigate = useNavigate();
     const [loading, setLoading] = useState(true);
     const [authenticated, setAuthenticated] = useState(false);

     useEffect(() => {
       const checkAuth = async () => {
         try {
           const response = await axiosInstance.get('/auth/checkAuth');
           if (response.data.authenticated && response.data.role === 'nurse') {
             setAuthenticated(true);
           } else {
             navigate('/login');
           }
         } catch (error) {
           navigate('/login');
         } finally {
           setLoading(false);
         }
       };

       checkAuth();
     }, [navigate]);

     if (loading) {
       return <LoadingComponent />;
     }

     return authenticated ? children : null;
   };

// Route protégée pour les administrateurs
export const AdminRoute = ({ children }: RouteProps) => {
     const navigate = useNavigate();
     const [loading, setLoading] = useState(true);
     const [authenticated, setAuthenticated] = useState(false);

     useEffect(() => {
       const checkAuth = async () => {
         try {
           const response = await axiosInstance.get('/auth/checkAuth');
           if (response.data.authenticated && response.data.role === 'admin') {
             setAuthenticated(true);
           } else {
             navigate('/login');
           }
         } catch (error) {
           navigate('/login');
         } finally {
           setLoading(false);
         }
       };

       checkAuth();
     }, [navigate]);

     if (loading) {
       return <LoadingComponent />;
     }

     return authenticated ? children : null;
   };

// Route pour les utilisateurs non authentifiés (redirige les utilisateurs authentifiés)
export const AuthRoute = ({ children }: RouteProps) => {
     const navigate = useNavigate();
     const [loading, setLoading] = useState(true);
     const [shouldRedirect, setShouldRedirect] = useState(false);

     useEffect(() => {
       const checkAuth = async () => {
         try {
           const response = await axiosInstance.get('/auth/checkAuth');
           if (response.data.authenticated) {
             const role = response.data.role;
             if (role === 'patient') {
               navigate('/patient/dashboard');
             } else if (role === 'nurse') {
               navigate('/nurse/dashboard');
             } else if (role === 'admin') {
               navigate('/admin/dashboard');
             }
             setShouldRedirect(true);
           }
         } catch (error) {
           // Pas d'erreur, rester sur la page (par exemple, /login)
         } finally {
           setLoading(false);
         }
       };

       checkAuth();
     }, [navigate]);

     if (loading) {
       return <LoadingComponent />;
     }

     return !shouldRedirect ? children : null;
   };