import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-vehiculos-dentro',
  standalone: false,
  templateUrl: './vehiculos-dentro.page.html',
  styleUrls: ['./vehiculos-dentro.page.scss'],
})
export class VehiculosDentroPage implements OnInit, OnDestroy {
  tractos: any[] = [];
  vehiculosEmpresa: any[] = [];
  visitantesPendientes: any[] = [];
  isLoading = false;
  private autoRefreshInterval: any;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.cargarDatos();
    this.autoRefreshInterval = setInterval(() => {
      this.cargarDatos();
    }, 15000);
  }

  ionViewWillLeave() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  ngOnDestroy() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  async cargarDatos() {
    const loading = await this.loadingController.create({
      message: 'Cargando vehículos...'
    });
    await loading.present();
    this.isLoading = true;

    this.apiService.getVehiculosEnInstalacion().subscribe({
      next: (data) => {
        this.tractos = data.filter((v: any) => v.tipo_entidad === 'tracto');
        this.vehiculosEmpresa = data.filter((v: any) => v.tipo_entidad === 'empleado');
        this.isLoading = false;
        loading.dismiss();
      },
      error: () => {
        this.tractos = [];
        this.vehiculosEmpresa = [];
        this.isLoading = false;
        loading.dismiss();
      }
    });

    this.apiService.getPendientesSalida().subscribe({
      next: (data) => {
        this.visitantesPendientes = data.visitantes_pendientes || [];
      },
      error: () => {
        this.visitantesPendientes = [];
      }
    });
  }

  registrarSalida(vehiculo: any, tipoEntidad: string): void {
    this.router.navigate(['/quick-registro/salida'], {
      queryParams: { vehiculoId: vehiculo.id, tipo: tipoEntidad }
    });
  }

  registrarSalidaVisitante(visitante: any): void {
    this.router.navigate(['/quick-registro/salida'], {
      queryParams: { visitanteId: visitante.id, tipo: 'visitante' }
    });
  }

  verHistorial(vehiculoId: number): void {
    this.router.navigate(['/historial'], {
      queryParams: { vehiculoId: vehiculoId }
    });
  }
}