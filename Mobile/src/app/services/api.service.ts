import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // ================================================================
  // NOTA: La URL del API se configura en:
  //   src/environments/environment.ts (desarrollo)
  //   src/environments/environment.prod.ts (producción)
  //
  // Cambia el valor de 'apiUrl' según el servidor donde esté
  // corriendo el backend Django.
  // ================================================================

  private readonly baseUrl = environment.apiUrl.replace('/platform', '');
  private readonly platformUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private apiUrl(): string {
    return this.platformUrl;
  }

  private authUrl(): string {
    return this.baseUrl;
  }

  // =========================
  // TURNOS
  // =========================

  getTurnos(abierto: boolean = null, guardiaId: number = null): Observable<any[]> {
    const params: any = {};
    if (abierto !== null) params['abierto'] = abierto;
    if (guardiaId) params['guardia'] = guardiaId;
    return this.http.get<any[]>(this.apiUrl() + '/turnos/', {
      params: this.buildParams(params)
    });
  }

  getTurnoActivo(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/turnos/', {
      params: this.buildParams({ abierto: true })
    });
  }

  crearTurno(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl() + '/turnos/crear/', data);
  }

  cerrarTurno(id: number, observaciones: string = '', firmaData: string = ''): Observable<any> {
    const formData = new FormData();
    if (observaciones) formData.append('observaciones_cierre', observaciones);
    if (firmaData) formData.append('firma_cierre', firmaData);
    return this.http.patch<any>(this.apiUrl() + '/turnos/' + id + '/cerrar/', formData);
  }

  // =========================
  // AUTH / TOKEN
  // =========================

  login(credentials: any): Observable<any> {
    return this.http.post<any>(this.authUrl() + '/accounts/login/', credentials);
  }

  verifyCode(tempToken: string, code: string): Observable<any> {
    return this.http.post<any>(this.authUrl() + '/accounts/login/verify-code/', {
      temp_token: tempToken,
      code
    });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(this.authUrl() + '/accounts/password-reset/', { email });
  }

  confirmPasswordReset(data: { email: string; code: string; new_password: string }): Observable<any> {
    return this.http.post<any>(this.authUrl() + '/accounts/password-reset/confirm/', data);
  }

  refreshToken(refresh: string): Observable<any> {
    return this.http.post<any>(this.authUrl() + '/accounts/refresh/', { refresh });
  }

  verifyToken(token: string): Observable<any> {
    return this.http.post<any>(this.authUrl() + '/accounts/token/verify/', { token });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.patch<any>(this.authUrl() + '/accounts/me/editar/', data);
  }

  changePassword(data: { actual: string; nueva: string }): Observable<any> {
    return this.http.post<any>(this.authUrl() + '/accounts/change-password/', data);
  }

  // =========================
  // VEHÍCULOS
  // =========================

  getVehiculos(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/vehiculos/', {
      params: this.buildParams(params)
    });
  }

  getVehiculosPorTipo(tipoEntidad: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/vehiculos/', {
      params: this.buildParams({ tipo_entidad: tipoEntidad })
    });
  }

  buscarVehiculos(query: string, tipoBusqueda: string = 'placa'): Observable<any[]> {
    const params: any = {};
    if (tipoBusqueda === 'placa') {
      params['placa'] = query;
    } else if (tipoBusqueda === 'clave') {
      params['clave_interna'] = query;
    }
    return this.http.get<any[]>(this.apiUrl() + '/vehiculos/', {
      params: this.buildParams(params)
    });
  }

  getVehiculoDetalle(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl() + '/vehiculos/' + id + '/');
  }

  crearVehiculo(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl() + '/vehiculos/crear/', data);
  }

  actualizarVehiculo(id: number, data: any): Observable<any> {
    return this.http.put<any>(this.apiUrl() + '/vehiculos/' + id + '/editar/', data);
  }

  desactivarVehiculo(id: number): Observable<any> {
    return this.http.patch<any>(this.apiUrl() + '/vehiculos/' + id + '/desactivar/', {});
  }

  // =========================
  // EMPLEADOS / CONDUCTORES
  // =========================

  getEmpleados(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/empleados/', {
      params: this.buildParams(params)
    });
  }

  getConductores(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/conductores/', {
      params: this.buildParams(params)
    });
  }

  getAsignaciones(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/asignaciones/', {
      params: this.buildParams(params)
    });
  }

  getEmpleadosConVehiculoAsignado(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/asignaciones/empleados-con-vehiculo/');
  }

  getVehiculosDisponibles(tipo_movimiento?: string, tipo?: string): Observable<any[]> {
    const params: any = {};
    if (tipo_movimiento) params.tipo_movimiento = tipo_movimiento;
    if (tipo) params.tipo = tipo;
    return this.http.get<any[]>(this.apiUrl() + '/vehiculos/disponibles/', {
      params: this.buildParams(params)
    });
  }

  getEmpleadosConVehiculoDisponible(tipo_movimiento?: string): Observable<any[]> {
    const params: any = {};
    if (tipo_movimiento) params.tipo_movimiento = tipo_movimiento;
    return this.http.get<any[]>(this.apiUrl() + '/asignaciones/empleados-con-vehiculo-disponible/', {
      params: this.buildParams(params)
    });
  }

  getConductoresDisponibles(tipo_movimiento?: string, vehiculoId?: number): Observable<any[]> {
    const params: any = {};
    if (tipo_movimiento) params.tipo_movimiento = tipo_movimiento;
    if (vehiculoId) params.vehiculo_id = vehiculoId;
    return this.http.get<any[]>(this.apiUrl() + '/conductores/disponibles/', {
      params: this.buildParams(params)
    });
  }

  // =========================
  // VISITANTES
  // =========================

  getVisitantes(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/visitantes/', {
      params: this.buildParams(params)
    });
  }

  getVisitantesPendientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/visitantes/pendientes/');
  }

  crearVisitante(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl() + '/visitantes/', data);
  }

  // =========================
  // REGISTROS DE ACCESO
  // =========================

  getRegistrosAcceso(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/registros-acceso/', {
      params: this.buildParams(params)
    });
  }

  crearRegistroAcceso(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl() + '/registros-acceso/crear/', data);
  }

  getRegistrosAccesoPorTurno(turnoId: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/registros-acceso/', {
      params: this.buildParams({ turno: turnoId })
    });
  }

  getMovimientosRecientes(): Observable<any[]> {
    return this.getRegistrosAcceso();
  }

  // =========================
  // CHECKLIST GENERAL
  // =========================

  getPlantillasChecklist(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/plantillas-checklist/', {
      params: this.buildParams(params)
    });
  }

  getChecklistsRegistro(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/checklists-registro/', {
      params: this.buildParams(params)
    });
  }

  crearChecklistRegistro(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl() + '/checklists-registro/crear/', data);
  }

  // =========================
  // CHECKLIST TRACTO
  // =========================

  getChecklistTractoCatalogo(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/checklists-tracto/catalogo-items/', {
      params: this.buildParams(params)
    });
  }

  getRegistrosTractoPendientes(): Observable<any[]> {
    return this.getRegistrosAcceso({
      tipo_entidad: 'tracto'
    });
  }

  getChecklistsTracto(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/checklists-tracto/', {
      params: this.buildParams(params)
    });
  }

  getChecklistsRecientes(params?: any): Observable<any[]> {
    return this.getChecklistsTracto(params);
  }

  crearChecklistTracto(data: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl() + '/checklists-tracto/crear/', data);
  }

  getChecklistTractoDetalle(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl() + '/checklists-tracto/' + id + '/');
  }

  // =========================
  // VEHÍCULOS EN INSTALACIÓN
  // =========================

  getVehiculosEnInstalacion(tipo?: string): Observable<any[]> {
    const params = tipo ? { tipo } : {};
    return this.http.get<any[]>(this.apiUrl() + '/vehiculos/en-instalacion/', {
      params: this.buildParams(params)
    });
  }

  getPendientesSalida(): Observable<any> {
    return this.http.get<any>(this.apiUrl() + '/registros-acceso/pendientes-salida/');
  }

  // =========================
  // AUDITORÍA / REPORTES
  // =========================

  getAuditoria(params?: any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl() + '/auditoria/', {
      params: this.buildParams(params)
    });
  }

  getReportes(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl() + '/reportes/', {
      params: this.buildParams(params)
    });
  }

  // =========================
  // UTILIDAD INTERNA
  // =========================

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();

    if (!params) {
      return httpParams;
    }

    Object.keys(params).forEach((key: string) => {
      const value = params[key];

      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}