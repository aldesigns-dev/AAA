import { inject, Injectable, signal } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { map, tap } from "rxjs";

import { Customer } from "./customer.model";

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private httpClient = inject(HttpClient);
  private customers = signal<Customer[]>([]);

  getCustomers() {
    return this.httpClient.get<{ customers: Customer[] }>('http://localhost:3000/customers')
      .pipe(
        map(response => response.customers)
      );
  }

  addCustomer(customerData: {name: string, city: string, customer_id: number}) {
    const newCustomer = {
      ...customerData,
    };
    console.log('Data verzonden naar server:', newCustomer);
    return this.httpClient.post<{ customer: Customer }>('http://localhost:3000/customers', newCustomer)
      .pipe(
        tap({
          next: (response) => {
            console.log('Response van server:', response);
            const newCustomers = response.customer;
            this.customers.update((oldCustomers) => [...oldCustomers, newCustomers]);
          },
          error: (err) => {
            console.error('Error while adding customer:', err);
          }
        })
      );
  }

  editCustomer(customerId: number, updatedData: { name: string, city: string }) {
    const updatedCustomer = { ...updatedData, customer_id: customerId };
    return this.httpClient.put(`http://localhost:3000/customers/${customerId}`, updatedCustomer)
      .pipe(
        tap(() => {
          this.customers.update((oldCustomers) => 
            oldCustomers.map(customer =>
              customer.customer_id === customerId ? updatedCustomer : customer
            )
          );
        })
      );
  }

  deleteCustomer(customerId: number) {
    return this.httpClient.delete(`http://localhost:3000/customers/${customerId}`)
      .pipe(
        tap(() => {
          this.customers.update((oldCustomers) => 
            oldCustomers.filter(customer => customer.customer_id !== customerId)
          );
        })
      );
  }
}