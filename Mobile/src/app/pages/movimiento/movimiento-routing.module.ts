import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovimientoPage } from './movimiento.page';

const routes: Routes = [
  {
    path: '',
    component: MovimientoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MovimientoPageRoutingModule {}