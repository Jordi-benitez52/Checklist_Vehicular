import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cerrar-turno',
  templateUrl: './cerrar-turno.page.html',
  styleUrls: ['./cerrar-turno.page.scss'],
  standalone: false
})
export class CerrarTurnoPage implements AfterViewInit {
  @ViewChild('canvasFirma') canvasFirma!: ElementRef<HTMLCanvasElement>;
  @ViewChild(IonContent) content!: IonContent;

  turnoActual: any = null;
  stats = { entradas: 0, salidas: 0, checklists: 0 };
  observacionesCierre: string = '';
  firmaData: string = '';

  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.cargarDatos();
  }

  ionViewWillEnter(): void {
    this.cargarDatos();
    setTimeout(() => this.initCanvas(), 300);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initCanvas(), 300);
  }

  async cargarDatos(): Promise<void> {
    const user = this.authService.getUser();
    const loading = await this.loadingController.create({ message: 'Cargando...' });
    await loading.present();

    try {
      const turnosRes = await new Promise<any>((resolve) => {
        this.apiService.getTurnos(true, user?.id).subscribe({
          next: (t) => resolve(t),
          error: () => resolve([])
        });
      });
      this.turnoActual = turnosRes && turnosRes.length > 0 ? turnosRes[0] : null;

      if (this.turnoActual?.id) {
        const regsRes = await new Promise<any>((resolve) => {
          this.apiService.getRegistrosAccesoPorTurno(this.turnoActual.id).subscribe({
            next: (r) => resolve(r),
            error: () => resolve([])
          });
        });
        this.stats.entradas = (regsRes || []).filter((r: any) => r.tipo_movimiento === 'entrada').length;
        this.stats.salidas = (regsRes || []).filter((r: any) => r.tipo_movimiento === 'salida').length;
        this.stats.checklists = (regsRes || []).filter((r: any) => r.checklist_realizado === true).length;
      }
    } finally {
      await loading.dismiss();
    }
  }

  initCanvas(): void {
    const canvas = this.canvasFirma?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 320;
    canvas.height = 150;

    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000';
  }

  clearFirma(): void {
    const canvas = this.canvasFirma?.nativeElement;
    if (!canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  getCoords(event: any): { x: number; y: number } {
    const canvas = this.canvasFirma?.nativeElement;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    if (touch) {
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: event.offsetX, y: event.offsetY };
  }

  startDraw(event: any): void {
    if (!this.ctx) {
      this.initCanvas();
    }
    if (!this.ctx) return;
    event.preventDefault();
    this.drawing = true;
    const { x, y } = this.getCoords(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.lastX = x;
    this.lastY = y;
  }

  draw(event: any): void {
    if (!this.drawing || !this.ctx) return;
    event.preventDefault();
    const { x, y } = this.getCoords(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
  }

  stopDraw(): void {
    this.drawing = false;
  }

  async cerrarTurno(): Promise<void> {
    const canvas = this.canvasFirma?.nativeElement;
    this.firmaData = canvas ? canvas.toDataURL('image/png') : '';

    if (!this.firmaData || this.firmaData.length < 100) {
      await this.mostrarAlerta('Firma requerida', 'Por favor captura tu firma antes de cerrar el turno.');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Cerrando turno...' });
    await loading.present();

    this.apiService.cerrarTurno(
      this.turnoActual.id,
      this.observacionesCierre || '',
      this.firmaData
    ).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.mostrarAlerta('Turno cerrado', 'El turno se cerró correctamente.');
        this.router.navigateByUrl('/home');
      },
      error: async (error) => {
        await loading.dismiss();
        const msg = error?.error?.error || error?.error?.detail || 'No se pudo cerrar el turno.';
        await this.mostrarAlerta('Error', msg);
      }
    });
  }

  async mostrarAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  goBack(): void {
    this.router.navigateByUrl('/home');
  }
}