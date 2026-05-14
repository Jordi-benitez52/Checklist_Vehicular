import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: 'speedometer2' },
  { path: '/turnos', label: 'Turnos', icon: 'clock' },
  { path: '/vehiculos', label: 'Vehículos', icon: 'truck' },
  { path: '/empleados', label: 'Empleados', icon: 'people' },
  { path: '/conductores', label: 'Conductores', icon: 'person-badge' },
  { path: '/guardias', label: 'Guardias', icon: 'shield-lock', adminOnly: true },
  { path: '/asignaciones', label: 'Asignaciones', icon: 'link', adminOnly: true },
  { path: '/registros', label: 'Registros', icon: 'journal-text' },
  { path: '/checklists', label: 'Checklists', icon: 'clipboard-check' },
  { path: '/reportes', label: 'Reportes', icon: 'bar-chart', adminOnly: true },
  { path: '/bitacora', label: 'Bitácora', icon: 'file-text', adminOnly: true },
  { path: '/notificaciones', label: 'Notificaciones', icon: 'bell', adminOnly: true },
  { path: '/perfil', label: 'Mi Perfil', icon: 'person-circle' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <i className="bi bi-shield-check"></i>
        <span>Checklist</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          if (item.adminOnly && !isAdmin()) {
            return null;
          }

          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className={`bi bi-${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <i className="bi bi-person-circle"></i>
          <span>{user?.username || 'Usuario'}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;