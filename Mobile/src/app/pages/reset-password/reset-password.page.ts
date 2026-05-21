import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false,
})
export class ResetPasswordPage {
  email: string = '';
  step: 'email' | 'code' | 'password' = 'email';
  verificationCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  isResendingCode: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async sendResetCode(): Promise<void> {
    if (!this.email.trim()) {
      await this.mostrarAlerta('Campo requerido', 'Ingresa tu correo electrónico.');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Enviando código...'
    });
    await loading.present();

    this.apiService.requestPasswordReset(this.email.trim()).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isLoading = false;
        this.step = 'code';
        await this.mostrarAlerta('Código enviado', 'Revisa tu correo para el código de recuperación.');
      },
      error: async () => {
        await loading.dismiss();
        this.isLoading = false;
        await this.mostrarAlerta('Error', 'No se pudo enviar el código. Verifica el correo.');
      }
    });
  }

  async verifyCode(): Promise<void> {
    if (!this.verificationCode.trim() || this.verificationCode.length !== 6) {
      await this.mostrarAlerta('Código requerido', 'Ingresa el código de 6 dígitos.');
      return;
    }

    this.step = 'password';
  }

  async resetPassword(): Promise<void> {
    if (!this.newPassword || this.newPassword.length < 8) {
      await this.mostrarAlerta('Contraseña inválida', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      await this.mostrarAlerta('Contraseñas no coinciden', 'Verifica que las contraseñas sean iguales.');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Cambiando contraseña...'
    });
    await loading.present();

    this.apiService.confirmPasswordReset({
      email: this.email.trim(),
      code: this.verificationCode,
      new_password: this.newPassword
    }).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isLoading = false;
        await this.mostrarAlerta('Éxito', 'Contraseña cambiada correctamente. Ya puedes iniciar sesión.');
        this.router.navigateByUrl('/login');
      },
      error: async () => {
        await loading.dismiss();
        this.isLoading = false;
        await this.mostrarAlerta('Error', 'No se pudo cambiar la contraseña. El código puede haber expirado.');
      }
    });
  }

  async resendCode(): Promise<void> {
    this.isResendingCode = true;
    this.apiService.requestPasswordReset(this.email.trim()).subscribe({
      next: async () => {
        this.isResendingCode = false;
        await this.mostrarAlerta('Código reenviado', 'Revisa tu correo.');
      },
      error: async () => {
        this.isResendingCode = false;
        await this.mostrarAlerta('Error', 'No se pudo reenviar el código.');
      }
    });
  }

  goBack(): void {
    if (this.step === 'code') {
      this.step = 'email';
      this.verificationCode = '';
    } else if (this.step === 'password') {
      this.step = 'code';
      this.newPassword = '';
      this.confirmPassword = '';
    }
  }

  private async mostrarAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}