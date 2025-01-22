import { Routes } from '@angular/router';

import { BreakdownsComponent } from './breakdowns/breakdowns.component';
import { CustomersComponent } from './customers/customers.component';
import { HomeComponent } from './home/home.component';

export enum RoutePath {
  Breakdowns = 'breakdowns',
  Customers = 'customers',
}
// YH: use an enum for the route paths. These are being used in other places in the app.
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: RoutePath.Breakdowns,
    component: BreakdownsComponent,
    data: {
      pageTitle: 'Breakdowns',
    },
  },
  {
    path: RoutePath.Customers,
    component: CustomersComponent,
    data: {
      pageTitle: 'Customers',
    },
  },
];
