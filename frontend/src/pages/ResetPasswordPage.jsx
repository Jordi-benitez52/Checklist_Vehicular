import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './LoginPage.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const getPasswordStrength = () => {
    if (!newPassword) return { strength: 0, label: '' };
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;

    const labels = ['', 'Muy debil', 'Debil', 'Regular', 'Fuerte', 'Muy fuerte'];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = getPasswordStrength();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingresa tu correo electronico');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo valido');
      return;
    }

    setLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setMessage('Se ha enviado un codigo a tu correo');
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al enviar codigo');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!code.trim() || code.length !== 6) {
      setError('Ingresa el codigo de 6 digitos');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await authService.confirmPasswordReset(code, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo restablecer la contrasena');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
              </div>
            </div>
            <div className="login-form-section">
              <div className="forgot-password-success">
                <div className="success-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <h3>Contrasena actualizada!</h3>
                <p>Tu contrasena ha sido restablecida correctamente. Ya puedes iniciar sesion.</p>
                <button className="btn-login" onClick={() => navigate('/login')}>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Iniciar sesion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'code') {
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
              </div>
            </div>
            <div className="login-form-section">
              <div className="login-header">
                <h2>Restablecer Contrasena</h2>
                <p>Ingresa el codigo que recibiste y tu nueva contrasena</p>
              </div>

              <form onSubmit={handleResetPassword} className="login-form">
                {error && (
                  <div className="alert alert-error">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>{error}</span>
                  </div>
                )}

                {message && (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{message}</span>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="code">
                    <i className="bi bi-shield-lock"></i>
                    Codigo de verificacion
                  </label>
                  <div className="input-wrapper">
                    <i className="bi bi-key input-icon"></i>
                    <input
                      type="text"
                      id="code"
                      className="form-control"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6 digitos"
                      disabled={loading}
                      autoComplete="one-time-code"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    <i className="bi bi-lock-fill"></i>
                    Nueva contrasena
                  </label>
                  <div className="input-wrapper">
                    <i className="bi bi-lock input-icon"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimo 8 caracteres"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                  {newPassword && (
                    <>
                      <div className="password-strength">
                        <div className={`strength-bar strength-${passwordStrength.strength}`}></div>
                        <span className={`strength-label ${passwordStrength.strength >= 3 ? 'valid' : ''}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <ul className="validation-list">
                        <li className={newPassword.length >= 8 ? 'valid' : ''}>Al menos 8 caracteres</li>
                        <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>Una letra mayuscula</li>
                        <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>Un numero</li>
                      </ul>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <i className="bi bi-lock-fill"></i>
                    Confirmar contrasena
                  </label>
                  <div className="input-wrapper">
                    <i className="bi bi-lock input-icon"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contrasena"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="field-error">
                      <i className="bi bi-exclamation-circle"></i>
                      Las contrasenas no coinciden
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading || code.length !== 6 || newPassword.length < 8 || newPassword !== confirmPassword}
                >
                  {loading ? (
                    <>
                      <span className="login-spinner"></span>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      <span>Restablecer contrasena</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-back"
                  onClick={() => setStep('email')}
                >
                  <i className="bi bi-arrow-left"></i>
                  <span>Volver</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            </div>
          </div>
          <div className="login-form-section">
            <div className="login-header">
              <h2>Olvidaste tu Contrasena</h2>
              <p>Ingresa tu correo para recibir un codigo de recuperacion</p>
            </div>

            <form onSubmit={handleRequestCode} className="login-form">
              {error && (
                <div className="alert alert-error">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">
                  <i className="bi bi-envelope-fill"></i>
                  Correo electronico
                </label>
                <div className="input-wrapper">
                  <i className="bi bi-at input-icon"></i>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i>
                    <span>Enviar codigo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-back"
                onClick={() => navigate('/login')}
              >
                <i className="bi bi-arrow-left"></i>
                <span>Volver al login</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;