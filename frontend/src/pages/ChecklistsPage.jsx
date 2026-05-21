import { useState, useEffect } from 'react';
import { checklistsService } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  const handleVerClick = async (checklist) => {
    try {
      const response = await checklistsService.getById(checklist.id);
      setSelectedChecklist(response.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error loading checklist detail:', err);
      setError('Error al cargar detalle del checklist');
    }
  };

  const getItemStatusIcon = (valor) => {
    switch (valor) {
      case 'ok':
      case 'OK':
        return <span className="item-status item-ok">OK</span>;
      case 'mal':
      case 'MAL':
      case 'Falla':
        return <span className="item-status item-mal">Falla</span>;
      case 'na':
      case 'N/A':
        return <span className="item-status item-na">N/A</span>;
      case 'bueno':
        return <span className="item-status item-ok">Bueno</span>;
      case 'malo':
        return <span className="item-status item-mal">Malo</span>;
      case 'regular':
        return <span className="item-status item-regular">Regular</span>;
      default:
        return <span className="item-status">{valor || '-'}</span>;
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    const data = selectedChecklist;

    doc.addImage('/LOGO.png', 'PNG', 85, 8, 40, 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('REPORTE DE CHECKLIST LRA', 105, 36, { align: 'center' });

    doc.setDrawColor(5, 150, 105);
    doc.line(15, 40, 195, 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Fecha: ${formatDateTime(data.fecha_hora)}`, 15, 50);
    doc.text(`Vehículo: ${data.vehiculo_info?.placa || '-'} - ${data.vehiculo_info?.clave_interna || ''}`, 15, 57);
    doc.text(`Conductor: ${data.conductor_info?.nombre_completo || '-'}`, 15, 64);
    doc.text(`Estatus: ${data.estatus_general?.toUpperCase() || '-'}`, 15, 71);
    doc.text(`Guardia: ${data.guardia_username || '-'}`, 15, 78);

    const grupos = groupResultsBySection(data.resultados || []);
    let yPos = 88;

    grupos.forEach((grupo) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      autoTable(doc, {
        startY: yPos,
        head: [[grupo.seccionDisplay]],
        body: grupo.items.map(item => [
          item.item_info?.nombre || '-',
          item.valor?.toUpperCase() || '-',
          item.observacion || '-'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 8 }
      });

      yPos = doc.lastAutoTable.finalY + 8;
    });

    if (data.llantas && data.llantas.length > 0) {
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('ESTADO DE LLANTAS', 105, 20, { align: 'center' });

      const bodyLlantas = data.llantas.map(ll => [
        ll.posicion_display || ll.posicion,
        ll.estado_display || ll.estado,
        ll.observacion || '-'
      ]);

      autoTable(doc, {
        startY: 28,
        head: [['Posición', 'Estado', 'Observación']],
        body: bodyLlantas,
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105] }
      });

      let firmaY = doc.lastAutoTable.finalY + 15;

      if (data.firma_operador_data || data.firma_vigilante_data) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('FIRMAS', 105, firmaY, { align: 'center' });

        if (data.firma_operador_data) {
          doc.addImage(data.firma_operador_data, 'PNG', 35, firmaY + 5, 60, 25);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`Operador: ${data.nombre_operador || '-'}`, 65, firmaY + 35, { align: 'center' });
        }

        if (data.firma_vigilante_data) {
          doc.addImage(data.firma_vigilante_data, 'PNG', 115, firmaY + 5, 60, 25);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`Vigilante: ${data.nombre_vigilante || '-'}`, 145, firmaY + 35, { align: 'center' });
        }
      }

      if (data.observaciones_generales) {
        let obsY = doc.lastAutoTable.finalY + 10;
        if (data.firma_operador_data || data.firma_vigilante_data) {
          obsY = Math.max(obsY, firmaY + 50);
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('OBSERVACIONES GENERALES', 15, obsY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(data.observaciones_generales, 180);
        doc.text(lines, 15, obsY + 7);
      }
    } else if (data.firma_operador_data || data.firma_vigilante_data) {
      let firmaY = doc.lastAutoTable.finalY + 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('FIRMAS', 105, firmaY, { align: 'center' });

      if (data.firma_operador_data) {
        doc.addImage(data.firma_operador_data, 'PNG', 35, firmaY + 5, 60, 25);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Operador: ${data.nombre_operador || '-'}`, 65, firmaY + 35, { align: 'center' });
      }

      if (data.firma_vigilante_data) {
        doc.addImage(data.firma_vigilante_data, 'PNG', 115, firmaY + 5, 60, 25);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Vigilante: ${data.nombre_vigilante || '-'}`, 145, firmaY + 35, { align: 'center' });
      }

      if (data.observaciones_generales) {
        const obsY = doc.lastAutoTable.finalY + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('OBSERVACIONES GENERALES', 15, obsY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(data.observaciones_generales, 180);
        doc.text(lines, 15, obsY + 7);
      }
    }

    if (data.evidencias && data.evidencias.length > 0) {
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('EVIDENCIAS FOTOGRÁFICAS', 105, 20, { align: 'center' });

      let evY = 30;
      data.evidencias.forEach((ev) => {
        if (evY > 240) {
          doc.addPage();
          evY = 20;
        }
        try {
          doc.addImage(ev.imagen, 'PNG', 40, evY, 130, 80);
          evY += 85;
        } catch (e) {
          console.error('Error adding image:', e);
        }
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`checklist_${data.id}_${Date.now()}.pdf`);
  };

  const groupResultsBySection = (resultados) => {
    const grouped = {};
    resultados.forEach((r) => {
      const seccion = r.item_info?.seccion || 'otros';
      const seccionDisplay = r.item_info?.seccion_display || 'Otros';
      if (!grouped[seccion]) {
        grouped[seccion] = { seccion, seccionDisplay, items: [] };
      }
      grouped[seccion].items.push(r);
    });
    return Object.values(grouped);
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
                  <strong>{checklist.vehiculo_info?.placa || '-'}</strong>
                </td>
                <td>{checklist.conductor_info?.nombre_completo || '-'}</td>
                <td>
                  <span className={`badge ${getEstatusBadge(checklist.estatus_general)}`}>
                    {checklist.estatus_general}
                  </span>
                </td>
                <td>{checklist.guardia_username || '-'}</td>
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
              <h3>Detalle de Checklist - {selectedChecklist.vehiculo_info?.placa || '-'}</h3>
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
                    <strong>{selectedChecklist.vehiculo_info?.placa || '-'}</strong>
                    {selectedChecklist.vehiculo_info?.clave_interna && (
                      <span className="text-muted"> ({selectedChecklist.vehiculo_info.clave_interna})</span>
                    )}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Conductor:</span>
                  <span className="meta-value">{selectedChecklist.conductor_info?.nombre_completo || '-'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Estatus:</span>
                  <span className={`badge ${getEstatusBadge(selectedChecklist.estatus_general)}`}>
                    {selectedChecklist.estatus_general}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Guardia:</span>
                  <span className="meta-value">{selectedChecklist.guardia_username || '-'}</span>
                </div>
              </div>

              <h4 className="section-title">Inspección de Partes ({selectedChecklist.resultados?.length || 0} items)</h4>

              {selectedChecklist.resultados && selectedChecklist.resultados.length > 0 ? (
                groupResultsBySection(selectedChecklist.resultados).map((seccion) => (
                  <div key={seccion.seccion} className="checklist-items-section">
                    <div className="checklist-items-section-header">
                      <span className="checklist-items-section-title">
                        {seccion.seccionDisplay}
                        <span className="checklist-items-section-count">
                          {seccion.items.length} items
                        </span>
                      </span>
                      <i className="bi bi-chevron-down checklist-items-section-chevron"></i>
                    </div>
                    <table className="checklist-items-table">
                      <thead>
                        <tr>
                          <th>Componente</th>
                          <th>Estado</th>
                          <th>Observación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seccion.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="item-nombre-cell">
                              {item.item_info?.nombre || '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {getItemStatusIcon(item.valor)}
                            </td>
                            <td className="item-obs-cell">
                              {item.observacion || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <div className="empty-message">No hay items de inspección registrados</div>
              )}

              {selectedChecklist.llantas && selectedChecklist.llantas.length > 0 && (
                <>
                  <h4 className="section-title">Estado de Llantas ({selectedChecklist.llantas.length} posiciones)</h4>
                  <div className="llantas-grid">
                    {selectedChecklist.llantas.map((llanta, idx) => (
                      <div key={idx} className="llanta-item">
                        <div className="llanta-posicion">
                          {llanta.posicion_display || llanta.posicion}
                        </div>
                        <div className="llanta-estado">
                          {llanta.estado_display || llanta.estado}
                          {llanta.observacion && ` - ${llanta.observacion}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedChecklist.observaciones_generales && (
                <>
                  <h4 className="section-title">Observaciones Generales</h4>
                  <p className="observaciones">{selectedChecklist.observaciones_generales}</p>
                </>
              )}

              {selectedChecklist.evidencias && selectedChecklist.evidencias.length > 0 && (
                <>
                  <h4 className="section-title">Evidencias Fotográficas</h4>
                  <div className="evidencias-grid">
                    {selectedChecklist.evidencias.map((ev, idx) => (
                      <div key={idx} className="evidencia-item">
                        <img
                          src={ev.imagen}
                          alt={`Evidencia ${idx + 1}`}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {ev.descripcion && (
                          <p className="evidencia-desc">{ev.descripcion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedChecklist.firma_operador_data && (
                <>
                  <h4 className="section-title">Firmas</h4>
                  <div className="firmas-section">
                    <div className="firma-item">
                      <p className="firma-label">Firma Operador</p>
                      <img
                        src={selectedChecklist.firma_operador_data}
                        alt="Firma Operador"
                        className="firma-img"
                      />
                      <p className="firma-nombre">{selectedChecklist.nombre_operador || '-'}</p>
                    </div>
                    <div className="firma-item">
                      <p className="firma-label">Firma Vigilante</p>
                      <img
                        src={selectedChecklist.firma_vigilante_data}
                        alt="Firma Vigilante"
                        className="firma-img"
                      />
                      <p className="firma-nombre">{selectedChecklist.nombre_vigilante || '-'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={generarPDF}>
                <i className="bi bi-file-earmark-pdf"></i> Exportar PDF
              </button>
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