import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChecklistTractoPage } from './checklist-tracto.page';

const routes: Routes = [
  {
    path: '',
    component: ChecklistTractoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChecklistTractoPageRoutingModule {}