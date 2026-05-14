import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { turnosService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './TurnosPage.css';

const TurnosPage = () => {
  const { isAdmin } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [turnoAbierto, setTurnoAbierto] = useState(null);
  const [guardias, setGuardias] = useState([]);

  useEffect(() => {
    loadTurnos();
    if (isAdmin) {
      loadGuardias();
    }
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const abrirTurno = async (tipoTurno, fecha, guardiaId = null) => {
    try {
      const data = { tipo_turno: tipoTurno, fecha };
      if (isAdmin && guardiaId) {
        data.guardia_id = guardiaId;
      }
      await turnosService.create(data);
      setShowModal(false);
      loadTurnos();
    } catch (error) {
      console.error('Error opening turno:', error);
      alert('Error al abrir turno');
    }
  };

  const cerrarTurno = async (id) => {
    if (!window.confirm('¿Estás seguro de cerrar este turno?')) return;

    try {
      await turnosService.close(id, {});
      loadTurnos();
    } catch (error) {
      console.error('Error closing turno:', error);
      alert('Error al cerrar turno');
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
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando turnos...</p>
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
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-circle"></i>
            Abrir Turno
          </button>
        )}

        {turnoAbierto && (
          <div className="turno-activo-badge">
            <i className="bi bi-clock"></i>
            Turno {turnoAbierto.tipo_turno} activo
          </div>
        )}
      </div>

      {turnoAbierto && (
        <div className="turno-activo-card">
          <div className="turno-info">
            <h3>Turno Actual</h3>
            <div className="turno-details">
              <div className="detail">
                <span className="label">Tipo:</span>
                <span className="value">{turnoAbierto.tipo_turno}</span>
              </div>
              <div className="detail">
                <span className="label">Fecha:</span>
                <span className="value">{formatDate(turnoAbierto.fecha)}</span>
              </div>
              <div className="detail">
                <span className="label">Hora apertura:</span>
                <span className="value">{formatTime(turnoAbierto.hora_apertura)}</span>
              </div>
              <div className="detail">
                <span className="label">Guardia:</span>
                <span className="value">{turnoAbierto.guardia?.username || '-'}</span>
              </div>
            </div>
          </div>

          <div className="turno-actions">
            <button
              className="btn btn-success"
              onClick={() => cerrarTurno(turnoAbierto.id)}
            >
              <i className="bi bi-check-circle"></i>
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
                <td>{turno.guardia?.username || '-'}</td>
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
                      Ver detalles
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Abrir Nuevo Turno</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tipo de Turno</label>
                <select id="tipoTurno" className="form-control">
                  <option value="matutino">Matutino</option>
                  <option value="vespertino">Vespertino</option>
                  <option value="nocturno">Nocturno</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fecha</label>
                <input type="date" id="fechaTurno" className="form-control" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              {isAdmin && (
                <div className="form-group">
                  <label>Guardia</label>
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
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
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
                Abrir Turno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurnosPage;