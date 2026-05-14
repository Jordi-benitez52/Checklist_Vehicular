import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroAccesoPage } from './registro-acceso.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroAccesoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroAccesoPageRoutingModule {}