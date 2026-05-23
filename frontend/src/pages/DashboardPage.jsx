import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  vehiculosService,
  registrosService,
  turnosService,
  checklistsService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import './DashboardPage.css';

const COLORS = ['#2563eb', '#059669', '#f59e0b', '#dc2626'];

const DashboardPage = () => {
  const { user } = useAuth();
  const { connected, dashboardData, requestUpdate } = useWebSocket();
  const [stats, setStats] = useState({
    totalRegistros: 0,
    turnosAbiertos: 0,
    totalVehiculos: 0,
    totalChecklists: 0,
  });
  const [turnosStats, setTurnosStats] = useState({
    abiertos: 0,
    cerrados_hoy: 0,
    total: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (dashboardData) {
      setStats({
        totalRegistros: dashboardData.total_registros || 0,
        turnosAbiertos: dashboardData.total_turnos_abiertos || 0,
        totalVehiculos: dashboardData.total_vehiculos || 0,
        totalChecklists: dashboardData.total_checklists_tracto || 0,
      });
      setTurnosStats({
        abiertos: dashboardData.total_turnos_abiertos || 0,
        cerrados_hoy: 0,
        total: dashboardData.total_turnos_abiertos || 0,
      });
      setLoading(false);
      setError(null);
    }
  }, [dashboardData]);

  const loadDashboardData = async () => {
    if (dashboardData) return;
    
    try {
      setLoading(true);
      setError(null);

      const [turnosRes, vehiculosRes, checklistsRes, registrosRes] = await Promise.all([
        turnosService.getAll().catch(() => ({ data: [] })),
        vehiculosService.getAll().catch(() => ({ data: [] })),
        checklistsService.getAll().catch(() => ({ data: [] })),
        registrosService.getAll().catch(() => ({ data: [] })),
      ]);

      const turnosAbiertos = (turnosRes.data || []).filter((t) => t.abierto)?.length || 0;
      const cerradosHoy = (turnosRes.data || []).filter((t) => {
        if (t.abierto) return false;
        const fechaCierre = new Date(t.hora_cierre);
        const hoy = new Date();
        return fechaCierre.toDateString() === hoy.toDateString();
      })?.length || 0;

      const vehiculosActivos = (vehiculosRes.data || []).filter((v) => v.activo)?.length || 0;
      const checklistsTotal = (checklistsRes.data || []).length || 0;
      const registrosTotal = (registrosRes.data || []).length || 0;

      setStats({
        totalRegistros: registrosTotal,
        turnosAbiertos,
        totalVehiculos: vehiculosActivos,
        totalChecklists: checklistsTotal,
      });

      setTurnosStats({
        abiertos: turnosAbiertos,
        cerrados_hoy: cerradosHoy,
        total: (turnosRes.data || []).length,
      });

      const recent = (registrosRes.data || []).slice(0, 10);
      setRecentActivity(recent);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="dashboard-error">
        <i className="bi bi-exclamation-triangle"></i>
        <p>{error}</p>
        <button onClick={loadDashboardData} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-banner">
          <h2>Bienvenido, {user?.username}</h2>
          <p>Resumen de usuarios en la plataforma</p>
        </div>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          <i className={`bi ${connected ? 'bi-wifi' : 'bi-wifi-off'}`}></i>
          <span>{connected ? 'Tiempo Real' : 'Sin conexión'}</span>
        </div>
      </div>

      <div className="stats-grid">
        <Link to="/registros" className="stat-card stat-primary">
          <div className="stat-icon">
            <i className="bi bi-car-front"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalRegistros}</h3>
            <p>Total Accesos</p>
          </div>
        </Link>

        <Link to="/turnos" className="stat-card stat-success">
          <div className="stat-icon">
            <i className="bi bi-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.turnosAbiertos}</h3>
            <p>Turnos Abiertos</p>
          </div>
        </Link>

        <Link to="/vehiculos" className="stat-card stat-info">
          <div className="stat-icon">
            <i className="bi bi-truck"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalVehiculos}</h3>
            <p>Vehículos</p>
          </div>
        </Link>

        <Link to="/checklists" className="stat-card stat-warning">
          <div className="stat-icon">
            <i className="bi bi-clipboard-check"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalChecklists}</h3>
            <p>Checklists Tracto</p>
          </div>
        </Link>
      </div>

      <div className="turnos-status">
        <h4><i className="bi bi-clock"></i> Estado de Turnos</h4>
        <div className="turnos-stats">
          <div className="turno-stat abierto">
            <span className="number">{turnosStats.abiertos}</span>
            <span className="label">Abiertos</span>
          </div>
          <div className="turno-stat cerrado">
            <span className="number">{turnosStats.cerrados_hoy}</span>
            <span className="label">Cerrados Hoy</span>
          </div>
          <div className="turno-stat total">
            <span className="number">{turnosStats.total}</span>
            <span className="label">Total</span>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <div className="activity-header">
          <h4><i className="bi bi-clock-history"></i> Últimos Accesos</h4>
          <Link to="/registros" className="btn-link">Ver todos</Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p>No hay accesos registrados</p>
            <small>Los registros aparecerán cuando se realicen entradas y salidas</small>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((reg) => (
              <div key={reg.id} className="activity-item">
                <div className="activity-icon">
                  <i className={reg.tipo_movimiento === 'entrada' ? 'bi bi-arrow-right-square' : 'bi bi-arrow-left-square'}></i>
                </div>
                <div className="activity-info">
                  <span className="activity-type">{reg.tipo_entidad_display || reg.tipo_entidad}</span>
                  <span className="activity-vehiculo">
                    {reg.vehiculo_info?.placa || reg.vehiculo_info?.clave_interna || 'Sin vehículo'}
                  </span>
                </div>
                <div className="activity-time">
                  {new Date(reg.fecha_hora).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;