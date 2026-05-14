import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PendingShiftGuard implements CanActivate {
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const user = this.authService.getUser();

    if (!user) {
      return of(this.router.createUrlTree(['/login']));
    }

    const guardiaId = user.id;

    return this.apiService.getTurnos(true, guardiaId).pipe(
      map(turnos => {
        if (turnos && turnos.length > 0) {
          return true;
        }
        return this.router.createUrlTree(['/dashboard-guardia'], {
          queryParams: { error: 'no_shift' }
        });
      }),
      catchError(error => {
        return of(this.router.createUrlTree(['/dashboard-guardia'], {
          queryParams: { error: 'shift_error' }
        }));
      })
    );
  }
}