import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DashboardGuardiaPageRoutingModule } from './dashboard-guardia-routing.module';
import { DashboardGuardiaPage } from './dashboard-guardia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardGuardiaPageRoutingModule
  ],
  declarations: [DashboardGuardiaPage]
})
export class DashboardGuardiaPageModule {}
