import { useState, useEffect } from 'react';
import { auditoriaService } from '../services/api';
import './BitacoraPage.css';

const BitacoraPage = () => {
  const [bitacora, setBitacora] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadBitacora();
  }, []);

  const loadBitacora = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await auditoriaService.getBitacora();
      setBitacora(response.data || []);
    } catch (err) {
      console.error('Error loading bitacora:', err);
      setError('Error al cargar bitácora');
    } finally {
      setLoading(false);
    }
  };

  const bitacoraFiltrada = bitacora.filter((b) => {
    const matchesSearch =
      b.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.usuario?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.modulo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModulo = !filtroModulo || b.modulo === filtroModulo;
    const matchesAccion = !filtroAccion || b.accion === filtroAccion;
    return matchesSearch && matchesModulo && matchesAccion;
  });

  const handleExportCSV = () => {
    setExporting(true);
    const headers = ['Fecha', 'Usuario', 'Módulo', 'Acción', 'Descripción', 'Detalle'];
    const csvContent = [
      headers.join(','),
      ...bitacoraFiltrada.map((b) =>
        [
          new Date(b.fecha).toLocaleString('es-MX'),
          b.usuario?.username || '',
          b.modulo || '',
          b.accion || '',
          `"${(b.descripcion || '').replace(/"/g, '""')}"`,
          `"${(b.detalle || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bitacora_${new Date().toISOString().split('T')[0]}.csv`;
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

  const getAccionBadge = (accion) => {
    switch (accion) {
      case 'CREATE':
        return 'badge-create';
      case 'UPDATE':
        return 'badge-update';
      case 'DELETE':
        return 'badge-delete';
      case 'DEACTIVATE':
        return 'badge-deactivate';
      case 'LOGIN':
        return 'badge-login';
      case 'LOGOUT':
        return 'badge-logout';
      default:
        return 'badge-default';
    }
  };

  const modulosUnicos = [...new Set(bitacora.map((b) => b.modulo).filter(Boolean))].sort();
  const accionesUnicas = [...new Set(bitacora.map((b) => b.accion).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-large"></div>
        <p>Cargando bitácora...</p>
      </div>
    );
  }

  return (
    <div className="bitacora-page">
      <div className="page-header no-print">
        <div>
          <h2>Bitácora de Cambios</h2>
          <p>Historial completo de acciones en el sistema</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={loadBitacora}>
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
        <div className="error-message no-print">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="filters-bar no-print">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Buscar en descripción, usuario o módulo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filtroModulo}
          onChange={(e) => setFiltroModulo(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los módulos</option>
          {modulosUnicos.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={filtroAccion}
          onChange={(e) => setFiltroAccion(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas las acciones</option>
          {accionesUnicas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Usuario</th>
              <th>Módulo</th>
              <th>Acción</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {bitacoraFiltrada.map((item) => (
              <tr key={item.id}>
                <td>{formatDateTime(item.fecha)}</td>
                <td>
                  <strong>{item.usuario?.username || '-'}</strong>
                </td>
                <td>{item.modulo || '-'}</td>
                <td>
                  <span className={`badge ${getAccionBadge(item.accion)}`}>
                    {item.accion}
                  </span>
                </td>
                <td>{item.descripcion || '-'}</td>
              </tr>
            ))}
            {bitacoraFiltrada.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-message">
                  No se encontraron registros en la bitácora
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="stats-summary no-print">
        <span>Total: {bitacoraFiltrada.length} registros</span>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .bitacora-page { padding: 20px; }
          .table-container { overflow-x: auto; }
          .data-table { font-size: 10px; }
          .data-table th, .data-table td { padding: 6px; }
        }
      `}</style>
    </div>
  );
};

export default BitacoraPage;