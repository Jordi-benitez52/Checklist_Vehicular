import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.page.html',
  styleUrls: ['./mi-perfil.page.scss'],
  standalone: false,
})
export class MiPerfilPage implements OnInit {
  user: any = null;
  isLoading = true;
  isSaving = false;
  isChangingPassword = false;

  formData = {
    username: '',
    nombre_completo: '',
    email: '',
    numero_empleado: ''
  };

  passwordData = {
    actual: '',
    nueva: '',
    confirmar: ''
  };

  private readonly EMAIL_UPDATE_INTERVAL = 15 * 24 * 60 * 60 * 1000; // 15 days in ms
  private readonly PROFILE_UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes for backwards compatibility

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  ionViewWillEnter(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.isLoading = true;
    this.user = this.authService.getUser();

    if (this.user) {
      this.formData = {
        username: this.user.username || '',
        nombre_completo: this.user.nombre_completo || '',
        email: this.user.email || '',
        numero_empleado: this.user.numero_empleado || ''
      };
    }

    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }

  canUpdateProfile(): boolean {
    if (!this.user?.last_profile_update) return true;
    const lastUpdate = new Date(this.user.last_profile_update).getTime();
    const timeSinceUpdate = Date.now() - lastUpdate;
    return timeSinceUpdate >= this.PROFILE_UPDATE_INTERVAL;
  }

  getTimeUntilUpdate(): string {
    if (!this.user?.last_profile_update) return '';
    const lastUpdate = new Date(this.user.last_profile_update).getTime();
    const timeSinceUpdate = Date.now() - lastUpdate;
    const remaining = this.PROFILE_UPDATE_INTERVAL - timeSinceUpdate;

    if (remaining <= 0) return 'Disponible ahora';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  }

  triggerFileInput(): void {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.click();
  }

  onPhotoSelected(event: any): void {
    const file = event?.target?.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.mostrarAlerta('Error', 'La imagen debe ser menor a 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.user = { ...this.user, foto: e.target.result };
      this.formData = { ...this.formData };
    };
    reader.readAsDataURL(file);
  }

  async guardarPerfil(): Promise<void> {
    const emailChanged = this.formData.email !== this.user?.email;
    if (emailChanged && !this.canUpdateEmail()) {
      await this.mostrarAlerta('Espera', 'Solo puedes cambiar tu correo cada 15 días.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando cambios...'
    });
    await loading.present();

    this.isSaving = true;

    this.apiService.updateProfile({
      nombre_completo: this.formData.nombre_completo,
      email: this.formData.email,
      foto: this.user?.foto
    }).subscribe({
      next: (response) => {
        loading.dismiss();
        this.isSaving = false;

        const updatedUser = {
          ...this.user,
          nombre_completo: this.formData.nombre_completo,
          email: this.formData.email,
          foto: this.user?.foto,
          last_email_update: emailChanged ? new Date().toISOString() : this.user?.last_email_update,
          last_profile_update: new Date().toISOString()
        };

        this.authService.saveUser(updatedUser);
        this.authService.updateStoredUser(updatedUser);
        this.user = updatedUser;

        this.mostrarAlerta('Éxito', 'Perfil actualizado correctamente.');
      },
      error: (error) => {
        loading.dismiss();
        this.isSaving = false;

        let mensaje = 'No se pudo actualizar el perfil.';
        if (error?.error?.error) {
          mensaje = error.error.error;
        } else if (error?.error?.message) {
          mensaje = error.error.message;
        }

        this.mostrarAlerta('Error', mensaje);
      }
    });
  }

  canUpdateEmail(): boolean {
    if (!this.user?.last_email_update) return true;
    const lastUpdate = new Date(this.user.last_email_update).getTime();
    const timeSinceUpdate = Date.now() - lastUpdate;
    return timeSinceUpdate >= this.EMAIL_UPDATE_INTERVAL;
  }

  getEmailTimeUntilUpdate(): string {
    if (!this.user?.last_email_update) return '';
    const lastUpdate = new Date(this.user.last_email_update).getTime();
    const timeSinceUpdate = Date.now() - lastUpdate;
    const remaining = this.EMAIL_UPDATE_INTERVAL - timeSinceUpdate;

    if (remaining <= 0) return 'Disponible ahora';

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }

  canChangePassword(): boolean {
    return !!this.passwordData.actual &&
           this.passwordData.nueva.length >= 8 &&
           this.passwordData.nueva === this.passwordData.confirmar;
  }

  async cambiarPassword(): Promise<void> {
    if (!this.canChangePassword()) {
      await this.mostrarAlerta('Error', 'Verifica que las contraseñas coincidan y tengan al menos 8 caracteres.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Cambiando contraseña...'
    });
    await loading.present();

    this.isChangingPassword = true;

    this.apiService.changePassword({
      actual: this.passwordData.actual,
      nueva: this.passwordData.nueva
    }).subscribe({
      next: () => {
        loading.dismiss();
        this.isChangingPassword = false;
        this.passwordData = { actual: '', nueva: '', confirmar: '' };
        this.mostrarAlerta('Éxito', 'Contraseña cambiada correctamente.');
      },
      error: (error) => {
        loading.dismiss();
        this.isChangingPassword = false;

        let mensaje = 'No se pudo cambiar la contraseña.';
        if (error?.error?.error) {
          mensaje = error.error.error;
        } else if (error?.status === 400) {
          mensaje = 'Contraseña actual incorrecta.';
        }

        this.mostrarAlerta('Error', mensaje);
      }
    });
  }

  async confirmarCerrarSesion(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar tu sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          handler: () => {
            this.authService.logout();
          }
        }
      ]
    });

    await alert.present();
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