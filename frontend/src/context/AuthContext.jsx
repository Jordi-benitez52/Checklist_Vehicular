import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (userDataOrUsername, password) => {
    if (typeof userDataOrUsername === 'object') {
      const userData = userDataOrUsername;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    return loginWithCredentials(userDataOrUsername, password);
  };

  const loginWithCredentials = async (username, password) => {
    try {
      setError(null);
      const response = await authService.login(username, password);

const userData = {
        id: response.data.user?.id || response.data.id,
        username: response.data.user?.username || username,
        email: response.data.user?.email || '',
        role: response.data.user?.role || response.data.role || 'guardia',
        full_name:
          response.data.user?.full_name ||
          response.data.full_name ||
          username,
        phone: response.data.user?.phone || '',
        photo: response.data.user?.photo || null,
      };

      localStorage.setItem('authToken', response.data.access || response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};