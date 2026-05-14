import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QuickRegistroPageRoutingModule } from './quick-registro-routing.module';
import { QuickRegistroPage } from './quick-registro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuickRegistroPageRoutingModule
  ],
  declarations: [QuickRegistroPage]
})
export class QuickRegistroPageModule {}