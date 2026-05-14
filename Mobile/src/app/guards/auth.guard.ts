import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkAuth(state.url);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isTokenExpired()) {
        const refreshToken = this.authService.getRefreshToken();
        if (refreshToken) {
          return this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: url, reason: 'expired' }
          });
        }
        this.authService.logout();
        return this.router.createUrlTree(['/login']);
      }
      return true;
    }

    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: url }
    });
  }
}