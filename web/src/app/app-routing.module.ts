import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'route1',
    loadChildren: () =>
      import('./route1/route1.module').then((m) => m.Route1Module),
  },
  {
    path: 'route2',
    loadChildren: () =>
      import('./route2/route2.module').then((m) => m.Route2Module),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
