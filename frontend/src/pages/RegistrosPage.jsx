import { useState, useEffect } from 'react';
import { registrosService } from '../services/api';
import './RegistrosPage.css';

const RegistrosPage = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadRegistros();
  }, []);

  const loadRegistros = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await registrosService.getAll({ limit: 200 });
      setRegistros(response.data || []);
    } catch (err) {
      console.error('Error loading registros:', err);
      setError('Error al cargar registros');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const registrosFiltrados = registros.filter((r) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      r.vehiculo_info?.placa?.toLowerCase().includes(searchLower) ||
      r.conductor_info?.nombre_completo?.toLowerCase().includes(searchLower) ||
      r.empleado_info?.nombre_completo?.toLowerCase().includes(searchLower);
    const matchesTipo = !filtroTipo || r.tipo_movimiento === filtroTipo;
    return matchesSearch && matchesTipo;
  });

  const handleExportCSV = () => {
    setExporting(true);
    const headers = ['Fecha/Hora', 'Tipo', 'Placa', 'Persona', 'Guardia', 'Checklist'];
    const csvContent = [
      headers.join(','),
      ...registrosFiltrados.map((r) =>
        [
          formatDateTime(r.fecha_hora),
          r.tipo_movimiento || '',
          r.vehiculo_info?.placa || '',
          r.conductor_info?.nombre_completo || r.empleado_info?.nombre_completo || r.visitante_info?.nombre_completo || '',
          r.guardia_username || '',
          r.checklist_realizado ? 'OK' : 'Pendiente',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registros_acceso_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando registros...</p>
      </div>
    );
  }

  return (
    <div className="registros-page">
      <div className="page-header">
        <div>
          <h2>Registros de Acceso</h2>
          <p>Historial de entradas y salidas</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={loadRegistros}>
            <i className="bi bi-arrow-clockwise"></i>
            Actualizar
          </button>
          <button className="btn btn-success" onClick={handleExportCSV} disabled={exporting}>
            <i className="bi bi-file-excel"></i>
            Exportar CSV
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF} disabled={exporting}>
            <i className="bi bi-file-pdf"></i>
            Exportar PDF
          </button>
        </div>
      </div>

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
            placeholder="Buscar por placa o persona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos</option>
          <option value="entrada">Entradas</option>
          <option value="salida">Salidas</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Tipo</th>
              <th>Placa</th>
              <th>Persona</th>
              <th>Guardia</th>
              <th>Checklist</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((registro) => (
              <tr key={registro.id}>
                <td>{formatDateTime(registro.fecha_hora)}</td>
                <td>
                  <span className={`badge ${registro.tipo_movimiento === 'entrada' ? 'badge-entrada' : 'badge-salida'}`}>
                    {registro.tipo_movimiento === 'entrada' ? (
                      <><i className="bi bi-arrow-down-circle"></i> Entrada</>
                    ) : (
                      <><i className="bi bi-arrow-up-circle"></i> Salida</>
                    )}
                  </span>
                </td>
                <td>
                  <strong>{registro.vehiculo_info?.placa || '-'}</strong>
                </td>
                <td>
                  {registro.conductor_info?.nombre_completo ||
                   registro.empleado_info?.nombre_completo ||
                   registro.visitante_info?.nombre_completo ||
                   '-'}
                </td>
                <td>{registro.guardia_username || '-'}</td>
                <td>
                  {registro.checklist_realizado ? (
                    <span className="badge badge-success">OK</span>
                  ) : (
                    <span className="badge badge-warning">Pendiente</span>
                  )}
                </td>
              </tr>
            ))}
            {registrosFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-message">
                  No se encontraron registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="stats-summary">
        <span>Total: {registrosFiltrados.length} registros</span>
      </div>

      <style>{`
        @media print {
          .page-header { display: none; }
          .filters-bar { display: none; }
          .stats-summary { display: none; }
          .registros-page { padding: 20px; }
          .table-container { overflow-x: auto; }
        }
      `}</style>
    </div>
  );
};

export default RegistrosPage;