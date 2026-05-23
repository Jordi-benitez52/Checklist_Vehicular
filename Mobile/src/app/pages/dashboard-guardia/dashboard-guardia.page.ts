import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { WebSocketService, DashboardData } from 'src/app/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-guardia',
  standalone: false,
  templateUrl: './dashboard-guardia.page.html',
  styleUrls: ['./dashboard-guardia.page.scss'],
})
export class DashboardGuardiaPage implements OnInit, OnDestroy {
  user: any = null;
  turnoActivo: any = null;
  fechaActual = new Date();
  isDarkMode: boolean = false;
  wsConnected: boolean = false;

  stats = {
    entradas: 0,
    salidas: 0,
    checklists: 0,
    vehiculosActivos: 0
  };

  private wsSubscription: Subscription | null = null;
  private connectionSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private wsService: WebSocketService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.loadDarkModePreference();
  }

  loadDarkModePreference(): void {
    const saved = localStorage.getItem('darkMode');
    this.isDarkMode = saved === 'true';
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.initWebSocket();
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
  }

  ionViewWillEnter(): void {
    this.cargarDatos();
    this.wsService.requestUpdate();
  }

  private initWebSocket(): void {
    this.wsService.connect();

    this.connectionSubscription = this.wsService.connectionStatus$.subscribe(
      (connected) => {
        this.wsConnected = connected;
      }
    );

    this.wsSubscription = this.wsService.dashboardData$.subscribe(
      (data: DashboardData | null) => {
        if (data) {
          this.stats.vehiculosActivos = data.total_vehiculos;
        }
      }
    );
  }

  async cargarDatos(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();

    try {
      await Promise.all([
        this.cargarTurnoActivo(),
        this.cargarStats()
      ]);
    } finally {
      await loading.dismiss();
    }
  }

  cargarTurnoActivo(): Promise<void> {
    return new Promise((resolve) => {
      const guardiaId = this.user?.id;

      this.apiService.getTurnos(true, guardiaId).subscribe({
        next: (turnos) => {
          this.turnoActivo = turnos && turnos.length > 0 ? turnos[0] : null;
          resolve();
        },
        error: () => {
          this.turnoActivo = null;
          resolve();
        }
      });
    });
  }

  cargarStats(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.turnoActivo?.id) {
        this.stats = { entradas: 0, salidas: 0, checklists: 0, vehiculosActivos: this.stats.vehiculosActivos };
        resolve();
        return;
      }

      this.apiService.getRegistrosAccesoPorTurno(this.turnoActivo.id).subscribe({
        next: (registros) => {
          this.stats.entradas = registros.filter((r: any) => r.tipo_movimiento === 'entrada').length;
          this.stats.salidas = registros.filter((r: any) => r.tipo_movimiento === 'salida').length;
          this.stats.checklists = registros.filter((r: any) => r.checklist_realizado === true).length;
          resolve();
        },
        error: () => {
          this.stats = { entradas: 0, salidas: 0, checklists: 0, vehiculosActivos: this.stats.vehiculosActivos };
          resolve();
        }
      });
    });
  }

  irEntrada(): void {
    if (!this.turnoActivo) {
      this.mostrarAlerta('Sin turno', 'Debes abrir un turno antes de registrar accesos.');
      return;
    }
    this.router.navigateByUrl('/quick-registro/entrada');
  }

  irSalida(): void {
    if (!this.turnoActivo) {
      this.mostrarAlerta('Sin turno', 'Debes abrir un turno antes de registrar accesos.');
      return;
    }
    this.router.navigateByUrl('/quick-registro/salida');
  }

  irChecklist(): void {
    if (!this.turnoActivo) {
      this.mostrarAlerta('Sin turno', 'Debes abrir un turno antes de crear checklists.');
      return;
    }
    this.router.navigateByUrl('/checklist-tracto');
  }

  irPerfil(): void {
    this.router.navigateByUrl('/mi-perfil');
  }

  async mostrarAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  logout(): void {
    this.wsService.disconnect();
    this.authService.logout();
  }
}