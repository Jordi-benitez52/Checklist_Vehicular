import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ChecklistTractoPageRoutingModule } from './checklist-tracto-routing.module';
import { ChecklistTractoPage } from './checklist-tracto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChecklistTractoPageRoutingModule
  ],
  declarations: [ChecklistTractoPage]
})
export class ChecklistTractoPageModule {}