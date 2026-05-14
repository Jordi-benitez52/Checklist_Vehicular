import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard-guardia',
  standalone: false,
  templateUrl: './dashboard-guardia.page.html',
  styleUrls: ['./dashboard-guardia.page.scss'],
})
export class DashboardGuardiaPage implements OnInit {
  user: any = null;
  turnoActivo: any = null;
  fechaActual = new Date();

  stats = {
    entradas: 0,
    salidas: 0,
    checklists: 0
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.cargarDatos();
  }

  ionViewWillEnter(): void {
    this.cargarDatos();
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
        this.stats = { entradas: 0, salidas: 0, checklists: 0 };
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
          this.stats = { entradas: 0, salidas: 0, checklists: 0 };
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

  irHistorial(): void {
    this.router.navigateByUrl('/historial');
  }

  irVehiculosDentro(): void {
    this.router.navigateByUrl('/vehiculos-dentro');
  }

  irPerfil(): void {
    this.router.navigateByUrl('/mi-perfil');
  }

  // irAsignaciones(): void {
  //   this.router.navigateByUrl('/asignaciones');
  // }

  async mostrarAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  logout(): void {
    this.authService.logout();
  }
}