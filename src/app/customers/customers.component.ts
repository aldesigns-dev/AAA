import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Customer } from './customer.model';
import { CustomersService } from './customers.service';
import { NewCustomerComponent } from './new-customer/new-customer.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersComponent implements OnInit {
  private customersService = inject(CustomersService);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute)
  readonly dialog = inject(MatDialog);
  customers = signal<Customer[]>([]); // Signal waarmee klantenlijst wordt beheerd.
  sortId = signal<'asc' | 'desc'>('desc');
  sortName = signal<'asc' | 'desc'>('desc');
  displayedColumns: string[] = ['customer_id', 'name', 'city', 'edit', 'delete'];
  dataSource = new MatTableDataSource<Customer>(); // Weergave klantgegevens in de tabel.

  sortOnId = computed(() => {
    const customers = this.customers(); // Lijst van customers.
    const sortDirection = this.sortId(); // Sorteerrichting.

    return customers.sort((a, b) => {
      // if (sortDirection === 'desc') {
      //   return a.customer_id > b.customer_id ? -1 : 1; // Sorteer aflopend.
      // } else {
      //   return a.customer_id > b.customer_id ? 1 : -1; // Sorteer oplopend.
      // }
      return sortDirection === 'desc' ?  b.customer_id - a.customer_id :  a.customer_id -  b.customer_id;
    });
  });

  sortOnName = computed(() => {
    const customers = this.customers(); // Lijst van customers.
    const sortDirection = this.sortName(); // Sorteerrichting.
    
    // return customers.sort((a, b) => {
    //   if (sortDirection === 'desc') {
    //     return a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1; // Sorteer aflopend.
    //   } else {
    //     return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1; // Sorteer oplopend.
    //   }
    // });
    return customers.sort((a, b) => 
      sortDirection === 'desc' 
        ? b.name.toLowerCase().localeCompare(a.name.toLowerCase()) 
        : a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  });

  ngOnInit() {
    const subscriptionCustomers = this.customersService.getCustomers().subscribe({
      next: (customers) => {
        console.log('Customers:', customers);
        this.customers.set(customers); // Update de signal.
        this.dataSource.data = customers; // Update de MatTableDataSource.
      },
      error: (err) => console.error('Fout bij ophalen klanten:', err),
    });

    const subscriptionParams = this.activatedRoute.queryParams.subscribe({
      next: (params) => {
        if (params['sortId']) {
          this.sortId.set(params['sortId']);
          this.dataSource.data = this.sortOnId();
        }
        if (params['sortName']) {
          this.sortName.set(params['sortName']);
          this.dataSource.data = this.sortOnName();
        }
      }
    });

    this.destroyRef.onDestroy(() => {
      subscriptionCustomers.unsubscribe();
      subscriptionParams.unsubscribe();
    });
  }

  onAddCustomer(): void {
    // Open dialog in 'add' modus.
    const dialogRef = this.dialog.open(NewCustomerComponent, {
      data: { mode: 'add' }
    });
    
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newCustomer = {
          ...result,
        };
        console.log('Data naar server:', newCustomer); 
        // Voeg klant toe via de service.
        const subscription = this.customersService.addCustomer(newCustomer).subscribe({
          next: (response) => {
            const addedCustomer = response.customer;
            // Update de klantenlijst in de signal en dataSource.
            this.customers.update(oldCustomers => [...oldCustomers, addedCustomer]);
            this.dataSource.data = this.customers();
            console.log('Customer toegevoegd:', addedCustomer);
          },
          error: (err) => console.error('Fout bij toevoegen klant:', err),
        });

        this.destroyRef.onDestroy(() => {
          subscription.unsubscribe();
        });
      }
    });
  }

  onEditCustomer(customerId: number): void {
    // Zoek de klant.
    const customer = this.customers().find(c => c.customer_id === customerId);
    console.log('Customer bewerken: ' + customerId);
    // Open dialog in 'edit' modus.
    const dialogRef = this.dialog.open(NewCustomerComponent, {
      data: { mode: 'edit', customer }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const subscription = this.customersService.editCustomer(customerId, result).subscribe({
          next: () => {
            // Klantgegevens bijwerken in de lijst en dataSource.
            const updatedCustomers = this.customers().map(c =>
              c.customer_id === customerId ? { ...c, ...result } : c
            );
            // Update de signal en de dataSource.
            this.customers.set(updatedCustomers);
            this.dataSource.data = updatedCustomers;
            console.log('Customer bijgewerkt:', result);
          },
          error: (err) => console.error('Fout bij updaten klant:', err),
        });
        
        this.destroyRef.onDestroy(() => {
          subscription.unsubscribe();
        });
      }
    });
  }

  onDeleteCustomer(customerId: number): void {
    // Zoek de klant.
    const customer = this.customers().find(c => c.customer_id === customerId);
    // Open dialog in 'delete' modus.
    const dialogRef = this.dialog.open(NewCustomerComponent, {
      data: { mode: 'delete', customer }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmDelete) {
        // Na bevestiging klant verwijderen.
        const subscription = this.customersService.deleteCustomer(customerId).subscribe({
          next: () => {
            // Verwijder de klant uit de lijst.
            const updatedCustomers = this.customers().filter(c => c.customer_id !== customerId);
            // Update de signal en de dataSource.
            this.customers.set(updatedCustomers);
            this.dataSource.data = updatedCustomers;
            console.log('Customer verwijderd:', customerId);
          },
          error: (err) => console.error('Fout bij verwijderen klant:', err),
        });
  
        this.destroyRef.onDestroy(() => {
          subscription.unsubscribe();
        });
      }
    });
  }
}
