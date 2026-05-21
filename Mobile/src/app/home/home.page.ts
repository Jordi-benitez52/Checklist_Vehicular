import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  user: any = null;
  turnoActivo: any = null;
  stats = {
    entradas: 0,
    salidas: 0,
    checklists: 0
  };

  tiempoTranscurrido: string = '';
  private timerInterval: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
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

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  async cargarDatos(): Promise<void> {
    const loading = await this.loadingController.create({ message: 'Cargando...' });
    await loading.present();

    try {
      await Promise.all([
        this.cargarTurnoActivo(),
        this.cargarStats()
      ]);
      this.actualizarTiempoTranscurrido();
      this.iniciarTimer();
    } finally {
      await loading.dismiss();
    }
  }

  cargarTurnoActivo(): Promise<void> {
    return new Promise((resolve) => {
      this.apiService.getTurnos(true, this.user?.id).subscribe({
        next: (turnos) => {
          this.turnoActivo = turnos && turnos.length > 0 ? turnos[0] : null;
          if (this.turnoActivo) {
            this.actualizarTiempoTranscurrido();
          }
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

  iniciarTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      this.actualizarTiempoTranscurrido();
    }, 60000);
  }

  actualizarTiempoTranscurrido(): void {
    if (!this.turnoActivo?.hora_apertura) {
      this.tiempoTranscurrido = '';
      return;
    }

    const inicio = new Date(this.turnoActivo.hora_apertura);
    const ahora = new Date();
    const diffMs = ahora.getTime() - inicio.getTime();

    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (horas > 0) {
      this.tiempoTranscurrido = `${horas}h ${minutos}m`;
    } else {
      this.tiempoTranscurrido = `${minutos}m`;
    }
  }

  async abrirTurno(): Promise<void> {
    const actionSheet = await this.alertController.create({
      header: 'Seleccionar tipo de turno',
      buttons: [
        {
          text: 'Matutino (6:00 - 14:00)',
          handler: () => this.crearTurno('matutino')
        },
        {
          text: 'Vespertino (14:00 - 22:00)',
          handler: () => this.crearTurno('vespertino')
        },
        {
          text: 'Nocturno (22:00 - 6:00)',
          handler: () => this.crearTurno('nocturno')
        },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });

    await actionSheet.present();
  }

  crearTurno(tipoTurno: string): void {
    this.loadingController.create({ message: 'Abriendo turno...' }).then(loading => {
      loading.present();

      const today = new Date().toISOString().split('T')[0];

      this.apiService.crearTurno({
        tipo_turno: tipoTurno,
        fecha: today
      }).subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.turnoActivo = response.data;
          this.actualizarTiempoTranscurrido();
          this.iniciarTimer();
          await this.mostrarAlerta('Turno abierto', `Turno ${tipoTurno} iniciado correctamente.`);
          this.cargarStats();
        },
        error: async (error) => {
          await loading.dismiss();
          let mensaje = 'No se pudo abrir el turno. Intenta de nuevo.';
          if (error?.error?.error) mensaje = error.error.error;
          else if (error?.error?.detail) mensaje = error.error.detail;
          await this.mostrarAlerta('Error', mensaje);
        }
      });
    });
  }

  async cerrarTurno(): Promise<void> {
    if (!this.turnoActivo) {
      await this.mostrarAlerta('Sin turno', 'No tienes un turno abierto.');
      return;
    }
    this.router.navigate(['/cerrar-turno']);
  }

  irRegistro(tipo: 'entrada' | 'salida'): void {
    if (!this.turnoActivo) {
      this.mostrarAlerta('Sin turno', 'Debes abrir un turno antes de registrar accesos.');
      return;
    }
    this.router.navigateByUrl(`/quick-registro/${tipo}`);
  }

  irChecklistTracto(): void {
    if (!this.turnoActivo) {
      this.mostrarAlerta('Sin turno', 'Debes abrir un turno antes de crear checklists.');
      return;
    }
    this.router.navigateByUrl('/checklist-tracto');
  }

  irHistorial(): void {
    if (this.user?.role === 'guardia') {
      this.mostrarAlerta('Acceso restringido', 'No tienes permiso para ver el historial.');
      return;
    }
    this.router.navigateByUrl('/historial');
  }

  irPerfil(): void {
    this.router.navigateByUrl('/mi-perfil');
  }

  logout(): void {
    this.authService.logout();
  }

  async mostrarAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}