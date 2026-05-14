import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const user = this.authService.getUser();
    const requiredRole = route.data['role'] as string;

    if (!user) {
      return this.router.createUrlTree(['/login']);
    }

    if (requiredRole && user.role !== requiredRole) {
      if (user.role === 'guardia') {
        return this.router.createUrlTree(['/dashboard-guardia']);
      } else if (user.role === 'admin') {
        return this.router.createUrlTree(['/home']);
      }
      return this.router.createUrlTree(['/login']);
    }

    return true;
  }
}