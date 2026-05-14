import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registro-acceso',
  templateUrl: './registro-acceso.page.html',
  styleUrls: ['./registro-acceso.page.scss'],
  standalone: false,
})
export class RegistroAccesoPage implements OnInit {
  user: any = null;

  tipoMovimiento: string = 'entrada';
  tipoEntidad: string = 'empleado';
  observaciones: string = '';
  turnoId: number | null = null;

  turnos: any[] = [];
  vehiculos: any[] = [];
  empleados: any[] = [];
  conductores: any[] = [];

  vehiculoId: number | null = null;
  empleadoId: number | null = null;
  conductorId: number | null = null;

  visitante = {
    tipo_visitante: 'visitante',
    nombre_completo: '',
    empresa: '',
    vehiculo_tipo_general: '',
    placas: '',
    motivo: '',
    observaciones: '',
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.cargarTurnos();
    this.cargarDatosPorTipoEntidad();
  }

  onTipoEntidadChange() {
    this.vehiculoId = null;
    this.empleadoId = null;
    this.conductorId = null;
    this.cargarDatosPorTipoEntidad();
  }

  cargarTurnos() {
    const userId = this.user?.id;

    this.apiService.getTurnos(true, userId).subscribe({
      next: (data) => {
        this.turnos = data;
        if (this.turnos.length > 0) {
          this.turnoId = this.turnos[0].id;
        }
      },
      error: () => {
        this.turnos = [];
      }
    });
  }

  cargarDatosPorTipoEntidad() {
    if (this.tipoEntidad === 'empleado') {
      this.apiService.getVehiculos('empleado').subscribe({
        next: (data) => this.vehiculos = data,
        error: () => this.vehiculos = []
      });

      this.apiService.getEmpleados().subscribe({
        next: (data) => this.empleados = data,
        error: () => this.empleados = []
      });

      this.conductores = [];
    }

    if (this.tipoEntidad === 'tracto') {
      this.apiService.getVehiculos('tracto').subscribe({
        next: (data) => this.vehiculos = data,
        error: () => this.vehiculos = []
      });

      this.apiService.getConductores().subscribe({
        next: (data) => this.conductores = data,
        error: () => this.conductores = []
      });

      this.empleados = [];
    }

    if (this.tipoEntidad === 'visitante') {
      this.vehiculos = [];
      this.empleados = [];
      this.conductores = [];
    }
  }

  async registrar() {
    if (!this.turnoId) {
      await this.mostrarAlerta('Error', 'Debes seleccionar un turno abierto.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registrando acceso...'
    });
    await loading.present();

    if (this.tipoEntidad === 'empleado') {
      if (!this.vehiculoId || !this.empleadoId) {
        await loading.dismiss();
        await this.mostrarAlerta('Error', 'Debes seleccionar empleado y vehículo.');
        return;
      }

      const payload = {
        turno: this.turnoId,
        tipo_movimiento: this.tipoMovimiento,
        tipo_entidad: this.tipoEntidad,
        vehiculo: this.vehiculoId,
        empleado: this.empleadoId,
        observaciones: this.observaciones,
        requiere_evidencia: false,
        tiene_evidencia: false
      };

      this.apiService.crearRegistroAcceso(payload).subscribe({
        next: async () => {
          await loading.dismiss();
          await this.mostrarAlerta('Éxito', 'Registro de acceso creado correctamente.');
          this.limpiarFormulario();
        },
        error: async (error) => {
          await loading.dismiss();
          await this.mostrarAlerta('Error', error?.error?.error || 'No se pudo crear el registro.');
        }
      });

      return;
    }

    if (this.tipoEntidad === 'tracto') {
      if (!this.vehiculoId || !this.conductorId) {
        await loading.dismiss();
        await this.mostrarAlerta('Error', 'Debes seleccionar tracto y conductor.');
        return;
      }

      const payload = {
        turno: this.turnoId,
        tipo_movimiento: this.tipoMovimiento,
        tipo_entidad: this.tipoEntidad,
        vehiculo: this.vehiculoId,
        conductor: this.conductorId,
        observaciones: this.observaciones,
        requiere_evidencia: false,
        tiene_evidencia: false
      };

      this.apiService.crearRegistroAcceso(payload).subscribe({
        next: async () => {
          await loading.dismiss();
          await this.mostrarAlerta('Éxito', 'Registro de acceso creado correctamente.');
          this.limpiarFormulario();
        },
        error: async (error) => {
          await loading.dismiss();
          await this.mostrarAlerta('Error', error?.error?.error || 'No se pudo crear el registro.');
        }
      });

      return;
    }

    if (this.tipoEntidad === 'visitante') {
      if (!this.visitante.nombre_completo || !this.visitante.placas) {
        await loading.dismiss();
        await this.mostrarAlerta('Error', 'Debes capturar al menos nombre del visitante y placas.');
        return;
      }

      const visitantePayload = {
        tipo_visitante: this.visitante.tipo_visitante,
        nombre_completo: this.visitante.nombre_completo,
        empresa: this.visitante.empresa,
        vehiculo_tipo_general: this.visitante.vehiculo_tipo_general,
        placas: this.visitante.placas.toUpperCase(),
        motivo: this.visitante.motivo,
        observaciones: this.visitante.observaciones
      };

      this.apiService.crearVisitante(visitantePayload).subscribe({
        next: (visitanteCreado) => {
          const payload = {
            turno: this.turnoId,
            tipo_movimiento: this.tipoMovimiento,
            tipo_entidad: this.tipoEntidad,
            visitante: visitanteCreado.id,
            observaciones: this.observaciones,
            requiere_evidencia: false,
            tiene_evidencia: false
          };

          this.apiService.crearRegistroAcceso(payload).subscribe({
            next: async () => {
              await loading.dismiss();
              await this.mostrarAlerta('Éxito', 'Registro de acceso creado correctamente.');
              this.limpiarFormulario();
            },
            error: async (error) => {
              await loading.dismiss();
              await this.mostrarAlerta('Error', error?.error?.error || 'No se pudo crear el registro.');
            }
          });
        },
        error: async (error) => {
          await loading.dismiss();
          await this.mostrarAlerta('Error', error?.error?.error || 'No se pudo crear el visitante.');
        }
      });
    }
  }

  limpiarFormulario() {
    this.tipoMovimiento = 'entrada';
    this.observaciones = '';
    this.vehiculoId = null;
    this.empleadoId = null;
    this.conductorId = null;
    this.visitante = {
      tipo_visitante: 'visitante',
      nombre_completo: '',
      empresa: '',
      vehiculo_tipo_general: '',
      placas: '',
      motivo: '',
      observaciones: '',
    };
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}