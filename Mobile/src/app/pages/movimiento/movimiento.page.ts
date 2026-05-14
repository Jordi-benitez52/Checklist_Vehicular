import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-movimiento',
  standalone: false,
  templateUrl: './movimiento.page.html',
  styleUrls: ['./movimiento.page.scss'],
})
export class MovimientoPage {
  placa: string = '';
  tipo: string = 'entrada';

  constructor(
    private apiService: ApiService,
    private alertController: AlertController
  ) {}

  async registrarMovimiento() {
    this.apiService.crearRegistroAcceso({
      placa: this.placa,
      tipo: this.tipo
    }).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Movimiento registrado correctamente',
          buttons: ['OK']
        });
        await alert.present();

        this.placa = '';
        this.tipo = 'entrada';
      },
      error: async (error) => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: error?.error?.error || 'No se pudo registrar el movimiento',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}