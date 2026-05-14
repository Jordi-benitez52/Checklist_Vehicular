import { useState, useEffect } from 'react';
import { usuariosService } from '../services/api';
import './GuardiasPage.css';

const emptyFormData = {
  username: '',
  email: '',
  password: '',
  full_name: '',
  phone: '',
  role: 'guardia',
  numero_empleado: '',
};

const GuardiasPage = () => {
  const [guardias, setGuardias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedGuardia, setSelectedGuardia] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadGuardias();
  }, []);

  const loadGuardias = async () => {
    try {
      setLoading(true);
      const response = await usuariosService.getAll();
      setGuardias(response.data || []);
    } catch (err) {
      console.error('Error loading guardias:', err);
      setError('Error al cargar guardias');
    } finally {
      setLoading(false);
    }
  };

  const guardiasFiltrados = guardias.filter((g) => {
    const matchesSearch =
      g.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? g.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await usuariosService.create(formData);
      setSuccess('Guardia creado correctamente');
      setShowModal(false);
      setFormData(emptyFormData);
      loadGuardias();
    } catch (err) {
      console.error('Error creating guardia:', err);
      const errorMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.error ||
        'Error al crear guardia';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const updateData = { ...formData };
      if (!updateData.new_password) delete updateData.new_password;
      if (!updateData.email) delete updateData.email;

      await usuariosService.patch(selectedGuardia.id, updateData);
      setSuccess('Guardia actualizado correctamente');
      setShowEditModal(false);
      setSelectedGuardia(null);
      setFormData(emptyFormData);
      loadGuardias();
    } catch (err) {
      console.error('Error updating guardia:', err);
      const errorMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.error ||
        'Error al actualizar guardia';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      await usuariosService.delete(selectedGuardia.id);
      setSuccess('Guardia eliminado correctamente');
      setShowDeleteModal(false);
      setSelectedGuardia(null);
      loadGuardias();
    } catch (err) {
      console.error('Error deleting guardia:', err);
      setError(err.response?.data?.error || 'Error al eliminar guardia');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (guardia) => {
    setSelectedGuardia(guardia);
    setFormData({
      username: guardia.username || '',
      email: guardia.email || '',
      full_name: guardia.full_name || '',
      phone: guardia.phone || '',
      role: guardia.role || 'guardia',
      numero_empleado: guardia.numero_empleado || '',
      new_password: '',
    });
    setError(null);
    setSuccess(null);
    setShowEditModal(true);
  };

  const openDeleteModal = (guardia) => {
    setSelectedGuardia(guardia);
    setError(null);
    setSuccess(null);
    setShowDeleteModal(true);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const closeAllModals = () => {
    setShowModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedGuardia(null);
    setFormData(emptyFormData);
    setError(null);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando guardias...</p>
      </div>
    );
  }

  return (
    <div className="guardias-page">
      <div className="page-header">
        <div>
          <h2>Gestión de Guardias y Administradores</h2>
          <p>Control de usuarios del sistema</p>
        </div>

        <button className="btn btn-primary" onClick={() => {
          setFormData(emptyFormData);
          setError(null);
          setSuccess(null);
          setShowModal(true);
        }}>
          <i className="bi bi-plus-circle"></i>
          Agregar Usuario
        </button>
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

      <div className="filters-bar">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los roles</option>
            <option value="guardia">Guardias</option>
            <option value="admin">Administradores</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {guardiasFiltrados.map((guardia) => (
              <tr key={guardia.id}>
                <td><strong>{guardia.username}</strong></td>
                <td>{guardia.full_name || '-'}</td>
                <td>{guardia.email || '-'}</td>
                <td>
                  <span className={`badge badge-${guardia.role === 'admin' ? 'primary' : 'success'}`}>
                    {guardia.role === 'admin' ? 'Administrador' : 'Guardia'}
                  </span>
                </td>
                <td>
                  {guardia.is_active && guardia.is_active_user !== false ? (
                    <span className="badge badge-success">Activo</span>
                  ) : (
                    <span className="badge badge-danger">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => openEditModal(guardia)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteModal(guardia)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {guardiasFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-message">
                  No se encontraron guardias
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="stats-summary">
        <span>Total: {guardiasFiltrados.length} usuarios</span>
        <span>Guardias: {guardias.filter(g => g.role === 'guardia').length}</span>
        <span>Admins: {guardias.filter(g => g.role === 'admin').length}</span>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Usuario</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre de Usuario *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="jsmith"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contraseña *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="Juan López Hernández"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="juan@empresa.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="55 1234 5678"
                    />
                  </div>
                  <div className="form-group">
                    <label>Rol *</label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      required
                    >
                      <option value="guardia">Guardia</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Número de Empleado</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.numero_empleado}
                      onChange={(e) => handleChange('numero_empleado', e.target.value)}
                      placeholder="EMP-001"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedGuardia && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Usuario</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre de Usuario *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="jsmith"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nueva Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.new_password}
                      onChange={(e) => handleChange('new_password', e.target.value)}
                      placeholder="Dejar vacío para no cambiar"
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="Juan López Hernández"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="juan@empresa.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="55 1234 5678"
                    />
                  </div>
                  <div className="form-group">
                    <label>Rol *</label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      required
                    >
                      <option value="guardia">Guardia</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Número de Empleado</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.numero_empleado}
                      onChange={(e) => handleChange('numero_empleado', e.target.value)}
                      placeholder="EMP-001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      className="form-control"
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => handleChange('is_active', e.target.value === 'true')}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Actualizar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedGuardia && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar Usuario</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="modal-body">
              <p>¿Estás seguro de que deseas eliminar al usuario <strong>{selectedGuardia.username}</strong>?</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Esta acción eliminará al usuario y no podrá ser recuperada.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardiasPage;