import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.initExpiryCheck();
  }

  private initExpiryCheck(): void {
    setInterval(() => {
      if (this.isTokenExpired() && this.getRefreshToken()) {
        this.refreshAccessToken().subscribe({
          error: () => this.logout()
        });
      }
    }, 60000);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    this.saveTokenExpiry(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  saveRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  saveUser(user: any): void {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const data = localStorage.getItem(this.USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  getUserRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  updateStoredUser(partial: any): void {
    const current = this.getUser() || {};
    const merged = { ...current, ...partial };
    this.saveUser(merged);
  }

  private saveTokenExpiry(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp ? payload.exp * 1000 : Date.now() + 8 * 60 * 60 * 1000;
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    } catch {
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, (Date.now() + 8 * 60 * 60 * 1000).toString());
    }
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) {
      const token = this.getToken();
      if (!token) return true;
      this.saveTokenExpiry(token);
      return this.isTokenExpired();
    }
    return Date.now() >= parseInt(expiry, 10);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired() || !!this.getRefreshToken();
  }

  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.refreshToken(refreshToken).pipe(
      map(response => {
        if (response.access) {
          this.saveToken(response.access);
          if (response.refresh) {
            this.saveRefreshToken(response.refresh);
          }
        }
        return response;
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.router.navigateByUrl('/login');
  }

  clearAll(): void {
    localStorage.clear();
  }
}