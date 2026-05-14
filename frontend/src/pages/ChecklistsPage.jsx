import { useState, useEffect } from 'react';
import { checklistsService } from '../services/api';
import './ChecklistsPage.css';

const ChecklistsPage = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await checklistsService.getAll({ limit: 100 });
      setChecklists(response.data || []);
    } catch (err) {
      console.error('Error loading checklists:', err);
      setError('Error al cargar checklists');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstatusBadge = (estatus) => {
    switch (estatus) {
      case 'aprobado':
        return 'badge-success';
      case 'rechazado':
        return 'badge-danger';
      case 'condicionado':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const handleVerClick = (checklist) => {
    setSelectedChecklist(checklist);
    setShowDetailModal(true);
  };

  const getItemStatusIcon = (valor) => {
    switch (valor) {
      case 'OK':
        return <span className="item-status item-ok">OK</span>;
      case 'MAL':
        return <span className="item-status item-mal">MAL</span>;
      case 'N/A':
        return <span className="item-status item-na">N/A</span>;
      default:
        return <span className="item-status">-</span>;
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando checklists...</p>
      </div>
    );
  }

  return (
    <div className="checklists-page">
      <div className="page-header">
        <div>
          <h2>Checklists Tracto</h2>
          <p>Historial de inspecciones realizadas</p>
        </div>

        <button className="btn btn-secondary" onClick={loadChecklists}>
          <i className="bi bi-arrow-clockwise"></i>
          Actualizar
        </button>
      </div>

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
              <th>Fecha/Hora</th>
              <th>Vehículo</th>
              <th>Conductor</th>
              <th>Estatus</th>
              <th>Guardia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {checklists.map((checklist) => (
              <tr key={checklist.id}>
                <td>{formatDateTime(checklist.fecha_hora)}</td>
                <td>
                  <strong>{checklist.vehiculo?.placa || '-'}</strong>
                </td>
                <td>{checklist.conductor?.nombre_completo || '-'}</td>
                <td>
                  <span className={`badge ${getEstatusBadge(checklist.estatus_general)}`}>
                    {checklist.estatus_general}
                  </span>
                </td>
                <td>{checklist.guardia?.username || '-'}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleVerClick(checklist)}
                  >
                    <i className="bi bi-eye"></i> Ver
                  </button>
                </td>
              </tr>
            ))}
            {checklists.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-message">
                  No se encontraron checklists
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDetailModal && selectedChecklist && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle de Checklist</h3>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="checklist-meta">
                <div className="meta-item">
                  <span className="meta-label">Fecha/Hora:</span>
                  <span className="meta-value">{formatDateTime(selectedChecklist.fecha_hora)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Vehículo:</span>
                  <span className="meta-value">
                    <strong>{selectedChecklist.vehiculo?.placa || '-'}</strong>
                    {selectedChecklist.vehiculo?.clave_interna && (
                      <span className="text-muted"> ({selectedChecklist.vehiculo.clave_interna})</span>
                    )}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Conductor:</span>
                  <span className="meta-value">{selectedChecklist.conductor?.nombre_completo || '-'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Estatus:</span>
                  <span className={`badge ${getEstatusBadge(selectedChecklist.estatus_general)}`}>
                    {selectedChecklist.estatus_general}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Guardia:</span>
                  <span className="meta-value">{selectedChecklist.guardia?.username || '-'}</span>
                </div>
              </div>

              <h4 className="section-title">Inspección de Partes</h4>
              <div className="checklist-items-grid">
                <div className="item-row header">
                  <span>Parte</span>
                  <span>Estado</span>
                  <span>Observaciones</span>
                </div>
                {selectedChecklist.items && selectedChecklist.items.length > 0 ? (
                  selectedChecklist.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <span className="item-nombre">{item.nombre || item.parte || '-'}</span>
                      {getItemStatusIcon(item.valor)}
                      <span className="item-obs">{item.observaciones || '-'}</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-message">No hay items de inspección registrados</div>
                )}
              </div>

              {selectedChecklist.observaciones_generales && (
                <>
                  <h4 className="section-title">Observaciones Generales</h4>
                  <p className="observaciones">{selectedChecklist.observaciones_generales}</p>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistsPage;