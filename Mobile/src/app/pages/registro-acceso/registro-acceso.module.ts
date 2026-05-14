import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RegistroAccesoPageRoutingModule } from './registro-acceso-routing.module';
import { RegistroAccesoPage } from './registro-acceso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistroAccesoPageRoutingModule
  ],
  declarations: [RegistroAccesoPage]
})
export class RegistroAccesoPageModule {}