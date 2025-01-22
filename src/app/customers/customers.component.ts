import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
  private activatedRoute = inject(ActivatedRoute);
  // YH: dialog is not used in the template, so it should be a private variable.
  readonly dialog = inject(MatDialog);

  // YH: customers is not used in the template, so it should be a private variable.
  // YH: customers is redundant, because the data is already in the MatTableDataSource.
  customers = signal<Customer[]>([]); // Signal waarmee klantenlijst wordt beheerd.
  // YH: sortId and sortName as Signals are overkill. Use a simple variable.
  // YH: variable names should be descriptive. sortDirection is more clear than sortId or sortName.
  sortId = signal<'asc' | 'desc'>('desc');
  sortName = signal<'asc' | 'desc'>('desc');
  displayedColumns: string[] = [
    'customer_id',
    'name',
    'city',
    'edit',
    'delete',
  ];
  dataSource = new MatTableDataSource<Customer>(); // Weergave klantgegevens in de tabel.

  // YH: for clearity use a getter for the sorted data. Signals is overkill for this.
  // YH: this variable is not used in the template, so it should be a private variable.
  sortOnId = computed(() => {
    const customers = this.customers(); // Lijst van customers.
    const sortDirection = this.sortId(); // Sorteerrichting.

    return customers.sort((a, b) => {
      return sortDirection === 'desc'
        ? b.customer_id - a.customer_id
        : a.customer_id - b.customer_id;
    });
  });

  // YH: creating a different implementation for sorting on name is overkill. Use a single implementation for sorting.
  sortOnName = computed(() => {
    const customers = this.customers(); // Lijst van customers.
    const sortDirection = this.sortName(); // Sorteerrichting.

    return customers.sort((a, b) =>
      sortDirection === 'desc'
        ? b.name.toLowerCase().localeCompare(a.name.toLowerCase())
        : a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
  });

  ngOnInit() {
    const subscriptionCustomers = this.customersService
      .getCustomers()
      .subscribe({
        next: (customers) => {
          console.log('Customers:', customers);
          // YH: no need to store it twice
          this.customers.set(customers); // Update de signal.
          this.dataSource.data = customers; // Update de MatTableDataSource.
        },
        error: (err) => console.error('Fout bij ophalen klanten:', err),
      });

    const subscriptionParams = this.activatedRoute.queryParams.subscribe({
      // Callback functie wanneer er een update van queryParams is.
      next: (params) => {
        // Als queryparameter sortId bevat, sorteer op Id.
        // YH: use sortDirection instead of sortId or sortName. the getter will take care of updating
        if (params['sortId']) {
          this.sortId.set(params['sortId']);
          this.dataSource.data = this.sortOnId();
        }
        // Als queryparameter sortName bevat, sorteer op Name.
        if (params['sortName']) {
          this.sortName.set(params['sortName']);
          this.dataSource.data = this.sortOnName();
        }
      },
    });

    // YH: Unsubscribing from Observables should be defined when initiating it. Use a pipe and the takeUntilDestroyed operator
    this.destroyRef.onDestroy(() => {
      subscriptionCustomers.unsubscribe();
      subscriptionParams.unsubscribe();
    });
  }

  onAddCustomer(): void {
    // Open dialog in 'add' mode.
    // YH: define the interfaces (input and output), so that the contract is clear.
    const dialogRef = this.dialog.open(NewCustomerComponent, {
      // YH: use an enum for the mode
      data: { mode: 'add' },
    });

    // YH: make sure to unsubscribe from the subscription when the component is destroyed.
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newCustomer = {
          ...result,
        };
        console.log('Data naar server:', newCustomer);
        // Voeg klant toe via de service.
        const subscription = this.customersService
          .addCustomer(newCustomer)
          .subscribe({
            next: (response) => {
              const addedCustomer = response.customer;
              // YH: this implementation doesn't take sorting into account. The implemenation with a getter does
              // Update de klantenlijst in de signal en dataSource.
              // YH: no need to store it twice
              this.customers.update((oldCustomers) => [
                ...oldCustomers,
                addedCustomer,
              ]);
              this.dataSource.data = this.customers();
              // YH: remove consol.log statements from production code
              console.log('Customer toegevoegd:', addedCustomer);
            },
            error: (err) => console.error('Fout bij toevoegen klant:', err),
          });

        // YH: Unsubscribing from Observables should be defined when initiating it. Use a pipe and the takeUntilDestroyed operator
        this.destroyRef.onDestroy(() => {
          subscription.unsubscribe();
        });
      }
    });
  }

  onEditCustomer(customerId: number): void {
    // Zoek de klant.
    const customer = this.customers().find((c) => c.customer_id === customerId);
    console.log('Customer bewerken: ' + customerId);
    // Open dialog in 'edit' mode.
    // YH: define the interfaces (input and output), so that the contract is clear.
    const dialogRef = this.dialog.open(NewCustomerComponent, {
      // YH: use an enum for the mode
      data: { mode: 'edit', customer },
    });

    // YH: make sure to unsubscribe from the subscription when the component is destroyed.
    // YH: subscribing to the afterClosed method should be done in the same block as the dialog opening.
    // YH: subscribing within a subscription is hard to test and read. Split the code up in multiple methods.
    dialogRef.afterClosed().subscribe((result) => {
      // YH: Early returns is the standard. If no result => return.
      if (result) {
        const subscription = this.customersService
          .editCustomer(customerId, result)
          .subscribe({
            next: () => {
              // Klantgegevens bijwerken in de lijst en dataSource.
              const updatedCustomers = this.customers().map((c) =>
                c.customer_id === customerId ? { ...c, ...result } : c
              );
              // Update de signal en de dataSource.
              // YH: no need to store it twice
              this.customers.set(updatedCustomers);
              this.dataSource.data = updatedCustomers;
              console.log('Customer bijgewerkt:', result);
            },
            error: (err) => console.error('Fout bij updaten klant:', err),
          });

        // YH: Unsubscribing from Observables should be defined when initiating it. Use a pipe and the takeUntilDestroyed operator
        this.destroyRef.onDestroy(() => {
          subscription.unsubscribe();
        });
      }
    });
  }

  // YH: this function is almost completely the same as onEditCustomer. Extract the common code to a separate method or combine the two
  onDeleteCustomer(customerId: number): void {
    // Zoek de klant.
    // YH: customer can be found in the dataSource. No need to store it in a signal.
    const customer = this.customers().find((c) => c.customer_id === customerId);
    // Open dialog in 'delete' mode.
    // YH: define the interfaces (input and output), so that the contract is clear.
    const dialogRef = this.dialog.open(NewCustomerComponent, {
      // YH: use an enum for the mode
      data: { mode: 'delete', customer },
    });

    // YH: make sure to unsubscribe from the subscription when the component is destroyed.
    // YH: subscribing to the afterClosed method should be done in the same block as the dialog opening.
    // YH: subscribing within a subscription is hard to test and read. Split the code up in multiple methods.
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmDelete) {
        // Na bevestiging klant verwijderen.
        const subscription = this.customersService
          .deleteCustomer(customerId)
          .subscribe({
            next: () => {
              // Verwijder de klant uit de lijst.
              const updatedCustomers = this.customers().filter(
                (c) => c.customer_id !== customerId
              );
              // Update de signal en de dataSource.
              // YH: no need to store it twice
              this.customers.set(updatedCustomers);
              this.dataSource.data = updatedCustomers;
              console.log('Customer verwijderd:', customerId);
            },
            error: (err) => console.error('Fout bij verwijderen klant:', err),
          });

        // YH: Unsubscribing from Observables should be defined when initiating it. Use a pipe and the takeUntilDestroyed operator
        this.destroyRef.onDestroy(() => {
          subscription.unsubscribe();
        });
      }
    });
  }
}
