import { useState, useEffect } from 'react';
import { vehiculosService } from '../services/api';
import './VehiculosPage.css';

const TIPOS_ENTIDAD = [
  { value: 'tracto', label: 'Tractocamión' },
  { value: 'empleado', label: 'Vehículo de empleado' },
  { value: 'visitante', label: 'Vehículo de visitante' },
];

const CATEGORIAS = [
  { value: 'tractocamion', label: 'Tractocamión' },
  { value: 'camioneta', label: 'Camioneta' },
  { value: 'automovil', label: 'Automóvil' },
  { value: 'moto', label: 'Moto' },
  { value: 'otro', label: 'Otro' },
];

const emptyFormData = {
  placa: '',
  clave_interna: '',
  tipo_entidad: 'tracto',
  categoria: 'tractocamion',
  marca: '',
  modelo: '',
  color: '',
  empresa: '',
  propietario: '',
};

const VehiculosPage = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      setLoading(true);
      const response = await vehiculosService.getAll();
      setVehiculos(response.data || []);
    } catch (err) {
      console.error('Error loading vehiculos:', err);
      setError('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const vehiculosFiltrados = vehiculos.filter((v) => {
    const matchesSearch =
      v.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.clave_interna?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marca?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !filtroTipo || v.tipo_entidad === filtroTipo;
    return matchesSearch && matchesTipo;
  });

  const getBadgeClass = (tipo) => {
    switch (tipo) {
      case 'tracto': return 'badge-tracto';
      case 'empleado': return 'badge-empleado';
      case 'visitante': return 'badge-visitante';
      default: return '';
    }
  };

  const getTipoLabel = (tipo) => {
    const found = TIPOS_ENTIDAD.find((t) => t.value === tipo);
    return found ? found.label : tipo;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await vehiculosService.create(formData);
      setSuccess('Vehículo creado correctamente');
      setShowModal(false);
      setFormData(emptyFormData);
      loadVehiculos();
    } catch (err) {
      console.error('Error creating vehiculo:', err);
      const errorMsg =
        err.response?.data?.placa?.[0] ||
        err.response?.data?.error ||
        'Error al crear vehículo';
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
      await vehiculosService.update(selectedVehiculo.id, formData);
      setSuccess('Vehículo actualizado correctamente');
      setShowEditModal(false);
      setSelectedVehiculo(null);
      setFormData(emptyFormData);
      loadVehiculos();
    } catch (err) {
      console.error('Error updating vehiculo:', err);
      const errorMsg =
        err.response?.data?.placa?.[0] ||
        err.response?.data?.error ||
        'Error al actualizar vehículo';
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
      await vehiculosService.deactivate(selectedVehiculo.id);
      setSuccess('Vehículo desactivado correctamente');
      setShowDeactivateModal(false);
      setSelectedVehiculo(null);
      loadVehiculos();
    } catch (err) {
      console.error('Error deactivating vehiculo:', err);
      setError(err.response?.data?.error || 'Error al desactivar vehículo');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setFormData({
      placa: vehiculo.placa || '',
      clave_interna: vehiculo.clave_interna || '',
      tipo_entidad: vehiculo.tipo_entidad || 'tracto',
      categoria: vehiculo.categoria || 'tractocamion',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      color: vehiculo.color || '',
      empresa: vehiculo.empresa || '',
      propietario: vehiculo.propietario || '',
    });
    setError(null);
    setSuccess(null);
    setShowEditModal(true);
  };

  const openDeactivateModal = (vehiculo) => {
    setSelectedVehiculo(vehiculo);
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
    setSelectedVehiculo(null);
    setFormData(emptyFormData);
    setError(null);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div className="vehiculos-page">
      <div className="page-header">
        <div>
          <h2>Gestión de Vehículos</h2>
          <p>Catálogo de vehículos registrados</p>
        </div>

        <button className="btn btn-primary" onClick={() => {
          setFormData(emptyFormData);
          setError(null);
          setSuccess(null);
          setShowModal(true);
        }}>
          <i className="bi bi-plus-circle"></i>
          Agregar Vehículo
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
            placeholder="Buscar por placa, clave o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los tipos</option>
          {TIPOS_ENTIDAD.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Clave Interna</th>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Marca/Modelo</th>
              <th>Empresa</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.map((vehiculo) => (
              <tr key={vehiculo.id}>
                <td><strong>{vehiculo.clave_interna || '-'}</strong></td>
                <td><strong>{vehiculo.placa}</strong></td>
                <td>
                  <span className={`badge ${getBadgeClass(vehiculo.tipo_entidad)}`}>
                    {getTipoLabel(vehiculo.tipo_entidad)}
                  </span>
                </td>
                <td>{vehiculo.marca} {vehiculo.modelo}</td>
                <td>{vehiculo.empresa || '-'}</td>
                <td>
                  {vehiculo.activo !== false ? (
                    <span className="badge badge-success">Activo</span>
                  ) : (
                    <span className="badge badge-danger">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => openEditModal(vehiculo)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    {vehiculo.activo !== false && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => openDeactivateModal(vehiculo)}
                        title="Desactivar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {vehiculosFiltrados.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-message">
                  No se encontraron vehículos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="stats-summary">
        <span>Total: {vehiculosFiltrados.length} vehículos</span>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Vehículo</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Placa *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.placa}
                      onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
                      placeholder="ABC-1234"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Clave Interna</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.clave_interna}
                      onChange={(e) => handleChange('clave_interna', e.target.value.toUpperCase())}
                      placeholder="TRACT-001"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Entidad *</label>
                    <select
                      className="form-control"
                      value={formData.tipo_entidad}
                      onChange={(e) => handleChange('tipo_entidad', e.target.value)}
                      required
                    >
                      {TIPOS_ENTIDAD.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Categoría *</label>
                    <select
                      className="form-control"
                      value={formData.categoria}
                      onChange={(e) => handleChange('categoria', e.target.value)}
                      required
                    >
                      {CATEGORIAS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Marca</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.marca}
                      onChange={(e) => handleChange('marca', e.target.value)}
                      placeholder="Kenworth"
                    />
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.modelo}
                      onChange={(e) => handleChange('modelo', e.target.value)}
                      placeholder="T680"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                      placeholder="Blanco"
                    />
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

                <div className="form-group">
                  <label>Propietario</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.propietario}
                    onChange={(e) => handleChange('propietario', e.target.value)}
                    placeholder="Nombre del propietario"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Crear Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedVehiculo && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Vehículo</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Placa *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.placa}
                      onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
                      placeholder="ABC-1234"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Clave Interna</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.clave_interna}
                      onChange={(e) => handleChange('clave_interna', e.target.value.toUpperCase())}
                      placeholder="TRACT-001"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Entidad *</label>
                    <select
                      className="form-control"
                      value={formData.tipo_entidad}
                      onChange={(e) => handleChange('tipo_entidad', e.target.value)}
                      required
                    >
                      {TIPOS_ENTIDAD.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Categoría *</label>
                    <select
                      className="form-control"
                      value={formData.categoria}
                      onChange={(e) => handleChange('categoria', e.target.value)}
                      required
                    >
                      {CATEGORIAS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Marca</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.marca}
                      onChange={(e) => handleChange('marca', e.target.value)}
                      placeholder="Kenworth"
                    />
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.modelo}
                      onChange={(e) => handleChange('modelo', e.target.value)}
                      placeholder="T680"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                      placeholder="Blanco"
                    />
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

                <div className="form-group">
                  <label>Propietario</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.propietario}
                    onChange={(e) => handleChange('propietario', e.target.value)}
                    placeholder="Nombre del propietario"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAllModals}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Actualizar Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeactivateModal && selectedVehiculo && (
        <div className="modal-overlay" onClick={closeAllModals}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Desactivar Vehículo</h3>
              <button className="btn-close" onClick={closeAllModals}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="modal-body">
              <p>¿Estás seguro de que deseas desactivar el vehículo <strong>{selectedVehiculo.placa}</strong>?</p>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                El vehículo ya no aparecerá en las listas de selección pero se mantendrá en el historial.
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

export default VehiculosPage;