import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, login } = useAuth();
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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getProfile();
      const profileData = response.data;
      setFormData({
        username: profileData.user?.username || user?.username || '',
        email: profileData.user?.email || '',
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
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen debe ser menor a 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
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
      const response = await authService.updateProfile(formData);
      setSuccess(response.data.message || 'Perfil actualizado correctamente');

      const updatedUser = {
        ...user,
        username: formData.username,
        full_name: formData.full_name,
        photo: photoPreview,
      };
      login(updatedUser);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        'Error al actualizar perfil';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h2>Mi Perfil</h2>
          <p>Actualiza tu información personal</p>
        </div>
      </div>

      {success && (
        <div className="success-message">
          <i className="bi bi-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="profile-container">
        <div className="profile-photo-section">
          <div className="photo-container">
            {photoPreview ? (
              <img src={photoPreview} alt="Foto de perfil" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <i className="bi bi-person-circle"></i>
              </div>
            )}
          </div>
          <label className="btn btn-secondary photo-btn">
            <i className="bi bi-camera"></i>
            Cambiar foto
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3>Información de cuenta</h3>

            <div className="form-group">
              <label>Nombre de usuario</label>
              <input
                type="text"
                className="form-control"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="usuario_ejemplo"
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Información personal</h3>

            <div className="form-group">
              <label>Nombre completo</label>
              <input
                type="text"
                className="form-control"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Juan Pérez García"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="123-456-7890"
              />
            </div>
          </div>

          <div className="form-actions">
            <p className="rate-limit-note">
              <i className="bi bi-info-circle"></i>
              Puedes actualizar tu perfil cada 15 minutos
            </p>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;