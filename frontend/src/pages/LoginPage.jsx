import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Solo letras, números y guiones bajos';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
    setLoginError('');
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await login(username, password);

    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setLoginError(result.error || 'Error al iniciar sesión');
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const labels = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-hero">
            <div className="login-hero-content">
              <div className="login-hero-icon">
                <i className="bi bi-shield-check"></i>
              </div>
              <h1>Checklist Vehicular</h1>
              <p>Sistema de control y registro de accesos vehiculares</p>
              <div className="login-hero-stats">
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Monitoreo</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Trazabilidad</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">∞</div>
                  <div className="stat-label">Registros</div>
                </div>
              </div>
            </div>
          </div>

          <div className="login-form-section">
            <div className="login-header">
              <h2>Iniciar Sesión</h2>
              <p>Ingresa tus credenciales para acceder al sistema</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {loginError && (
                <div className="alert alert-error">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{loginError}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username">
                  <i className="bi bi-person-fill"></i>
                  Usuario
                </label>
                <div className="input-wrapper">
                  <i className="bi bi-person input-icon"></i>
                  <input
                    type="text"
                    id="username"
                    className={errors.username ? 'error' : ''}
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Ej: jsmith01"
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <span className="field-error">
                    <i className="bi bi-exclamation-circle"></i>
                    {errors.username}
                  </span>
                )}
                {!errors.username && username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username) && (
                  <span className="field-error valid">
                    <i className="bi bi-check-circle"></i>
                    Formato válido
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <i className="bi bi-lock-fill"></i>
                  Contraseña
                </label>
                <div className="input-wrapper">
                  <i className="bi bi-lock input-icon"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={errors.password ? 'error' : ''}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 8 caracteres"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <span className="field-error">
                    <i className="bi bi-exclamation-circle"></i>
                    {errors.password}
                  </span>
                )}
                {password && (
                  <>
                    <div className="password-strength">
                      <div className={`strength-bar strength-${passwordStrength.strength}`}></div>
                      <span className={`strength-label ${passwordStrength.strength >= 3 ? 'valid' : ''}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <ul className="validation-list">
                      <li className={password.length >= 8 ? 'valid' : ''}>Al menos 8 caracteres</li>
                      <li className={/[A-Z]/.test(password) ? 'valid' : ''}>Una letra mayúscula</li>
                      <li className={/[0-9]/.test(password) ? 'valid' : ''}>Un número</li>
                    </ul>
                  </>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input type="checkbox" id="remember" />
                  <span>Recordar sesión</span>
                </label>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Entrar al Sistema</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>Sistema de Control Vehicular <strong>LRA</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;