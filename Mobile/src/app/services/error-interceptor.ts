import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private alertController: AlertController) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.mostrarError(error);
        return throwError(() => error);
      })
    );
  }

  private async mostrarError(error: HttpErrorResponse) {
    let header = 'Error';
    let message = 'Ocurrió un error inesperado.';

    if (error.status === 0) {
      header = 'Sin conexión';
      message = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    } else if (error.status === 403) {
      header = 'Acceso Denegado';
      message = 'No tienes permisos para realizar esta acción. Contacta al administrador.';
    } else if (error.status === 401) {
      header = 'Sesión expirada';
      message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 404) {
      header = 'No encontrado';
      message = 'El recurso solicitado no existe.';
    } else if (error.status === 429) {
      header = 'Demasiadas solicitudes';
      message = 'Has realizado demasiadas solicitudes. Espera un momento.';
    } else if (error.status >= 500) {
      header = 'Error del servidor';
      message = 'Ocurrió un error en el servidor. Intenta más tarde.';
    } else if (error.error) {
      const backendMessage = error.error.error || error.error.detail || error.error.message;
      if (backendMessage) {
        header = 'Error';
        message = backendMessage;
      }
    }

    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'error-alert'
    });
    await alert.present();
  }
}