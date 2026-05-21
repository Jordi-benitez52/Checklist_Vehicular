import { useState, useEffect } from 'react';
import {
  asignacionesService,
  conductoresService,
  vehiculosService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AsignacionesPage.css';

const AsignacionesPage = () => {
  const { isAdmin } = useAuth();
  const [asignaciones, setAsignaciones] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ conductor_id: '', vehiculo_id: '', observaciones: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [asignacionesRes, conductoresRes, vehiculosRes] = await Promise.all([
        asignacionesService.getConductorVehiculo().catch(() => ({ data: [] })),
        conductoresService.getAll().catch(() => ({ data: [] })),
        vehiculosService.getAll().catch(() => ({ data: [] })),
      ]);

      setAsignaciones(asignacionesRes.data || []);
      setConductores(conductoresRes.data || []);
      setVehiculos(vehiculosRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const validateAsignacion = () => {
    if (!formData.conductor_id) {
      return 'Debes seleccionar un conductor';
    }
    if (!formData.vehiculo_id) {
      return 'Debes seleccionar un vehículo';
    }

    const conductorActivo = asignaciones.find(
      (a) => a.conductor === parseInt(formData.conductor_id) && a.activa
    );
    if (conductorActivo) {
      return 'Este conductor ya tiene una asignación activa';
    }

    const vehiculoActivo = asignaciones.find(
      (a) => a.vehiculo === parseInt(formData.vehiculo_id) && a.activa
    );
    if (vehiculoActivo) {
      return 'Este vehículo ya tiene un conductor asignado';
    }

    return null;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateAsignacion();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await asignacionesService.createConductorVehiculo({
        conductor_id: formData.conductor_id,
        vehiculo_id: formData.vehiculo_id,
        observaciones: formData.observaciones,
      });
      setSuccess('Asignación creada correctamente');
      setShowModal(false);
      setFormData({ conductor_id: '', vehiculo_id: '', observaciones: '' });
      loadData();
    } catch (err) {
      console.error('Error creating assignment:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.conductor?.[0] ||
        err.response?.data?.vehiculo?.[0] ||
        'Error al crear asignación';
      setError(errorMsg);
    }
  };

  const handleDesasignar = async (id) => {
    if (!window.confirm('¿Estás seguro de desasignar este conductor?')) return;
    try {
      await asignacionesService.desasignarConductorVehiculo(id);
      setSuccess('Conductor desasignado correctamente');
      loadData();
    } catch (err) {
      console.error('Error desasigning:', err);
      setError('Error al desasignar');
    }
  };

  if (!isAdmin()) {
    return (
      <div className="access-denied">
        <i className="bi bi-shield-lock"></i>
        <h3>Acceso denegado</h3>
        <p>Solo los administradores pueden gestionar asignaciones.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando asignaciones...</p>
      </div>
    );
  }

  return (
    <div className="asignaciones-page">
      <div className="page-header">
        <div>
          <h2>Asignaciones Conductor-Vehículo</h2>
          <p>Gestión de asignaciones formales</p>
        </div>

        <button className="btn btn-primary" onClick={() => {
          setShowModal(true);
          setError(null);
          setSuccess(null);
        }}>
          <i className="bi bi-plus-circle"></i>
          Nueva Asignación
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

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Conductor</th>
              <th>Vehículo (Placa)</th>
              <th>Fecha Asignación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaciones.map((asign) => (
              <tr key={asign.id}>
                <td>
                  <strong>{asign.conductor_nombre || '-'}</strong>
                </td>
                <td>
                  <strong>{asign.vehiculo_placa || '-'}</strong>
                  <br />
                  <small>{asign.vehiculo_marca || '-'}</small>
                </td>
                <td>
                  {asign.fecha_asignacion
                    ? new Date(asign.fecha_asignacion).toLocaleDateString('es-MX')
                    : '-'}
                </td>
                <td>
                  {asign.activa ? (
                    <span className="badge badge-success">Activa</span>
                  ) : (
                    <span className="badge badge-secondary">Inactiva</span>
                  )}
                </td>
                <td>
                  {asign.activa && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDesasignar(asign.id)}
                    >
                      <i className="bi bi-x-circle"></i> Desasignar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {asignaciones.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-message">
                  No hay asignaciones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Asignación</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Conductor *</label>
                  <select
                    className="form-control"
                    value={formData.conductor_id}
                    onChange={(e) => {
                      setFormData({ ...formData, conductor_id: e.target.value });
                      setError(null);
                    }}
                    required
                  >
                    <option value="">Seleccionar conductor...</option>
                    {conductores
                      .filter((c) => c.activo !== false)
                      .map((c) => {
                        const yaAsignado = asignaciones.some(
                          (a) => a.conductor === c.id && a.activa
                        );
                        return (
                          <option key={c.id} value={c.id} disabled={yaAsignado}>
                            {yaAsignado
                              ? `${c.nombre_completo} (YA ASIGNADO)`
                              : `${c.nombre_completo} - ${c.licencia || c.numero_licencia || 'Sin licencia'}`}
                          </option>
                        );
                      })}
                  </select>
                  <small className="form-text text-muted">
                    Solo muestra conductores sin asignación activa
                  </small>
                </div>

                <div className="form-group">
                  <label>Vehículo (Tracto) *</label>
                  <select
                    className="form-control"
                    value={formData.vehiculo_id}
                    onChange={(e) => {
                      setFormData({ ...formData, vehiculo_id: e.target.value });
                      setError(null);
                    }}
                    required
                  >
                    <option value="">Seleccionar vehículo...</option>
                    {vehiculos
                      .filter((v) => v.tipo_entidad === 'tracto' && v.activo !== false)
                      .map((v) => {
                        const yaAsignado = asignaciones.some(
                          (a) => a.vehiculo === v.id && a.activa
                        );
                        return (
                          <option key={v.id} value={v.id} disabled={yaAsignado}>
                            {yaAsignado
                              ? `${v.placa} (YA ASIGNADO)`
                              : `${v.placa} - ${v.marca} ${v.modelo}`}
                          </option>
                        );
                      })}
                  </select>
                  <small className="form-text text-muted">
                    Solo muestra tractocamiones sin conductor asignado
                  </small>
                </div>

                <div className="form-group">
                  <label>Observaciones</label>
                  <textarea
                    className="form-control"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows="3"
                    placeholder="Observaciones opcionales..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsignacionesPage;