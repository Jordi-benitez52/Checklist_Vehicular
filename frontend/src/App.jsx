import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import TurnosPage from './pages/TurnosPage';
import VehiculosPage from './pages/VehiculosPage';
import ConductoresPage from './pages/ConductoresPage';
import EmpleadosPage from './pages/EmpleadosPage';
import RegistrosPage from './pages/RegistrosPage';
import ChecklistsPage from './pages/ChecklistsPage';
import AsignacionesPage from './pages/AsignacionesPage';
import ReportesPage from './pages/ReportesPage';
import BitacoraPage from './pages/BitacoraPage';
import ProfilePage from './pages/ProfilePage';
import GuardiasPage from './pages/GuardiasPage';
import NotificacionesPage from './pages/NotificacionesPage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="turnos" element={<TurnosPage />} />
        <Route path="vehiculos" element={<VehiculosPage />} />
        <Route path="conductores" element={<ConductoresPage />} />
        <Route path="empleados" element={<EmpleadosPage />} />
        <Route path="guardias" element={<GuardiasPage />} />
        <Route path="registros" element={<RegistrosPage />} />
        <Route path="checklists" element={<ChecklistsPage />} />
        <Route path="asignaciones" element={<AsignacionesPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="bitacora" element={<BitacoraPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="notificaciones" element={<NotificacionesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;