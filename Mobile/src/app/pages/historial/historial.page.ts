import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-historial',
  standalone: false,
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  movimientos: any[] = [];
  checklists: any[] = [];
  filtroActivo: string = '';
  turnoActual: any = null;
  user: any = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.route.queryParams.subscribe(params => {
      this.cargarDatos(params);
    });
  }

  ionViewWillEnter() {
    this.user = this.authService.getUser();
    this.cargarTurnoActivo();
    this.route.queryParams.subscribe(params => {
      this.cargarDatos(params);
    });
  }

  async cargarTurnoActivo(): Promise<void> {
    const guardiaId = this.user?.id;
    if (!guardiaId) return;

    return new Promise((resolve) => {
      this.apiService.getTurnos(true, guardiaId).subscribe({
        next: (turnos) => {
          this.turnoActual = turnos && turnos.length > 0 ? turnos[0] : null;
          resolve();
        },
        error: () => {
          this.turnoActual = null;
          resolve();
        }
      });
    });
  }

  cargarDatos(params: any = {}) {
    const vehiculoId = params['vehiculoId'];
    const visitanteId = params['visitanteId'];
    this.filtroActivo = vehiculoId ? `Vehículo #${vehiculoId}` : (visitanteId ? `Visitante #${visitanteId}` : '');

    const movimientoParams: any = {};
    if (vehiculoId) movimientoParams['vehiculo'] = vehiculoId;
    if (visitanteId) movimientoParams['visitante'] = visitanteId;
    if (this.turnoActual?.id) movimientoParams['turno'] = this.turnoActual.id;

    this.apiService.getRegistrosAcceso(movimientoParams).subscribe({
      next: (data) => {
        this.movimientos = data;
      },
      error: () => {
        this.movimientos = [];
      }
    });

    const checklistParams: any = {};
    if (this.turnoActual?.id) checklistParams['turno'] = this.turnoActual.id;

    this.apiService.getChecklistsRecientes(checklistParams).subscribe({
      next: (data) => {
        this.checklists = data;
      },
      error: () => {
        this.checklists = [];
      }
    });
  }

  getEvidenciaUrl(mov: any): SafeResourceUrl {
    if (!mov.evidencia_fotografica) return '';
    const url = mov.evidencia_fotografica.startsWith('http')
      ? mov.evidencia_fotografica
      : `http://127.0.0.1:8000${mov.evidencia_fotografica}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  abrirEvidencia(mov: any): void {
    if (!mov.evidencia_fotografica) return;
    const url = mov.evidencia_fotografica.startsWith('http')
      ? mov.evidencia_fotografica
      : `http://127.0.0.1:8000${mov.evidencia_fotografica}`;
    window.open(url, '_blank');
  }
}