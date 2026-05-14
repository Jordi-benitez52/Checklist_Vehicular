import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-title">
        <h1>{title}</h1>
      </div>

      <div className="header-actions">
        <div className="user-badge">
          <i className="bi bi-person-circle"></i>
          <span>{user?.username}</span>
          <span className="role-badge">{user?.role === 'admin' ? 'Admin' : 'Guardia'}</span>
        </div>

        <button onClick={handleLogout} className="btn-logout">
          <i className="bi bi-box-arrow-right"></i>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
};

export default Header;