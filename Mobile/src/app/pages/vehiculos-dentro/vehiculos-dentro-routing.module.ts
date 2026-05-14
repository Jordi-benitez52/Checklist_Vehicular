import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VehiculosDentroPage } from './vehiculos-dentro.page';

const routes: Routes = [
  {
    path: '',
    component: VehiculosDentroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculosDentroPageRoutingModule {}