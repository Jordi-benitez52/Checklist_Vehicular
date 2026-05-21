import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  const [tempToken, setTempToken] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const { access_token } = tokenResponse;
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const userInfo = await userInfoResponse.json();

        const response = await authService.verifyGoogleToken(userInfo.sub, access_token);
        const data = response.data;

        if (data.requires_verification) {
          setTempToken(data.temp_token);
          setStep(2);
          setCountdown(300);
          startCountdown();
        } else if (data.access) {
          const userData = {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            full_name: data.user.full_name,
            is_admin: data.user.is_admin,
            empresa: data.user.empresa,
          };

          localStorage.setItem('token', data.access);
          localStorage.setItem('refreshToken', data.refresh);
          localStorage.setItem('user', JSON.stringify(userData));

          navigate('/');
        }
      } catch (err) {
        console.error('Google login error:', err);
        setLoginError(err.response?.data?.error || 'Error con Google OAuth');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
      setLoginError('Falló el inicio con Google');
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
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

try {
      const response = await authService.login({ username, password });
      const data = response.data;

      if (data.requires_verification) {
        setTempToken(data.temp_token);
        setStep(2);
        setCountdown(300);
        startCountdown();
      } else if (data.access) {
        const result = await login(username, password);
        if (result.success) {
          navigate('/');
        } else {
          setLoginError(result.error || 'Error al iniciar sesión');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        'Credenciales incorrectas';
      setLoginError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    if (codeError) setCodeError('');
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setCodeError('');

    if (!verificationCode || verificationCode.length !== 6) {
      setCodeError('Ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyCode(tempToken, verificationCode);
      const data = response.data;

      if (data.access) {
        const userData = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
          full_name: data.user.full_name,
          phone: data.user.phone,
          photo: data.user.photo,
        };

        localStorage.setItem('token', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('user', JSON.stringify(userData));

        login(userData);
        navigate('/');
      }
    } catch (err) {
      console.error('Verify code error:', err);
      const errorMsg =
        err.response?.data?.error ||
        'Código incorrecto o expirado';
      setCodeError(errorMsg);
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setCodeError('');

    try {
      await authService.resendCode(tempToken);
      setCountdown(300);
      startCountdown();
      setVerificationCode('');
    } catch (err) {
      console.error('Resend code error:', err);
      setCodeError(err.response?.data?.error || 'Error al reenviar código');
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    setStep(1);
    setUsername('');
    setPassword('');
    setVerificationCode('');
    setTempToken('');
    setCodeError('');
    setLoginError('');
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;

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
            {step === 1 && (
              <>
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

                <div className="login辅助-links">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => navigate('/reset-password')}
                  >
                    <i className="bi bi-question-circle"></i>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="divider">
                  <span>o</span>
                </div>

                <button
                  type="button"
                  className="btn-google"
                  onClick={() => googleLogin()}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <span className="login-spinner"></span>
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continuar con Google</span>
                    </>
                  )}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="login-header">
                  <h2>Verificación de Seguridad</h2>
                  <p>Se ha enviado un código a tu correo electrónico</p>
                </div>

                <form onSubmit={handleVerifyCode} className="login-form">
                  {codeError && (
                    <div className="alert alert-error">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      <span>{codeError}</span>
                    </div>
                  )}

                  <div className="verification-info">
                    <div className="info-icon">
                      <i className="bi bi-envelope-check"></i>
                    </div>
                    <p className="info-text">
                      Revisa tu bandeja de entrada o correo no deseado.<br />
                      El código expira en: <strong>{formatCountdown(countdown)}</strong>
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="code">
                      <i className="bi bi-shield-lock"></i>
                      Código de Verificación
                    </label>
                    <div className="input-wrapper code-input-wrapper">
                      <input
                        type="text"
                        id="code"
                        className="code-input"
                        value={verificationCode}
                        onChange={handleCodeChange}
                        placeholder="Ingresa los 6 dígitos"
                        disabled={loading}
                        maxLength={6}
                        autoComplete="one-time-code"
                      />
                    </div>
                  </div>

                  <div className="verification-actions">
                    <button
                      type="button"
                      className="btn-resend"
                      onClick={handleResendCode}
                      disabled={resending || countdown > 240}
                    >
                      {resending ? (
                        <>
                          <span className="login-spinner"></span>
                          <span>Reenviando...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-arrow-repeat"></i>
                          <span>Reenviar código</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button type="submit" className="btn-login" disabled={loading || verificationCode.length !== 6}>
                    {loading ? (
                      <>
                        <span className="login-spinner"></span>
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i>
                        <span>Verificar código</span>
                      </>
                    )}
                  </button>

                  <button type="button" className="btn-back" onClick={handleBackToLogin}>
                    <i className="bi bi-arrow-left"></i>
                    <span>Volver al login</span>
                  </button>
                </form>
              </>
            )}

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