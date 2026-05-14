import { useState, useEffect } from 'react';
import { notificacionesService } from '../services/api';
import './NotificacionesPage.css';

const NotificacionesPage = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await notificacionesService.getAll();
      setNotificaciones(response.data || []);
    } catch (err) {
      console.error('Error loading notificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificacionesService.markRead(id);
      setNotificaciones(notificaciones.map(n =>
        n.id === id ? { ...n, leida: true } : n
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificacionesService.markAllRead();
      setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getFilteredNotificaciones = () => {
    if (filter === 'no_leidas') {
      return notificaciones.filter(n => !n.leida);
    }
    return notificaciones;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} hr`;
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'turno_abierto':
        return 'bi-play-circle';
      case 'turno_cerrado':
        return 'bi-stop-circle';
      case 'alerta':
        return 'bi-exclamation-triangle';
      case 'recordatorio':
        return 'bi-clock-history';
      default:
        return 'bi-bell';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'turno_abierto':
        return 'success';
      case 'turno_cerrado':
        return 'info';
      case 'alerta':
        return 'warning';
      case 'recordatorio':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="notificaciones-page">
      <div className="page-header">
        <div>
          <h2>Notificaciones</h2>
          <p>Alertas y avisos del sistema</p>
        </div>

        {noLeidas > 0 && (
          <button className="btn btn-primary" onClick={markAllAsRead}>
            <i className="bi bi-check-all"></i>
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <i className="bi bi-bell"></i>
          <span>{notificaciones.length} notificaciones</span>
        </div>
        <div className="filter-group">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="todas">Todas</option>
            <option value="no_leidas">No leídas ({noLeidas})</option>
          </select>
        </div>
      </div>

      {noLeidas > 0 && (
        <div className="notif-summary">
          <i className="bi bi-info-circle"></i>
          Tienes {noLeidas} notificación(es) sin leer
        </div>
      )}

      {loading ? (
        <div className="page-loading">
          <div className="spinner-large"></div>
          <p>Cargando notificaciones...</p>
        </div>
      ) : (
        <div className="notificaciones-list">
          {getFilteredNotificaciones().length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bell-slash"></i>
              <h3>No hay notificaciones</h3>
              <p>Las notificaciones de turnos y alertas aparecerán aquí</p>
            </div>
          ) : (
            getFilteredNotificaciones().map((notif) => (
              <div
                key={notif.id}
                className={`notificacion-item ${notif.leida ? 'read' : 'unread'}`}
                onClick={() => !notif.leida && markAsRead(notif.id)}
              >
                <div className={`notif-icon ${getTipoColor(notif.tipo)}`}>
                  <i className={`bi ${getTipoIcon(notif.tipo)}`}></i>
                </div>
                <div className="notif-content">
                  <div className="notif-header">
                    <h4>{notif.titulo}</h4>
                    <span className="notif-time">{formatDate(notif.fecha_hora)}</span>
                  </div>
                  <p>{notif.mensaje}</p>
                  {!notif.leida && <span className="unread-dot"></span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificacionesPage;