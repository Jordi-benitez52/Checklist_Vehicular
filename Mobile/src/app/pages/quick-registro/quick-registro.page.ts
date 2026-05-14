import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-quick-registro',
  templateUrl: './quick-registro.page.html',
  styleUrls: ['./quick-registro.page.scss'],
  standalone: false
})
export class QuickRegistroPage implements OnInit {

  tipoRegistro: 'entrada' | 'salida' = 'entrada';
  turnoActual: any = null;
  user: any = null;

  tipoEntidad: string = 'conductor';
  tiposEntidad = [
    { value: 'conductor', label: 'Conductor', icon: 'person' },
    { value: 'tracto', label: 'Tractocamión', icon: 'truck' },
    { value: 'empleado_empresa', label: 'Empleado (vehículo empresa)', icon: 'business' },
    { value: 'empleado_propio', label: 'Empleado (vehículo propio)', icon: 'car' },
    { value: 'visitante', label: 'Visitante', icon: 'person' },
  ];

  conductorId: number | null = null;
  conductores: any[] = [];
  conductoresDisponibles: any[] = [];
  conductoresDentro: any[] = [];
  conductorPendienteSalida: any = null;

  vehiculoSeleccionado: any = null;
  busquedaVehiculo: string = '';
  resultadosBusquedaVehiculo: any[] = [];
  todosTractocamiones: any[] = [];

  empleadoSeleccionado: any = null;
  vehiculoAsignadoInfo: any = null;
  busquedaEmpleado: string = '';
  resultadosBusquedaEmpleado: any[] = [];
  todosEmpleados: any[] = [];
  empleadosConVehiculo: any[] = [];

  visitantePrimerNombre: string = '';
  visitanteApellido: string = '';
  visitantePlacas: string = '';
  visitanteMotivo: string = '';

  empleadoPropioNombre: string = '';
  empleadoPropioApellido: string = '';
  empleadoPropioMarca: string = '';
  empleadoPropioPlaca: string = '';

  vehiculoPropioPlaca: string = '';
  vehiculoPropioMarca: string = '';

  observaciones: string = '';
  motivoSalida: string = '';

  evidenciaFile: File | null = null;
  evidenciaPreview: string = '';

  conductorNombre: string = '';
  conductorApellido: string = '';
  conductorPlaca: string = '';
  conductorMarca: string = '';

  private searchTimeout: any;

  tractosPendientesSalida: any[] = [];
  conductoresPendientesSalida: any[] = [];
  empleadosEmpresaPendientesSalida: any[] = [];
  empleadosPropioPendientesSalida: any[] = [];
  visitantesPendientesSalida: any[] = [];
  vehiculosEmpresaDentro: any[] = [];

  preSelectedVehiculoId: number | null = null;
  preSelectedVisitanteId: number | null = null;
  preSelectedTipo: string | null = null;

  get isTracto() { return this.tipoEntidad === 'tracto'; }
  get isConductor() { return this.tipoEntidad === 'conductor'; }
  get isEmpleadoEmpresa() { return this.tipoEntidad === 'empleado_empresa'; }
  get isEmpleadoPropio() { return this.tipoEntidad === 'empleado_propio'; }
  get isVisitante() { return this.tipoEntidad === 'visitante'; }
  get isSalida() { return this.tipoRegistro === 'salida'; }
  get isOtro() { return this.tipoEntidad === 'otro'; }

  get conductorNombreCompleto(): string {
    if (!this.conductorId) return '';
    const conductor = this.conductoresDisponibles.find(c => c.id === this.conductorId);
    return conductor ? conductor.nombre_completo : '';
  }

  getTractosPendientesSalida(): any[] {
    return this.tractosPendientesSalida;
  }

  getConductoresSinVehiculoDentro(): any[] {
    return this.conductoresPendientesSalida;
  }

  get observacionesCount() { return (this.observaciones || '').length; }

  get conductorPlacaCount() { return (this.conductorPlaca || '').length; }

  get visitanteMotivoCount() { return (this.visitanteMotivo || '').length; }
  get vehiculoPropioPlacaCount() { return (this.vehiculoPropioPlaca || '').length; }
  get visitantePlacasCount() { return (this.visitantePlacas || '').length; }
  get busquedaVehiculoCount() { return (this.busquedaVehiculo || '').length; }

  getEmpleadoPropioNombre(observaciones: string): string {
    if (!observaciones) return 'Sin nombre';
    if (observaciones.includes('[EMPLEADO PROPIO]')) {
      const parts = observaciones.replace('[EMPLEADO PROPIO]', '').split('|');
      return parts[0].trim() || 'Sin nombre';
    }
    return 'Sin nombre';
  }

  getEmpleadoPropioPlacas(observaciones: string): string {
    if (!observaciones) return 'N/A';
    const parts = observaciones.split('|');
    for (const p of parts) {
      if (p.includes('Placas:')) {
        return p.split('Placas:')[1].trim().split('|')[0].trim() || 'N/A';
      }
    }
    return 'N/A';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.tipoRegistro = this.route.snapshot.paramMap.get('tipo') as 'entrada' | 'salida';
    if (this.tipoRegistro !== 'entrada' && this.tipoRegistro !== 'salida') {
      this.tipoRegistro = 'entrada';
    }

    this.route.queryParams.subscribe(params => {
      this.preSelectedVehiculoId = params['vehiculoId'] ? Number(params['vehiculoId']) : null;
      this.preSelectedVisitanteId = params['visitanteId'] ? Number(params['visitanteId']) : null;
      this.preSelectedTipo = params['tipo'] || null;
    });

    this.user = this.authService.getUser();
    this.cargarDatosIniciales();
  }

  ionViewWillEnter(): void {
    this.cargarTodosEmpleados();
    if (this.tipoRegistro === 'entrada') {
      this.cargarConductoresDisponibles();
      this.apiService.getEmpleadosConVehiculoDisponible(this.tipoRegistro).subscribe({
        next: (empleadosConVehiculo) => {
          this.empleadosConVehiculo = empleadosConVehiculo || [];
        },
        error: () => {
          this.empleadosConVehiculo = [];
        }
      });
    }
    if (this.tipoRegistro === 'salida') {
      this.cargarPendientesSalida();
    }
  }

  cargarConductoresDisponibles(vehiculoId?: number): void {
    const vid = vehiculoId !== undefined
      ? vehiculoId
      : (this.tipoEntidad === 'tracto' && this.vehiculoSeleccionado?.id)
        ? this.vehiculoSeleccionado.id
        : null;
    this.apiService.getConductoresDisponibles(this.tipoRegistro, vid).subscribe({
      next: (conductores) => {
        this.conductoresDisponibles = conductores || [];
      },
      error: () => {
        this.conductoresDisponibles = [];
      }
    });
  }

  cargarPendientesSalida(): void {
    this.apiService.getPendientesSalida().subscribe({
      next: (data) => {
        this.tractosPendientesSalida = data.tractos_pendientes || [];
        this.conductoresPendientesSalida = data.conductores_pendientes || [];
        this.empleadosEmpresaPendientesSalida = data.empleados_empresa_pendientes || [];
        this.empleadosPropioPendientesSalida = data.empleados_propio_pendientes || [];
        this.visitantesPendientesSalida = data.visitantes_pendientes || [];
        this.procesarPreseleccion();
      }
    });

    this.apiService.getVehiculosEnInstalacion('empleado').subscribe({
      next: (vehiculos) => {
        this.vehiculosEmpresaDentro = vehiculos || [];
      }
    });
  }

  procesarPreseleccion(): void {
    if (this.preSelectedVehiculoId && this.preSelectedTipo === 'conductor') {
      const conductorPendiente = this.conductoresPendientesSalida.find(
        c => c.id === this.preSelectedVehiculoId
      );
      if (conductorPendiente) {
        this.conductorId = conductorPendiente.id;
        this.conductorPendienteSalida = conductorPendiente;
        this.tipoEntidad = 'conductor';
      }
    } else if (this.preSelectedVehiculoId && this.preSelectedTipo === 'tracto') {
      const conductorPendiente = this.conductoresPendientesSalida.find(
        c => c.vehiculo_id === this.preSelectedVehiculoId
      );
      if (conductorPendiente) {
        this.vehiculoSeleccionado = {
          id: conductorPendiente.vehiculo_id,
          placa: conductorPendiente.vehiculo_placa,
          clave_interna: conductorPendiente.vehiculo_clave_interna
        };
        this.conductorId = conductorPendiente.conductor_id;
        this.tipoEntidad = 'tracto';
        this.busquedaVehiculo = conductorPendiente.vehiculo_placa || '';
      }
    } else if (this.preSelectedVehiculoId && this.preSelectedTipo === 'empleado') {
      const vehiculoEmp = this.vehiculosEmpresaDentro.find(
        v => v.id === this.preSelectedVehiculoId
      );
      if (vehiculoEmp) {
        this.empleadoSeleccionado = vehiculoEmp.ultimo_empleado_info ? {
          id: vehiculoEmp.ultimo_empleado,
          nombre_completo: vehiculoEmp.ultimo_empleado_info.nombre_completo,
          numero_empleado: vehiculoEmp.ultimo_empleado_info.numero_empleado
        } : null;
        this.vehiculoSeleccionado = vehiculoEmp;
        this.tipoEntidad = 'empleado_empresa';
        this.busquedaEmpleado = vehiculoEmp.ultimo_empleado_info?.nombre_completo || '';
      }
    } else if (this.preSelectedVisitanteId && this.preSelectedTipo === 'visitante') {
      const visitantePendiente = this.visitantesPendientesSalida.find(
        v => v.id === this.preSelectedVisitanteId
      );
      if (visitantePendiente) {
        const nombreCompleto = visitantePendiente.visitante_nombre || '';
        const partes = nombreCompleto.split(' ');
        this.visitantePrimerNombre = partes[0] || '';
        this.visitanteApellido = partes.slice(1).join(' ') || '';
        this.visitantePlacas = visitantePendiente.visitante_placas || '';
        this.tipoEntidad = 'visitante';
      }
    }
  }

  async cargarDatosIniciales(): Promise<void> {
    const loading = await this.loadingController.create({ message: 'Cargando...' });
    await loading.present();

    this.apiService.getTurnos(true, this.user?.id).subscribe({
      next: (turnos) => {
        this.turnoActual = turnos && turnos.length > 0 ? turnos[0] : null;
      }
    });

    this.apiService.getConductores().subscribe({
      next: (conductores) => {
        this.conductores = conductores || [];
      }
    });

    this.apiService.getEmpleados().subscribe({
      next: (empleados) => {
        this.todosEmpleados = empleados || [];
      },
      error: () => {
        this.todosEmpleados = [];
      }
    });

    this.apiService.getEmpleadosConVehiculoDisponible(this.tipoRegistro).subscribe({
      next: (empleadosConVehiculo) => {
        this.empleadosConVehiculo = empleadosConVehiculo || [];
      },
      error: () => {
        this.empleadosConVehiculo = [];
      }
    });

    setTimeout(async () => {
      await loading.dismiss();
    }, 1000);
  }

  onTipoEntidadChange(): void {
    this.limpiarSeleccion();
    if (this.tipoRegistro === 'entrada' && this.tipoEntidad === 'tracto') {
      this.cargarConductoresDisponibles();
    }
  }

  onTipoRegistroChange(): void {
    this.limpiarSeleccion();
    if (this.tipoRegistro === 'salida') {
      this.cargarPendientesSalida();
    } else {
      this.tractosPendientesSalida = [];
      this.conductoresPendientesSalida = [];
      this.empleadosEmpresaPendientesSalida = [];
      this.empleadosPropioPendientesSalida = [];
      this.visitantesPendientesSalida = [];
    }
  }

  hayPendientes(): boolean {
    return (
      this.tractosPendientesSalida.length > 0 ||
      this.conductoresPendientesSalida.length > 0 ||
      this.empleadosEmpresaPendientesSalida.length > 0 ||
      this.empleadosPropioPendientesSalida.length > 0 ||
      this.visitantesPendientesSalida.length > 0
    );
  }

  limpiarSeleccion(): void {
    this.conductorId = null;
    this.conductorPendienteSalida = null;
    this.vehiculoSeleccionado = null;
    this.busquedaVehiculo = '';
    this.resultadosBusquedaVehiculo = [];
    this.empleadoSeleccionado = null;
    this.busquedaEmpleado = '';
    this.resultadosBusquedaEmpleado = [];
    this.visitantePrimerNombre = '';
    this.visitanteApellido = '';
    this.visitantePlacas = '';
    this.visitanteMotivo = '';
    this.empleadoPropioNombre = '';
    this.empleadoPropioApellido = '';
    this.empleadoPropioMarca = '';
    this.empleadoPropioPlaca = '';
    this.vehiculoPropioPlaca = '';
    this.vehiculoPropioMarca = '';
  }

  buscarTracto(event: any): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    const query = event?.target?.value || '';

    if (query.length === 0) {
      this.resultadosBusquedaVehiculo = [];
      return;
    }

    if (query.length < 2) {
      this.resultadosBusquedaVehiculo = [];
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.apiService.getVehiculosDisponibles(this.tipoRegistro, 'tracto').subscribe({
        next: (vehiculos) => {
          this.resultadosBusquedaVehiculo = (vehiculos || []).filter((v: any) =>
            v.placa?.toLowerCase().includes(query.toLowerCase()) ||
            v.clave_interna?.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 10);
        }
      });
    }, 300);
  }

  cargarTodosTractocamiones(): void {
    this.apiService.getVehiculosDisponibles(this.tipoRegistro, 'tracto').subscribe({
      next: (vehiculos) => {
        this.todosTractocamiones = vehiculos || [];
        this.resultadosBusquedaVehiculo = this.todosTractocamiones;
      }
    });
  }

  onInputPlaca(event: any, campo: 'vehiculo' | 'propio' | 'visitante' | 'busqueda' | 'conductor'): void {
    let value = (event.target.value || '').toUpperCase();
    if (value.length > 8) {
      value = value.substring(0, 8);
      event.target.value = value;
    }
    switch (campo) {
      case 'vehiculo': this.busquedaVehiculo = value; break;
      case 'propio': this.vehiculoPropioPlaca = value; break;
      case 'visitante': this.visitantePlacas = value; break;
      case 'busqueda': this.busquedaVehiculo = value; break;
      case 'conductor': this.conductorPlaca = value; break;
    }
  }

  onInputConductorPlaca(event: any): void {
    this.onInputPlaca(event, 'conductor');
  }

  seleccionarTracto(vehiculo: any): void {
    this.vehiculoSeleccionado = vehiculo;
    this.resultadosBusquedaVehiculo = [];
    this.busquedaVehiculo = vehiculo.clave_interna || vehiculo.placa;
    this.conductorId = null;
    this.conductoresDisponibles = [];
    this.tipoEntidad = 'tracto';
    this.cargarConductoresDisponibles();
  }

  seleccionarConductorPendiente(conductor: any): void {
    this.vehiculoSeleccionado = {
      id: conductor.vehiculo_id,
      placa: conductor.vehiculo_placa,
      clave_interna: conductor.vehiculo_clave_interna
    };
    this.conductorId = conductor.conductor_id;
    this.tipoEntidad = 'conductor';
  }

  seleccionarConductor(conductor: any): void {
    this.conductorId = conductor.id;
    this.conductoresDisponibles = [];
  }

  seleccionarTractoPendiente(tracto: any): void {
    this.conductorId = null;
    this.conductorPendienteSalida = null;
    this.conductorNombre = '';
    this.conductorApellido = '';
    this.conductorPlaca = '';
    this.conductorMarca = '';

    this.vehiculoSeleccionado = {
      id: tracto.vehiculo_id,
      placa: tracto.vehiculo_placa,
      clave_interna: tracto.vehiculo_clave_interna
    };
    this.conductorId = tracto.conductor_id;
    this.tipoEntidad = 'tracto';
  }

  seleccionarConductorPendienteSalida(cond: any): void {
    this.vehiculoSeleccionado = null;

    this.conductorId = cond.conductor_id;
    this.conductorPlaca = cond.conductor_placa || '';
    this.conductorMarca = cond.conductor_marca || '';
    if (cond.conductor_nombre) {
      const parts = cond.conductor_nombre.split(' ');
      this.conductorNombre = parts[0] || '';
      this.conductorApellido = parts.slice(1).join(' ') || '';
    }
    this.tipoEntidad = 'conductor';
  }

  seleccionarEmpleadoEmpresaPendiente(emp: any): void {
    this.vehiculoSeleccionado = {
      id: emp.vehiculo_id,
      placa: emp.vehiculo_placa,
      clave_interna: emp.vehiculo_clave_interna,
      marca: emp.vehiculo_marca,
      modelo: emp.vehiculo_modelo,
      color: emp.vehiculo_color
    };
    this.vehiculoAsignadoInfo = this.vehiculoSeleccionado;
    this.empleadoSeleccionado = {
      id: emp.empleado_id,
      nombre_completo: emp.empleado_nombre,
      numero_empleado: emp.empleado_numero
    };
    this.busquedaEmpleado = emp.empleado_nombre;
    this.tipoEntidad = 'empleado_empresa';
  }

  seleccionarEmpleadoPropioPendiente(emp: any): void {
    this.empleadoPropioNombre = emp.empleado_nombre?.split(' ')[0] || '';
    this.empleadoPropioApellido = emp.empleado_nombre?.split(' ').slice(1).join(' ') || '';
    this.empleadoPropioPlaca = emp.empleado_placas || '';
    this.empleadoPropioMarca = emp.empleado_marca || '';
    this.preSelectedVisitanteId = emp.id;
    this.tipoEntidad = 'empleado_propio';
  }

  seleccionarVisitantePendiente(vis: any): void {
    this.preSelectedVisitanteId = vis.id;
    this.visitantePrimerNombre = vis.visitante_nombre?.split(' ')[0] || '';
    this.visitanteApellido = vis.visitante_nombre?.split(' ').slice(1).join(' ') || '';
    this.visitantePlacas = vis.vehiculo_placa || vis.visitante_placas || '';
    this.tipoEntidad = 'visitante';
  }

  seleccionarVehiculoEmpresaPendiente(vehiculo: any): void {
    this.vehiculoSeleccionado = vehiculo;
    if (vehiculo.ultimo_empleado_info) {
      this.empleadoSeleccionado = {
        id: vehiculo.ultimo_empleado,
        nombre_completo: vehiculo.ultimo_empleado_info.nombre_completo,
        numero_empleado: vehiculo.ultimo_empleado_info.numero_empleado
      };
      this.busquedaEmpleado = vehiculo.ultimo_empleado_info.nombre_completo;
    }
    this.tipoEntidad = 'empleado_empresa';
  }

  limpiarTracto(): void {
    this.vehiculoSeleccionado = null;
    this.busquedaVehiculo = '';
    this.conductorId = null;
  }

  buscarEmpleado(event: any): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    const query = event?.target?.value || '';

    if (query.length === 0) {
      this.resultadosBusquedaEmpleado = this.todosEmpleados.slice(0, 10);
      return;
    }

    if (query.length < 2) {
      this.resultadosBusquedaEmpleado = [];
      return;
    }

    if (this.tipoEntidad === 'empleado_empresa') {
      this.resultadosBusquedaEmpleado = (this.empleadosConVehiculo || []).filter((e: any) =>
        e.nombre_completo?.toLowerCase().includes(query.toLowerCase()) ||
        e.numero_empleado?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
    } else {
      this.resultadosBusquedaEmpleado = (this.todosEmpleados || []).filter((e: any) =>
        e.nombre_completo?.toLowerCase().includes(query.toLowerCase()) ||
        e.numero_empleado?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
    }
  }

  cargarTodosEmpleados(): void {
    if (this.tipoEntidad === 'empleado_empresa') {
      this.resultadosBusquedaEmpleado = this.empleadosConVehiculo.slice(0, 10);
    } else {
      this.resultadosBusquedaEmpleado = this.todosEmpleados.slice(0, 10);
    }
  }

  seleccionarEmpleado(empleado: any): void {
    this.empleadoSeleccionado = empleado;
    this.resultadosBusquedaEmpleado = [];
    this.busquedaEmpleado = empleado.nombre_completo;

    if (this.tipoEntidad === 'empleado_empresa') {
      this.vehiculoAsignadoInfo = {
        id: empleado.vehiculo_id,
        placa: empleado.vehiculo_placa,
        clave_interna: empleado.vehiculo_clave_interna,
        marca: empleado.vehiculo_marca,
        modelo: empleado.vehiculo_modelo
      };
      this.vehiculoSeleccionado = this.vehiculoAsignadoInfo;
    }
  }

  limpiarEmpleado(): void {
    this.empleadoSeleccionado = null;
    this.vehiculoAsignadoInfo = null;
    this.vehiculoSeleccionado = null;
    this.busquedaEmpleado = '';
  }

  private mapTipoEntidadBackend(): string {
    switch(this.tipoEntidad) {
      case 'empleado_empresa':
        return 'empleado';
      case 'empleado_propio':
        return 'empleado_propio';
      case 'otro':
        return 'visitante';
      default:
        return this.tipoEntidad;
    }
  }

  get puedeRegistrar(): boolean {
    if (!this.turnoActual) return false;

    if (this.tipoRegistro === 'salida') {
      switch (this.tipoEntidad) {
        case 'conductor':
          return !!this.conductorId && !!this.evidenciaFile;
        case 'tracto':
          return !!(this.vehiculoSeleccionado && this.conductorId) && !!this.evidenciaFile;
        case 'empleado_empresa':
          return !!this.empleadoSeleccionado && !!this.vehiculoSeleccionado && !!this.evidenciaFile;
        case 'empleado_propio':
          return !!this.preSelectedVisitanteId && !!this.evidenciaFile;
        case 'visitante':
          return !!this.preSelectedVisitanteId && !!this.evidenciaFile;
        default:
          return false;
      }
    }

    switch (this.tipoEntidad) {
      case 'conductor':
        if (this.tipoRegistro === 'entrada') {
          return !!this.conductorId;
        }
        return !!this.conductorId && !!this.evidenciaFile;
      case 'tracto':
        return !!(this.vehiculoSeleccionado && this.conductorId);
      case 'empleado_empresa':
        return !!this.empleadoSeleccionado && !!this.vehiculoSeleccionado;
      case 'empleado_propio':
        if (this.tipoRegistro === 'entrada') {
          return !!this.empleadoPropioNombre && !!this.empleadoPropioApellido && !!this.empleadoPropioMarca && !!this.empleadoPropioPlaca;
        }
        return !!this.empleadoPropioNombre && !!this.empleadoPropioApellido && !!this.empleadoPropioMarca && !!this.empleadoPropioPlaca && !!this.evidenciaFile;
      case 'visitante':
        if (this.tipoRegistro === 'entrada') {
          return !!this.visitantePrimerNombre && !!this.visitanteApellido && !!this.visitanteMotivo;
        }
        return !!this.visitantePrimerNombre && !!this.visitanteApellido && !!this.visitanteMotivo && !!this.evidenciaFile;
      default:
        return false;
    }
  }

  getLabelConductor(): string {
if (this.tipoEntidad === 'empleado_empresa' && this.empleadoSeleccionado) {
    return 'Conductor/Vehículo (auto-asignado)';
    }
    return 'Conductor *';
  }

  onConductorSelect(event: any): void {
    const conductorId = event?.detail?.value;
    if (conductorId) {
      this.conductorId = conductorId;
    }
  }

  getConductorVehiculoInfo(): any {
    if (!this.conductorId) return null;
    const lista = this.tipoRegistro === 'salida'
      ? this.conductoresPendientesSalida
      : this.conductoresDisponibles;
    const conductor = lista.find(c => c.id === this.conductorId);
    if (!conductor) return null;
    return {
      placa: conductor.vehiculo_placa || conductor.conductor_placa || conductor.placa || null,
      marca: conductor.vehiculo_marca || conductor.conductor_marca || conductor.marca || '',
      modelo: conductor.vehiculo_modelo || conductor.modelo || '',
    };
  }

  getTipoAccesoLabel(): string {
    const prefijo = this.tipoRegistro === 'salida' ? 'SALIDA - ' : '';
    switch (this.tipoEntidad) {
      case 'tracto': return prefijo + 'TRACTO';
      case 'empleado_empresa': return prefijo + 'EMPLEADO (EMPRESA)';
      case 'empleado_propio': return prefijo + 'EMPLEADO (PROPIO)';
      case 'visitante': return prefijo + 'VISITANTE';
      case 'otro': return prefijo + 'OTRO';
      default: return prefijo + 'REGISTRO';
    }
  }

  tomarFotoEvidencia(): void {
    const fileInput = document.getElementById('fileInputEvidencia') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onEvidenciaSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.mostrarAlerta('Error', 'Solo se permiten imágenes.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.mostrarAlerta('Error', 'La imagen debe ser menor a 10MB.');
      return;
    }

    this.evidenciaFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.evidenciaPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  eliminarEvidencia(): void {
    this.evidenciaFile = null;
    this.evidenciaPreview = '';
    const fileInput = document.getElementById('fileInputEvidencia') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async registrar(): Promise<void> {
    if (!this.puedeRegistrar) {
      this.mostrarAlerta('Error', 'Completa todos los campos obligatorios.');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Registrando...' });
    await loading.present();

    let vehiculoId: number | null = null;
    let entidadTipo = this.tipoEntidad;
    let personaId: number | null = null;

    if (this.tipoEntidad === 'tracto') {
      vehiculoId = this.vehiculoSeleccionado.id;
      personaId = this.conductorId;
      await this.enviarRegistro(loading, vehiculoId, personaId, entidadTipo);
    } else if (this.tipoEntidad === 'conductor') {
      await this.enviarRegistro(loading, null, null, entidadTipo);
    } else if (this.tipoEntidad === 'empleado_empresa') {
      personaId = this.empleadoSeleccionado.id;
      vehiculoId = this.vehiculoAsignadoInfo?.id || null;
      if (!vehiculoId) {
        await loading.dismiss();
        await this.mostrarAlerta('Error', 'Este empleado no tiene vehículo asignado.');
        return;
      }
      await this.enviarRegistro(loading, vehiculoId, personaId, entidadTipo);
    } else if (this.tipoEntidad === 'empleado_propio') {
      await this.enviarRegistro(loading, null, null, entidadTipo);
    } else {
      await this.enviarRegistro(loading, vehiculoId, personaId, entidadTipo);
    }
  }

  private async enviarRegistro(loading: HTMLIonLoadingElement, vehiculoId: number | null, personaId: number | null, entidadTipo: string): Promise<void> {
    const formData = new FormData();
    formData.append('turno', this.turnoActual.id.toString());
    formData.append('tipo_movimiento', this.tipoRegistro);
    formData.append('tipo_entidad', this.mapTipoEntidadBackend());

    if (vehiculoId) formData.append('vehiculo', vehiculoId.toString());
    if (personaId || entidadTipo === 'conductor' || entidadTipo === 'empleado_propio') {
      if (entidadTipo === 'conductor') {
        if (this.conductorId) {
          formData.append('conductor', this.conductorId.toString());
        }
        if (this.vehiculoSeleccionado?.id) {
          formData.append('vehiculo', this.vehiculoSeleccionado.id.toString());
        }
      } else if (entidadTipo === 'empleado_propio') {
        formData.append('empleado_propio_nombre', this.empleadoPropioNombre);
        formData.append('empleado_propio_apellido', this.empleadoPropioApellido);
        formData.append('empleado_propio_marca', this.empleadoPropioMarca);
        formData.append('empleado_propio_placas', this.empleadoPropioPlaca);
        if (this.preSelectedVisitanteId) {
          formData.append('entrada_asociada_id', this.preSelectedVisitanteId.toString());
        }
      } else if (entidadTipo === 'empleado_empresa') {
        formData.append('empleado', personaId.toString());
      } else if (entidadTipo === 'tracto') {
        formData.append('conductor', personaId.toString());
      }
    }

    let observacionesCompletas = this.observaciones || '';

    if (this.tipoEntidad === 'conductor') {
      if (this.tipoRegistro === 'entrada') {
        const conductor = this.conductoresDisponibles.find(c => c.id === this.conductorId);
        if (conductor) {
          observacionesCompletas = `[CONDUCTOR] ${conductor.nombre_completo} | Vehículo: ${conductor.vehiculo_placa || 'N/A'} | NO EN SERVICIO - CONDUCTOR FUERA`;
        }
      } else {
        const conductor = this.conductoresPendientesSalida.find(c => c.id === this.conductorId);
        if (conductor) {
          observacionesCompletas = `[CONDUCTOR] ${conductor.nombre_completo} | NO EN SERVICIO - CONDUCTOR FUERA`;
        }
        if (this.motivoSalida) observacionesCompletas += ` | Motivo: ${this.motivoSalida}`;
        if (this.observaciones) observacionesCompletas += ` | ${this.observaciones}`;
      }
    } else if (this.tipoEntidad === 'tracto') {
      if (this.tipoRegistro === 'salida' && this.motivoSalida) {
        observacionesCompletas = `Motivo: ${this.motivoSalida}`;
        if (this.observaciones) observacionesCompletas += ` | ${this.observaciones}`;
      }
    } else if (this.tipoEntidad === 'visitante') {
      const nombreCompleto = `${this.visitantePrimerNombre} ${this.visitanteApellido}`.trim();
      observacionesCompletas = `[VISITANTE] ${nombreCompleto} | Placas: ${this.visitantePlacas || 'N/A'} | Motivo: ${this.visitanteMotivo}`;
      if (this.observaciones) observacionesCompletas += ` | ${this.observaciones}`;
      formData.append('visitante_nombre', this.visitantePrimerNombre);
      formData.append('visitante_apellido', this.visitanteApellido);
      formData.append('visitante_placas', this.visitantePlacas || '');
      if (this.preSelectedVisitanteId) {
        formData.append('entrada_asociada_id', this.preSelectedVisitanteId.toString());
      }
    } else if (this.tipoEntidad === 'empleado_propio') {
      const nombreCompleto = `${this.empleadoPropioNombre} ${this.empleadoPropioApellido}`.trim();
      observacionesCompletas = `[EMPLEADO PROPIO] ${nombreCompleto} | Placas: ${this.empleadoPropioPlaca}`;
      if (this.empleadoPropioMarca) observacionesCompletas += ` | Marca: ${this.empleadoPropioMarca}`;
      if (this.observaciones) observacionesCompletas += ` | ${this.observaciones}`;
    }

    formData.append('observaciones', observacionesCompletas);
    formData.append('requiere_evidencia', this.evidenciaFile ? 'true' : 'false');
    formData.append('tiene_evidencia', this.evidenciaFile ? 'true' : 'false');

    if (this.evidenciaFile) {
      formData.append('evidencia_fotografica', this.evidenciaFile);
    }

    this.apiService.crearRegistroAcceso(formData).subscribe({
      next: async (response) => {
        await loading.dismiss();
        await this.mostrarAlerta('Éxito', `Registro de ${this.tipoRegistro} guardado correctamente.`);
        this.router.navigateByUrl('/home');
      },
      error: async (error) => {
        await loading.dismiss();
        const mensaje = error?.error?.error || error?.error?.detail || `No se pudo registrar.`;
        await this.mostrarAlerta('Error', mensaje);
      }
    });
  }

  getConductoresParaVehiculo(): any[] {
    if (!this.vehiculoSeleccionado) return [];
    return (this.conductoresDisponibles || []).filter(c =>
      c.vehiculo_id === this.vehiculoSeleccionado.id
    );
  }

  private buscarVehiculoAsignadoEmpleado(empleadoId: number): void {
    this.apiService.getAsignaciones({ empleado: empleadoId }).subscribe({
      next: async (asignaciones) => {
        const loading = await this.loadingController.create({ message: 'Registrando...' });
        await loading.present();
        const asignacionActiva = asignaciones?.find((a: any) => a.activa && a.vehiculo?.id);
        const vehiculoId = asignacionActiva?.vehiculo?.id || null;
        await this.enviarRegistro(loading, vehiculoId, empleadoId, this.tipoEntidad);
      },
      error: async () => {
        const loading = await this.loadingController.create({ message: 'Registrando...' });
        await loading.present();
        await this.enviarRegistro(loading, null, empleadoId, this.tipoEntidad);
      }
    });

  }

  async mostrarAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}