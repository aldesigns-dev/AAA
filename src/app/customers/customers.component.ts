import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Customer } from './customer.model';
import { CustomersService } from './customers.service';
import { DialogCustomerFormComponent } from '../dialogs/dialog-customer-form/dialog-customer-form.component';
import { DialogModeEnum } from '../enums/dialog-mode.enum';
import { DialogConfirmComponent } from '../dialogs/dialog-confirm/dialog-confirm.component';

@UntilDestroy()
@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly customersService = inject(CustomersService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  dataSource = new MatTableDataSource<Customer>(); 
  displayedColumns: string[] = ['customer_id', 'name', 'city', 'update', 'delete'];
  column = signal<'customer_id' | 'name' | undefined>('customer_id');
  sort = signal<'asc' | 'desc' | undefined>('desc');

  sortDirection = computed(() => {
    const customers = this.dataSource.data;
    if (this.column() === 'customer_id') {
      return customers.sort((a, b) => {
        return this.sort() === 'desc' ? b.customer_id - a.customer_id : a.customer_id - b.customer_id;
      });
    }
    if (this.column() === 'name') {
      return customers.sort((a, b) => {
        return this.sort() === 'desc' ? b.name.toLowerCase().localeCompare(a.name.toLowerCase()) : a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      });
    }
    return customers;
  });

  get ascOrDesc(): 'asc' | 'desc' {
    return this.sort() === 'asc' ? 'desc' : 'asc';
  }

  ngOnInit() {
    this.customersService.getCustomers().pipe(untilDestroyed(this)).subscribe({
      next: (customers) => {
        this.dataSource.data = customers; 
      }
    });
    this.activatedRoute.queryParams.pipe(untilDestroyed(this)).subscribe({
      next: (params) => {
        this.column.set(params['column']);
        this.sort.set(params['sort']);
        this.dataSource.data = this.sortDirection();
      }
    });
  }

  onAddCustomer() {
    const dialogRef = this.dialog.open(DialogCustomerFormComponent, {
      data: { mode: DialogModeEnum.Add }
    });
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((result) => {
      if (result) {
        this.addCustomer(result);
      }
    });
  }

  private addCustomer(newCustomer: Customer) {
    this.customersService.addCustomer(newCustomer).pipe(untilDestroyed(this)).subscribe({
      next: (response) => this.addCustomerToDataSource(response.customer),
      error: (err) => {
        console.error('Fout bij het toevoegen van de klant:', err),
        this.snackBar.open('Fout bij het toevoegen van de klant.', 'Sluiten', { duration: 3000 });
      }
    });
  }

  private addCustomerToDataSource(addedCustomer: Customer) {
    this.dataSource.data = [...this.dataSource.data, addedCustomer];
    this.snackBar.open('Klant succesvol toegevoegd.', 'Sluiten', { duration: 3000 });
  }

  onUpdateCustomer(customerId: number) {
    const customer = this.dataSource.data.find(c => c.customer_id === customerId);
    const dialogRef = this.dialog.open(DialogCustomerFormComponent, {
      data: { mode: DialogModeEnum.Update, customer }
    });
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((result) => {
      if (result) {
        this.updateCustomer(customerId, result);
      }
    });
  }

  private updateCustomer(customerId: number, updatedCustomer: any) {
    this.customersService.updateCustomer(customerId, updatedCustomer).pipe(untilDestroyed(this)).subscribe({
      next: () => this.updateCustomerInDataSource(customerId, updatedCustomer),
      error: (err) => {
        console.error('Fout bij het bewerken van de klant:', err),
        this.snackBar.open('Fout bij het bijwerken van de klant.', 'Sluiten', { duration: 3000 });
      }
    });
  }

  private updateCustomerInDataSource(customerId: number, updatedCustomer: any) {
    this.dataSource.data = this.dataSource.data.map(c =>
      c.customer_id === customerId ? { ...c, ...updatedCustomer } : c
    );
    this.snackBar.open('Klant succesvol bijgewerkt.', 'Sluiten', { duration: 3000 });
  }

  onDeleteCustomer(customerId: number) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { source: 'customers', customerId }
    });
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((confirmDelete) => {
      if (confirmDelete) {
        this.deleteCustomer(customerId);
      }
    });
  }

  private deleteCustomer(customerId: number) {
    this.customersService.deleteCustomer(customerId).pipe(untilDestroyed(this)).subscribe({
      next: () => this.removeCustomerFromDataSource(customerId),
      error: (err) => {
        console.error('Fout bij het verwijderen van de klant:', err),
        this.snackBar.open('Fout bij het verwijderen van de klant.', 'Sluiten', { duration: 3000 });
      }
    })
  }

  private removeCustomerFromDataSource(customerId: number) {
    this.dataSource.data = this.dataSource.data.filter(c => c.customer_id !== customerId);
    this.snackBar.open('Klant succesvol verwijderd.', 'Sluiten', { duration: 3000 });
  }

  ngOnDestroy(): void {
    console.log('CustomersComponent destroyed. Subscriptions opgeruimd.');
  }
}
