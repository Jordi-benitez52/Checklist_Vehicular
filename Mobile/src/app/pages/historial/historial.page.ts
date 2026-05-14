import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
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

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.cargarDatos(params);
    });
  }

  ionViewWillEnter() {
    this.route.queryParams.subscribe(params => {
      this.cargarDatos(params);
    });
  }

  cargarDatos(params: any = {}) {
    const vehiculoId = params['vehiculoId'];
    const visitanteId = params['visitanteId'];
    this.filtroActivo = vehiculoId ? `Vehículo #${vehiculoId}` : (visitanteId ? `Visitante #${visitanteId}` : '');

    const movimientoParams: any = {};
    if (vehiculoId) movimientoParams['vehiculo'] = vehiculoId;
    if (visitanteId) movimientoParams['visitante'] = visitanteId;

    this.apiService.getMovimientosRecientes().subscribe({
      next: (data) => {
        this.movimientos = data;
      },
      error: () => {
        this.movimientos = [];
      }
    });

    this.apiService.getChecklistsRecientes().subscribe({
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