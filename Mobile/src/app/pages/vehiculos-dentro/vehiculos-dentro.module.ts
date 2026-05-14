import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { VehiculosDentroPageRoutingModule } from './vehiculos-dentro-routing.module';
import { VehiculosDentroPage } from './vehiculos-dentro.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    VehiculosDentroPageRoutingModule
  ],
  declarations: [VehiculosDentroPage]
})
export class VehiculosDentroPageModule {}