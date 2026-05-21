import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const { showToast } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getProfile();
      const profileData = response.data;
      console.log('[ProfilePage] profileData:', profileData);
      setFormData({
        username: profileData.username || user?.username || '',
        email: profileData.email || '',
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
      });
      if (profileData.photo) {
        setPhotoPreview(profileData.photo);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setPhotoFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('phone', formData.phone);

      console.log('[ProfilePage] photoFile:', photoFile);
      if (photoFile) {
        console.log('[ProfilePage] photoFile name:', photoFile.name, 'size:', photoFile.size);
        formDataToSend.append('foto', photoFile);
      }

      const response = await authService.updateProfile(formDataToSend);
      console.log('[ProfilePage] update response:', response.data);
      showToast(response.data.message || 'Perfil actualizado correctamente');

      if (photoPreview) {
        const updatedUser = { ...user, full_name: formData.full_name, photo: photoPreview };
        login(updatedUser);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        'Error al actualizar perfil';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="page-loading">
          <div className="spinner-large"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h2>Mi Perfil</h2>
          <p>Administra tu información personal</p>
        </div>
      </div>

      {success && (
        <div className="success-message">
          <i className="bi bi-check-circle"></i>
          <span>{success}</span>
          <button className="btn-close-success" onClick={() => setSuccess(null)}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
          <button className="btn-close-error" onClick={() => setError(null)}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-photo-card">
            <div className="photo-wrapper">
              {photoPreview ? (
                <img src={photoPreview} alt="Foto de perfil" className="photo-img" />
              ) : (
                <div className="photo-placeholder">
                  <i className="bi bi-person-circle"></i>
                </div>
              )}
            </div>
            <label className="btn-upload-photo">
              <i className="bi bi-camera"></i>
              <span>Cambiar foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="profile-user-info">
            <h3 className="user-display-name">{formData.full_name || formData.username}</h3>
            <p className="user-role-label">
              <i className="bi bi-shield"></i>
              {user?.role === 'admin' ? 'Administrador' : 'Guardia'}
            </p>
            <p className="user-email-label">
              <i className="bi bi-envelope"></i>
              {formData.email || 'Sin email'}
            </p>
          </div>
        </div>

        <div className="profile-form-card">
          <h3 className="form-title">
            <i className="bi bi-person-lines-fill"></i>
            Información Personal
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-person"></i>
                  Nombre completo
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-telephone"></i>
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Número de teléfono"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-at"></i>
                  Usuario
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.username}
                  disabled
                  title="El nombre de usuario no puede ser modificado"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-envelope-fill"></i>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  disabled
                  title="El correo electrónico no puede ser modificado"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-small"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg"></i>
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="profile-info-card">
          <h3 className="info-title">
            <i className="bi bi-shield-check"></i>
            Seguridad de la cuenta
          </h3>
          <div className="info-content">
            <p className="info-text">
              <i className="bi bi-info-circle"></i>
              Recibirás notificaciones por email cada vez que se inicie sesión en tu cuenta.
              Las notificaciones se envían al correo electrónico registrado.
            </p>
            <div className="info-status">
              <span className="status-badge active">
                <i className="bi bi-check-circle-fill"></i>
                2FA Activado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;