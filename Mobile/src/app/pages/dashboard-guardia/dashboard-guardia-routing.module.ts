import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardGuardiaPage } from './dashboard-guardia.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardGuardiaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardGuardiaPageRoutingModule {}
