import { useState, useEffect } from 'react';
import { conductoresService } from '../services/api';
import './ConductoresPage.css';

const emptyFormData = {
  nombre_completo: '',
  licencia: '',
  telefono: '',
  empresa: '',
};

const ConductoresPage = () => {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    loadConductores();
  }, []);

  const loadConductores = async () => {
    try {
      setLoading(true);
      const response = await conductoresService.getAll();
      setConductores(response.data || []);
    } catch (err) {
      console.error('Error loading conductores:', err);
      setError('Error al cargar conductores');
    } finally {
      setLoading(false);
    }
  };

  const conductoresFiltrados = conductores.filter((c) =>
    c.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.licencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await conductoresService.create(formData);
      setSuccess('Conductor creado correctamente');
      setShowModal(false);
      setFormData(emptyFormData);
      loadConductores();
    } catch (err) {
      console.error('Error creating conductor:', err);
      const errorMsg =
        err.response?.data?.nombre_completo?.[0] ||
        err.response?.data?.licencia?.[0] ||
        err.response?.data?.error ||
        'Error al crear conductor';
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
      await conductoresService.update(selectedConductor.id, formData);
      setSuccess('Conductor actualizado correctamente');
      setShowEditModal(false);
      setSelectedConductor(null);
      setFormData(emptyFormData);
      loadConductores();
    } catch (err) {
      console.error('Error updating conductor:', err);
      const errorMsg =
        err.response?.data?.nombre_completo?.[0] ||
        err.response?.data?.licencia?.[0] ||
        err.response?.data?.error ||
        'Error al actualizar conductor';
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
      await conductoresService.deactivate(selectedConductor.id);
      setSuccess('Conductor desactivado correctamente');
      setShowDeactivateModal(false);
      setSelectedConductor(null);
      loadConductores();
    } catch (err) {
      console.error('Error deactivating conductor:', err);
      setError(err.response?.data?.error || 'Error al desactivar conductor');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (conductor) => {
    setSelectedConductor(conductor);
    setFormData({
      nombre_completo: conductor.nombre_completo || '',
      licencia: conductor.licencia || '',
      telefono: conductor.telefono || '',
      empresa: conductor.empresa || '',
    });
    setError(null);
    setSuccess(null);
    setShowEditModal(true);
  };

  const openDeactivateModal = (conductor) => {
    setSelectedConductor(conductor);
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
    setSelectedConductor(null);
    setFormData(emptyFormData);
    setError(null);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando conductores...</p>
      </div>
    );
  }

  return (
    <div className="conductores-page">
      <div className="page-header">
        <div>
          <h2>Gestión de Conductores</h2>
          <p>Catálogo de conductores registrados</p>
        </div>

        <button className="btn btn-primary" onClick={() => {
          setFormData(emptyFormData);
          setError(null);
          setSuccess(null);
          setShowModal(true);
        }}>
          <i className="bi bi-plus-circle"></i>
          Agregar Conductor
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
            placeholder="Buscar por nombre, licencia o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Licencia</th>
              <th>Teléfono</th>
              <th>Empresa</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conductoresFiltrados.map((conductor) => (
              <tr key={conductor.id}>
                <td><strong>{conductor.nombre_completo}</strong></td>
                <td>{conductor.licencia || '-'}</td>
                <td>{conductor.telefono || '-'}</td>
                <td>{conductor.empresa || '-'}</td>
                <td>
                  {conductor.activo !== false ? (
                    <span className="badge badge-success">Activo</span>
                  ) : (
                    <span className="badge badge-danger">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => openEditModal(conductor)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    {conductor.activo !== false && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => openDeactivateModal(conductor)}
                        title="Desactivar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {conductoresFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-message">
                  No se encontraron conductores
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="stats-summary">
        <span>Total: {conductoresFiltrados.length} conductores</span>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Conductor</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombre_completo}
                    onChange={(e) => handleChange('nombre_completo', e.target.value)}
                    placeholder="Juan Pérez García"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Licencia</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.licencia}
                      onChange={(e) => handleChange('licencia', e.target.value.toUpperCase())}
                      placeholder="ABC123456"
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="123-456-7890"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Empresa</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.empresa}
                    onChange={(e) => handleChange('empresa', e.target.value)}
                    placeholder="Transportes del Norte"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Crear Conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedConductor && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Conductor</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombre_completo}
                    onChange={(e) => handleChange('nombre_completo', e.target.value)}
                    placeholder="Juan Pérez García"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Licencia</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.licencia}
                      onChange={(e) => handleChange('licencia', e.target.value.toUpperCase())}
                      placeholder="ABC123456"
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      placeholder="123-456-7890"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Empresa</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.empresa}
                    onChange={(e) => handleChange('empresa', e.target.value)}
                    placeholder="Transportes del Norte"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Actualizar Conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeactivateModal && selectedConductor && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Desactivar Conductor</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="modal-body">
              <p>¿Estás seguro de que deseas desactivar al conductor <strong>{selectedConductor.nombre_completo}</strong>?</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                El conductor ya no aparecerá en las listas de selección pero se mantendrá en el historial.
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

export default ConductoresPage;