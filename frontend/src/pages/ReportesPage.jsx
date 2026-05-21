import { useState, useEffect } from 'react';
import { platformApi } from '../services/api';
import './ReportesPage.css';

const ReportesPage = () => {
  const [reportes, setReportes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReportes();
  }, []);

  const loadReportes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await platformApi.get('/reportes/');
      setReportes(response.data);
    } catch (err) {
      console.error('Error loading reportes:', err);
      setError('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const response = await platformApi.get('/reportes/export/pdf/', {
        responseType: 'blob',
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_lra_${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Error al exportar PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await platformApi.get('/reportes/export/excel/', {
        responseType: 'blob',
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_lra_${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting Excel:', err);
      setError('Error al exportar Excel');
    } finally {
      setExporting(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('es-MX');
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div className="reportes-page">
      <div className="page-header no-print">
        <div>
          <h2>Reportes y Estadísticas</h2>
          <p>Resumen general del sistema</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={loadReportes}>
            <i className="bi bi-arrow-clockwise"></i>
            Actualizar
          </button>
          <button className="btn btn-warning" onClick={handleExportExcel} disabled={exporting}>
            <i className="bi bi-file-excel"></i>
            {exporting ? 'Generando...' : 'Exportar Excel'}
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF} disabled={exporting}>
            <i className="bi bi-file-pdf"></i>
            {exporting ? 'Generando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message no-print">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="report-content">
        <div className="report-header">
          <h1>Reporte General del Sistema</h1>
          <p>Fecha de generación: {new Date().toLocaleString('es-MX')}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-car-front"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{formatNumber(reportes?.total_vehiculos)}</span>
              <span className="stat-label">Total Vehículos</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-clipboard-check"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{formatNumber(reportes?.total_checklists_tracto)}</span>
              <span className="stat-label">Checklists Tracto</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-person-badge"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{formatNumber(reportes?.total_registros)}</span>
              <span className="stat-label">Registros de Acceso</span>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon">
              <i className="bi bi-clock"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{formatNumber(reportes?.total_turnos_abiertos)}</span>
              <span className="stat-label">Turnos Abiertos</span>
            </div>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>Registros por Tipo de Entidad</h3>
            <div className="chart-data">
              {reportes?.registros_por_tipo?.length > 0 ? (
                reportes.registros_por_tipo.map((item) => (
                  <div key={item.tipo_entidad} className="data-row">
                    <span className="data-label">{item.tipo_entidad || 'Sin tipo'}</span>
                    <span className="data-value">{formatNumber(item.total)}</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No hay datos disponibles</p>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3>Movimientos por Tipo</h3>
            <div className="chart-data">
              {reportes?.movimientos_por_tipo?.length > 0 ? (
                reportes.movimientos_por_tipo.map((item) => (
                  <div key={item.tipo_movimiento} className="data-row">
                    <span className="data-label">{item.tipo_movimiento || 'Sin tipo'}</span>
                    <span className="data-value">{formatNumber(item.total)}</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No hay datos disponibles</p>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3>Checklists por Estatus</h3>
            <div className="chart-data">
              {reportes?.checklists_por_estatus?.length > 0 ? (
                reportes.checklists_por_estatus.map((item) => (
                  <div key={item.estatus_general} className="data-row">
                    <span className={`badge badge-${item.estatus_general}`}>
                      {item.estatus_general || 'Sin estatus'}
                    </span>
                    <span className="data-value">{formatNumber(item.total)}</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No hay datos disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .reportes-page { padding: 20px; }
          .report-header { text-align: center; margin-bottom: 30px; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .stat-card { border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
          .charts-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
          .chart-card { border: 1px solid #ccc; padding: 15px; border-radius: 8px; }
          .report-header h1 { font-size: 24px; margin: 0; }
          .report-header p { color: #666; margin: 5px 0 0 0; }
        }
      `}</style>
    </div>
  );
};

export default ReportesPage;