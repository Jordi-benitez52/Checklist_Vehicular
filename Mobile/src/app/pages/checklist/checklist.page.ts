import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-checklist',
  standalone: false,
  templateUrl: './checklist.page.html',
  styleUrls: ['./checklist.page.scss'],
})
export class ChecklistPage {
  placa: string = '';
  nivel_combustible: string = '';
  luces: boolean = false;
  frenos: boolean = false;
  llantas: boolean = false;
  espejos: boolean = false;
  observaciones: string = '';

  constructor(
    private apiService: ApiService,
    private alertController: AlertController
  ) {}

async registrarChecklist() {
    this.apiService.crearChecklistRegistro({
      placa: this.placa,
      nivel_combustible: this.nivel_combustible,
      luces: this.luces,
      frenos: this.frenos,
     llagas: this.llantas,
      espejos: this.espejos,
      observaciones: this.observaciones
    }).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Checklist registrado correctamente',
          buttons: ['OK']
        });
        await alert.present();

        this.placa = '';
        this.nivel_combustible = '';
        this.luces = false;
        this.frenos = false;
        this.llantas = false;
        this.espejos = false;
        this.observaciones = '';
      },
      error: async (error) => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: error?.error?.error || 'No se pudo registrar el checklist',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}