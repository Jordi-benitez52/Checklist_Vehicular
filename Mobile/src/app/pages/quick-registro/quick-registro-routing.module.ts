import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuickRegistroPage } from './quick-registro.page';

const routes: Routes = [
  {
    path: '',
    component: QuickRegistroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuickRegistroPageRoutingModule {}