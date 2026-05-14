import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard-guardia',
    loadChildren: () =>
      import('./pages/dashboard-guardia/dashboard-guardia.module').then(m => m.DashboardGuardiaPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'guardia' }
  },
  {
    path: 'registro-acceso',
    loadChildren: () =>
      import('./pages/registro-acceso/registro-acceso.module').then(m => m.RegistroAccesoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'movimiento',
    loadChildren: () =>
      import('./pages/movimiento/movimiento.module').then(m => m.MovimientoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'checklist',
    loadChildren: () =>
      import('./pages/checklist/checklist.module').then(m => m.ChecklistPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'checklist-tracto',
    loadChildren: () =>
      import('./pages/checklist-tracto/checklist-tracto.module').then(m => m.ChecklistTractoPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'guardia' }
  },
  {
    path: 'historial',
    loadChildren: () =>
      import('./pages/historial/historial.module').then(m => m.HistorialPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mi-perfil',
    loadChildren: () =>
      import('./pages/mi-perfil/mi-perfil.module').then(m => m.MiPerfilPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'quick-registro/:tipo',
    loadChildren: () =>
      import('./pages/quick-registro/quick-registro.module').then(m => m.QuickRegistroPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'guardia' }
  },
  {
    path: 'cerrar-turno',
    loadChildren: () =>
      import('./pages/cerrar-turno/cerrar-turno.page.module').then(m => m.CerrarTurnoPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'vehiculos-dentro',
    loadChildren: () =>
      import('./pages/vehiculos-dentro/vehiculos-dentro.module').then(m => m.VehiculosDentroPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'guardia' }
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}