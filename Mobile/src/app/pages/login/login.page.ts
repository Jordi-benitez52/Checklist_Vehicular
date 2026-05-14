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

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async login(): Promise<void> {
    if (!this.username.trim() || !this.password.trim()) {
      await this.mostrarAlerta('Campos requeridos', 'Ingresa tu usuario y contraseña.');
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

        this.authService.saveToken(response.access);
        this.authService.saveRefreshToken(response.refresh);
        this.authService.saveUser(response.user);

        await loading.dismiss();
        this.router.navigateByUrl('/home');
      },
      error: async (error) => {
        this.isLoading = false;
        await loading.dismiss();

        let mensaje = 'No se pudo iniciar sesión';

        if (error.status === 400) {
          // Errores de validación del serializer
          if (error.error?.username) {
            mensaje = error.error.username[0];
          } else if (error.error?.password) {
            mensaje = error.error.password[0];
          } else if (typeof error.error === 'object') {
            const keys = Object.keys(error.error);
            if (keys.length > 0) {
              mensaje = error.error[keys[0]][0];
            }
          } else {
            mensaje = 'Datos inválidos. Verifica tu usuario y contraseña.';
          }
        } else if (error.status === 401) {
          // Usuario no existe o contraseña incorrecta
          mensaje = error.error?.error || 'Credenciales inválidas';
        } else if (error.status === 403) {
          // Usuario inactivo o perfil desactivado
          mensaje = error.error?.error || 'El usuario no tiene acceso.';
        } else if (error.status === 0 || error.status === null) {
          mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else if (error.error?.error) {
          mensaje = error.error.error;
        } else if (error.error?.detail) {
          mensaje = error.error.detail;
        }

        await this.mostrarAlerta('Error', mensaje);
      }
    });
  }

  async mostrarAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}