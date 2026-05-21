import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { turnosService, usuariosService } from '../services/api';
import './TurnosPage.css';

const TurnosPage = () => {
  const { isAdmin } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [turnoAbierto, setTurnoAbierto] = useState(null);
  const [guardias, setGuardias] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    loadTurnos();
    if (isAdmin) {
      loadGuardias();
    }
  }, []);

  const showToast = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const loadGuardias = async () => {
    try {
      const response = await usuariosService.getAll({ role: 'guardia' });
      setGuardias(response.data || []);
    } catch (error) {
      console.error('Error loading guardias:', error);
    }
  };

  const loadTurnos = async () => {
    try {
      setLoading(true);
      const response = await turnosService.getAll();
      setTurnos(response.data || []);

      const abierto = response.data?.find((t) => t.abierto);
      setTurnoAbierto(abierto || null);
    } catch (error) {
      console.error('Error loading turnos:', error);
      showToast('Error al cargar turnos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const abrirTurno = async (tipoTurno, fecha, guardiaId = null) => {
    if (!guardiaId && isAdmin) {
      showToast('Por favor selecciona un guardia', 'error');
      return;
    }

    try {
      const data = { tipo_turno: tipoTurno, fecha };
      if (isAdmin && guardiaId) {
        data.guardia_id = guardiaId;
      }
      const response = await turnosService.create(data);
      setShowOpenModal(false);
      loadTurnos();

      const guardia = guardias.find(g => g.id === guardiaId);
      const guardiaNombre = guardia ? (guardia.full_name || guardia.username) : 'Usuario';

      showToast(
        `Turno ${tipoTurno} abierto para ${guardiaNombre} a las ${formatTime(new Date())}`,
        'success'
      );
    } catch (error) {
      console.error('Error opening turno:', error);
      const errorMsg = error.response?.data?.error || 'No se pudo abrir el turno';
      showToast(errorMsg, 'error');
    }
  };

  const cerrarTurno = async () => {
    if (!turnoAbierto) {
      showToast('No hay turno abierto para cerrar', 'error');
      return;
    }

    try {
      await turnosService.close(turnoAbierto.id, {});
      setShowCloseModal(false);
      loadTurnos();
      showToast('Turno cerrado exitosamente', 'success');
    } catch (error) {
      console.error('Error closing turno:', error);
      const errorMsg = error.response?.data?.error || 'No se pudo cerrar el turno';
      showToast(errorMsg, 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="turnos-page">
        <div className="page-loading">
          <div className="spinner-large"></div>
          <p>Cargando turnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="turnos-page">
      <div className="page-header">
        <div>
          <h2>Gestión de Turnos</h2>
          <p>Control de turnos de guardias</p>
        </div>

        {!turnoAbierto && (
          <button className="btn btn-primary" onClick={() => setShowOpenModal(true)}>
            <i className="bi bi-plus-circle"></i>
            Abrir Turno
          </button>
        )}

        {turnoAbierto && (
          <div className="turno-activo-badge">
            <i className="bi bi-clock-fill"></i>
            Turno {turnoAbierto.tipo_turno} activo
          </div>
        )}
      </div>

      {message && (
        <div className={`toast-message toast-${messageType}`}>
          <i className={`bi ${messageType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
          <span>{message}</span>
          <button className="toast-close" onClick={() => setMessage(null)}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {turnoAbierto && (
        <div className="turno-activo-card">
          <div className="turno-info">
            <h3><i className="bi bi-clock-history"></i> Turno Actual</h3>
            <div className="turno-details">
              <div className="detail">
                <span className="label"><i className="bi bi-calendar3"></i> Tipo:</span>
                <span className="value badge-matutino">{turnoAbierto.tipo_turno}</span>
              </div>
              <div className="detail">
                <span className="label"><i className="bi bi-calendar-event"></i> Fecha:</span>
                <span className="value">{formatDate(turnoAbierto.fecha)}</span>
              </div>
              <div className="detail">
                <span className="label"><i className="bi bi-play-circle"></i> Hora apertura:</span>
                <span className="value highlight">{formatTime(turnoAbierto.hora_apertura)}</span>
              </div>
              <div className="detail">
                <span className="label"><i className="bi bi-person-badge"></i> Guardia:</span>
                <span className="value">{turnoAbierto.guardia_full_name || turnoAbierto.guardia_username || '-'}</span>
              </div>
            </div>
          </div>

          <div className="turno-actions">
            <button
              className="btn btn-danger"
              onClick={() => setShowCloseModal(true)}
            >
              <i className="bi bi-stop-circle"></i>
              Cerrar Turno
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Guardia</th>
              <th>Hora Apertura</th>
              <th>Hora Cierre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((turno) => (
              <tr key={turno.id}>
                <td>{formatDate(turno.fecha)}</td>
                <td>
                  <span className="badge-tipo">{turno.tipo_turno}</span>
                </td>
                <td>{turno.guardia_full_name || turno.guardia_username || '-'}</td>
                <td>{formatTime(turno.hora_apertura)}</td>
                <td>{turno.hora_cierre ? formatTime(turno.hora_cierre) : '-'}</td>
                <td>
                  {turno.abierto ? (
                    <span className="badge badge-success">Abierto</span>
                  ) : (
                    <span className="badge badge-secondary">Cerrado</span>
                  )}
                </td>
                <td>
                  {!turno.abierto && (
                    <Link to={`/turnos/${turno.id}`} className="btn btn-sm">
                      <i className="bi bi-eye"></i> Ver detalles
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {turnos.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-message">
                  No hay turnos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showOpenModal && (
        <div className="modal-overlay" onClick={() => setShowOpenModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-plus-circle"></i> Abrir Nuevo Turno</h3>
              <button className="btn-close" onClick={() => setShowOpenModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label"><i className="bi bi-clock"></i> Tipo de Turno</label>
                <select id="tipoTurno" className="form-control">
                  <option value="matutino">Matutino</option>
                  <option value="vespertino">Vespertino</option>
                  <option value="nocturno">Nocturno</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label"><i className="bi bi-calendar3"></i> Fecha</label>
                <input type="date" id="fechaTurno" className="form-control" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              {isAdmin && (
                <div className="form-group">
                  <label className="form-label"><i className="bi bi-person-badge"></i> Guardia *</label>
                  <select id="guardiaTurno" className="form-control">
                    <option value="">-- Seleccionar guardia --</option>
                    {guardias.map((g) => (
                      <option key={g.id} value={g.id}>{g.full_name || g.username} ({g.username})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowOpenModal(false)}>
                <i className="bi bi-x-circle"></i> Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const tipo = document.getElementById('tipoTurno').value;
                  const fecha = document.getElementById('fechaTurno').value;
                  const guardiaId = isAdmin ? document.getElementById('guardiaTurno').value : null;
                  abrirTurno(tipo, fecha, guardiaId ? parseInt(guardiaId) : null);
                }}
              >
                <i className="bi bi-check-circle"></i> Abrir Turno
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && (
        <div className="modal-overlay" onClick={() => setShowCloseModal(false)}>
          <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-exclamation-triangle"></i> Confirmar Cierre</h3>
              <button className="btn-close" onClick={() => setShowCloseModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="modal-body">
              <p className="confirm-text">
                ¿Estás seguro de que deseas cerrar el turno actual?
              </p>
              {turnoAbierto && (
                <div className="confirm-details">
                  <p><strong>Tipo:</strong> {turnoAbierto.tipo_turno}</p>
                  <p><strong>Guardia:</strong> {turnoAbierto.guardia_full_name || turnoAbierto.guardia_username}</p>
                  <p><strong>Hora apertura:</strong> {formatTime(turnoAbierto.hora_apertura)}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>
                <i className="bi bi-x-circle"></i> Cancelar
              </button>
              <button className="btn btn-danger" onClick={cerrarTurno}>
                <i className="bi bi-stop-circle"></i> Cerrar Turno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurnosPage;