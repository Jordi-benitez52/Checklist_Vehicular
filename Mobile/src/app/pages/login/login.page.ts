import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  step: 'credentials' | 'code' = 'credentials';
  tempToken: string = '';
  verificationCode: string = '';
  isResendingCode: boolean = false;
  isDarkMode: boolean = false;
  private isAlertOpen: boolean = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.loadDarkModePreference();
  }

  loadDarkModePreference(): void {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark');
    }
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

  async login(): Promise<void> {
    if (!this.username.trim() || !this.password.trim()) {
      await this.showAlert('Campos requeridos', 'Ingresa tu usuario y contraseña.');
      return;
    }

    this.isLoading = true;

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...'
    });
    await loading.present();

    this.apiService.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: async (response) => {
        this.isLoading = false;
        await loading.dismiss();

        if (response.requires_verification) {
          this.tempToken = response.temp_token;
          this.step = 'code';
        } else {
          this.authService.saveToken(response.access);
          this.authService.saveRefreshToken(response.refresh);
          this.authService.saveUser(response.user);
          this.router.navigateByUrl('/home');
        }
      },
      error: async (error) => {
        this.isLoading = false;
        await loading.dismiss();
        if (!this.isAlertOpen) {
          await this.showAlert('Error', this.getErrorMessage(error));
        }
      }
    });
  }

  async verifyCode(): Promise<void> {
    if (!this.verificationCode.trim()) {
      await this.showAlert('Código requerido', 'Ingresa el código de 6 dígitos.');
      return;
    }

    if (this.verificationCode.length !== 6) {
      await this.showAlert('Código incompleto', 'El código debe ser de 6 dígitos.');
      return;
    }

    if (!this.tempToken) {
      await this.showAlert('Sesión expirada', 'Vuelve a iniciar sesión.');
      this.goBackToCredentials();
      return;
    }

    this.isLoading = true;

    const loading = await this.loadingController.create({
      message: 'Verificando código...'
    });
    await loading.present();

    this.authService.verify2FA(this.tempToken, this.verificationCode).subscribe({
      next: async (response) => {
        this.isLoading = false;
        await loading.dismiss();
        this.router.navigateByUrl('/home');
      },
      error: async (error) => {
        this.isLoading = false;
        await loading.dismiss();
        if (!this.isAlertOpen) {
          await this.showAlert('Código no verificado', this.getErrorMessage(error));
        }
      }
    });
  }

  async resendCode(): Promise<void> {
    this.isResendingCode = true;

    this.apiService.login({
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: async (response) => {
        this.isResendingCode = false;
        if (response.requires_verification) {
          this.tempToken = response.temp_token;
          await this.showAlert('Código enviado', 'Revisa tu correo electrónico.');
        }
      },
      error: async () => {
        this.isResendingCode = false;
        if (!this.isAlertOpen) {
          await this.showAlert('Error', 'No se pudo enviar el código.');
        }
      }
    });
  }

  goBackToCredentials(): void {
    this.step = 'credentials';
    this.verificationCode = '';
    this.tempToken = '';
  }

  private getErrorMessage(error: any): string {
    const status = error?.status;
    const data = error?.error;
    const errMsg = this.getErrorText(data);

    if (status === 0 || status === null) {
      return 'Sin conexión. Verifica tu red.';
    }

    if (status === 401) {
      if (errMsg.includes('Token') || errMsg.includes('token') || errMsg.includes('inválido')) {
        return 'Sesión expirada. Vuelve a iniciar.';
      }
      if (errMsg.includes('incorrecto') || errMsg.includes('Código')) {
        return 'Código incorrecto. Intenta de nuevo.';
      }
      return 'No se pudo verificar el código.';
    }

    if (status === 400) {
      if (errMsg.includes('incorrecto') || errMsg.includes('Código')) {
        return 'Código incorrecto. Intenta de nuevo.';
      }
      if (errMsg.includes('expiró') || errMsg.includes('expirado')) {
        return 'Código expirado. Solicita uno nuevo.';
      }
      if (errMsg.includes('Bloqueado') || errMsg.includes('bloqueado')) {
        return 'Demasiados intentos. Espera 15 minutos.';
      }
      if (errMsg.includes('Token') || errMsg.includes('token')) {
        return 'Sesión expirada. Vuelve a iniciar.';
      }
      return 'Verifica e intenta de nuevo.';
    }

    if (status === 429) {
      return 'Demasiados intentos. Espera un momento.';
    }

    return errMsg || 'Ocurrió un error.';
  }

  private getErrorText(data: any): string {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    if (data.detail) return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    return JSON.stringify(data);
  }

  private async showAlert(header: string, message: string): Promise<void> {
    if (this.isAlertOpen) return;
    this.isAlertOpen = true;

    const alert = await this.alertController.create({
      header,
      message,
      buttons: [{
        text: 'OK',
        handler: () => {
          this.isAlertOpen = false;
        }
      }]
    });
    await alert.present();
    alert.onDidDismiss().then(() => {
      this.isAlertOpen = false;
    });
  }
}