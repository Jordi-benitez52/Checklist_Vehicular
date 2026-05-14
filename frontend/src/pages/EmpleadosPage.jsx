import { useState, useEffect } from 'react';
import { empleadosService } from '../services/api';
import './EmpleadosPage.css';

const emptyFormData = {
  numero_empleado: '',
  nombre_completo: '',
  departamento: '',
  puesto: '',
};

const EmpleadosPage = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    loadEmpleados();
  }, []);

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      const response = await empleadosService.getAll();
      setEmpleados(response.data || []);
    } catch (err) {
      console.error('Error loading empleados:', err);
      setError('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const empleadosFiltrados = empleados.filter((e) =>
    e.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.numero_empleado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await empleadosService.create(formData);
      setSuccess('Empleado creado correctamente');
      setShowModal(false);
      setFormData(emptyFormData);
      loadEmpleados();
    } catch (err) {
      console.error('Error creating empleado:', err);
      const errorMsg =
        err.response?.data?.numero_empleado?.[0] ||
        err.response?.data?.nombre_completo?.[0] ||
        err.response?.data?.error ||
        'Error al crear empleado';
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
      await empleadosService.update(selectedEmpleado.id, formData);
      setSuccess('Empleado actualizado correctamente');
      setShowEditModal(false);
      setSelectedEmpleado(null);
      setFormData(emptyFormData);
      loadEmpleados();
    } catch (err) {
      console.error('Error updating empleado:', err);
      const errorMsg =
        err.response?.data?.numero_empleado?.[0] ||
        err.response?.data?.nombre_completo?.[0] ||
        err.response?.data?.error ||
        'Error al actualizar empleado';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      await empleadosService.deactivate(selectedEmpleado.id);
      setSuccess('Empleado desactivado correctamente');
      setShowDeactivateModal(false);
      setSelectedEmpleado(null);
      loadEmpleados();
    } catch (err) {
      console.error('Error deactivating empleado:', err);
      setError(err.response?.data?.error || 'Error al desactivar empleado');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (empleado) => {
    setSelectedEmpleado(empleado);
    setFormData({
      numero_empleado: empleado.numero_empleado || '',
      nombre_completo: empleado.nombre_completo || '',
      departamento: empleado.departamento || '',
      puesto: empleado.puesto || '',
    });
    setError(null);
    setSuccess(null);
    setShowEditModal(true);
  };

  const openDeactivateModal = (empleado) => {
    setSelectedEmpleado(empleado);
    setError(null);
    setSuccess(null);
    setShowDeactivateModal(true);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const closeAllModals = () => {
    setShowModal(false);
    setShowEditModal(false);
    setShowDeactivateModal(false);
    setSelectedEmpleado(null);
    setFormData(emptyFormData);
    setError(null);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando empleados...</p>
      </div>
    );
  }

  return (
    <div className="empleados-page">
      <div className="page-header">
        <div>
          <h2>Gestión de Empleados</h2>
          <p>Catálogo de empleados registrados</p>
        </div>

        <button className="btn btn-primary" onClick={() => {
          setFormData(emptyFormData);
          setError(null);
          setSuccess(null);
          setShowModal(true);
        }}>
          <i className="bi bi-plus-circle"></i>
          Agregar Empleado
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
            placeholder="Buscar por nombre, número o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Nombre Completo</th>
              <th>Departamento</th>
              <th>Puesto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.map((empleado) => (
              <tr key={empleado.id}>
                <td><strong>{empleado.numero_empleado}</strong></td>
                <td><strong>{empleado.nombre_completo}</strong></td>
                <td>{empleado.departamento || '-'}</td>
                <td>{empleado.puesto || '-'}</td>
                <td>
                  {empleado.activo !== false ? (
                    <span className="badge badge-success">Activo</span>
                  ) : (
                    <span className="badge badge-danger">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => openEditModal(empleado)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    {empleado.activo !== false && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => openDeactivateModal(empleado)}
                        title="Desactivar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {empleadosFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-message">
                  No se encontraron empleados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="stats-summary">
        <span>Total: {empleadosFiltrados.length} empleados</span>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Empleado</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Número de Empleado *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.numero_empleado}
                      onChange={(e) => handleChange('numero_empleado', e.target.value.toUpperCase())}
                      placeholder="EMP-001"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre_completo}
                      onChange={(e) => handleChange('nombre_completo', e.target.value)}
                      placeholder="María López Hernández"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Departamento</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.departamento}
                      onChange={(e) => handleChange('departamento', e.target.value)}
                      placeholder="Operaciones"
                    />
                  </div>
                  <div className="form-group">
                    <label>Puesto</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.puesto}
                      onChange={(e) => handleChange('puesto', e.target.value)}
                      placeholder="Supervisor de turno"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Crear Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedEmpleado && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Empleado</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Número de Empleado *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.numero_empleado}
                      onChange={(e) => handleChange('numero_empleado', e.target.value.toUpperCase())}
                      placeholder="EMP-001"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nombre_completo}
                      onChange={(e) => handleChange('nombre_completo', e.target.value)}
                      placeholder="María López Hernández"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Departamento</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.departamento}
                      onChange={(e) => handleChange('departamento', e.target.value)}
                      placeholder="Operaciones"
                    />
                  </div>
                  <div className="form-group">
                    <label>Puesto</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.puesto}
                      onChange={(e) => handleChange('puesto', e.target.value)}
                      placeholder="Supervisor de turno"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Actualizar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeactivateModal && selectedEmpleado && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Desactivar Empleado</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="modal-body">
              <p>¿Estás seguro de que deseas desactivar al empleado <strong>{selectedEmpleado.nombre_completo}</strong>?</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                El empleado ya no aparecerá en las listas de selección pero se mantendrá en el historial.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeactivate}
                disabled={submitting}
              >
                {submitting ? 'Desactivando...' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpleadosPage;