import { Routes } from '@angular/router';

import { BreakdownsComponent } from './breakdowns/breakdowns.component';
import { CustomersComponent } from './customers/customers.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'breakdowns',
    component: BreakdownsComponent,
    data: {
      pageTitle: 'Breakdowns'
    }
  },
  {
    path: 'customers',
    component: CustomersComponent,
    data: {
      pageTitle: 'Customers'
    }
  }
];
