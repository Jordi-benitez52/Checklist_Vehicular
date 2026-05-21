import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // No añadir token a endpoints de autenticación (login, verify-code, refresh, etc.)
    const isAuthEndpoint = request.url.includes('/accounts/login') ||
                           request.url.includes('/accounts/refresh') ||
                           request.url.includes('/accounts/token');

    if (token && !isAuthEndpoint) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        console.log('[AuthInterceptor] Request failed:', request.url, error.status, error.error);
        if (error.status === 401 && !request.url.includes('/accounts/refresh/')) {
          return this.handle401Error(request, next);
        }
        if (error.status === 403) {
          this.mostrarError403();
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private async mostrarError403() {
    const alert = await this.alertController.create({
      header: 'Acceso Denegado',
      message: 'No tienes permisos para realizar esta acción. Contacta al administrador.',
      buttons: ['OK']
    });
    await alert.present();
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('[AuthInterceptor] 401 error for URL:', request.url, '| refresh token exists:', !!this.authService.getRefreshToken());
    this.authService.logout();
    this.router.navigateByUrl('/login');
    return throwError(() => new Error('Session expired'));
  }
}

export const authInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};