import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Breakdown } from './breakdown.model';
import { Customer } from '../customers/customer.model';
import { BreakdownsService } from './breakdowns.service';
import { CustomersService } from '../customers/customers.service';
import { NewBreakdownComponent } from './new-breakdown/new-breakdown.component';

@Component({
  selector: 'app-breakdowns',
  standalone: true,
  imports: [FormsModule, MatTableModule, MatButtonModule, MatIconModule, DatePipe, RouterLink],
  templateUrl: './breakdowns.component.html',
  styleUrl: './breakdowns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreakdownsComponent implements OnInit {
  private customersService = inject(CustomersService);
  private breakdownsService = inject(BreakdownsService);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  readonly dialog = inject(MatDialog);
  customers = signal<Customer[]>([]); // Signal waarmee klantenlijst wordt beheerd.
  breakdowns = signal<Breakdown[]>([]); // Signal waarmee breakdownlijst wordt beheerd.
  sortId = signal<'asc' | 'desc'>('desc');
  sortDate = signal<'asc' | 'desc'>('desc');
  displayedColumns: string[] = ['customer_id', 'breakdown_id', 'moment_of_breakdown', 'description', 'edit', 'delete'];
  dataSource = new MatTableDataSource<Breakdown>(); // Weergave breakdowngegevens in de tabel.

  sortOnId = computed(() => {
    const breakdowns = this.breakdowns(); // Lijst van breakdowns.
    const sortDirection = this.sortId(); // Sorteerrichting.

    return breakdowns.sort((a, b) => {
      return sortDirection === 'desc' ?  b.customer_id - a.customer_id :  a.customer_id -  b.customer_id;
    });
  });

  sortOnDate = computed(() => {
    const breakdowns = this.breakdowns(); // Lijst van breakdowns.
    const sortDirection = this.sortDate(); // Sorteerrichting.

    return breakdowns.sort((a, b) => {
      const dateA = new Date(a.moment_of_breakdown).getTime(); 
      const dateB = new Date(b.moment_of_breakdown).getTime(); 
      console.log(a.moment_of_breakdown, dateA);

      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }
);

  ngOnInit() {
    const subscriptionCustomers = this.customersService.getCustomers().subscribe({
      next: (customers) => {
        console.log('Customers:', customers);
        this.customers.set(customers); // Update de signal.
      },
      error: (err) => console.error('Fout bij ophalen klanten:', err),
    });

    const subscriptionBreakdowns = this.breakdownsService.getBreakdowns().subscribe({
      next: (breakdowns) => {
        console.log('Breakdowns:', breakdowns);
        this.breakdowns.set(breakdowns); // Update de signal.
        this.dataSource.data = breakdowns; // Update de MatTableDataSource.
      },
      error: (err) => console.error('Fout bij ophalen breakdowns:', err),
    });

    const subscriptionParams = this.activatedRoute.queryParams.subscribe({
      // Callback functie wanneer er een update van queryParams is.
      next: (params) => {
        // Als queryparameter sortId bevat, sorteer op Id.
        if (params['sortId']) {
          this.sortId.set(params['sortId']);
          this.dataSource.data = this.sortOnId();
        }
        // Als queryparameter sortDate bevat, sorteer op Date.
        if (params['sortDate']) {
          this.sortDate.set(params['sortDate']);
          this.dataSource.data = this.sortOnDate();
        }
      }
    });

    this.destroyRef.onDestroy(() => {
      subscriptionCustomers.unsubscribe();
      subscriptionBreakdowns.unsubscribe();
      subscriptionParams.unsubscribe();
    });
  }

  onAddBreakdown(): void {
    // Open dialog in 'add' modus.
    const dialogRef = this.dialog.open(NewBreakdownComponent, {
      data: { 
        mode: 'add',
        customers: this.customers() // Geef de lijst met klanten mee.
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newBreakdown = {
          ...result,
        };
        console.log('Breakdown data naar server:', newBreakdown); 
        // Voeg breakdown toe via de service.
        const subscription = this.breakdownsService.addBreakdown(newBreakdown).subscribe({
          next: (response) => {
            const addedBreakdown = response.breakdown;
            // Update de breakdownlijst in de signal en dataSource.
            this.breakdowns.update(oldBreakdowns => [...oldBreakdowns, addedBreakdown]);
            this.dataSource.data = this.breakdowns();
            console.log('Breakdown toegevoegd:', addedBreakdown);
          },
          error: (err) => console.error('Fout bij toevoegen breakdown:', err),
        });

        this.destroyRef.onDestroy(() => {
          subscription.unsubscribe();
        });
      }
    });
  }

  onEditBreakdown(breakdownId: number): void {
    console.log('Edit breakdown:', breakdownId);
    // Zoek de breakdown.
    const breakdown = this.breakdowns().find(b => b.breakdown_id === breakdownId);
    // Open dialog in 'edit' modus.
    const dialogRef = this.dialog.open(NewBreakdownComponent, {
      data: { mode: 'edit', breakdown }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const subscription = this.breakdownsService.editBreakdown(breakdownId, result).subscribe({
          next: () => {
            // Breakdowngegevens bijwerken in de lijst en dataSource.
            const updatedBreakdown = this.breakdowns().map(b =>
              b.breakdown_id === breakdownId ? { ...b, ...result } : b
            );
            // Update de signal en de dataSource.
            this.breakdowns.set(updatedBreakdown);
            this.dataSource.data = updatedBreakdown;
            console.log('Breakdown bijgewerkt:', result);
          },
          error: (err) => console.error('Fout bij updaten klant:', err),
        });
        
        this.destroyRef.onDestroy(() => {
          subscription.unsubscribe();
        });
      }
    });
  }

  onDeleteBreakdown(breakdownId: number): void {
    // Zoek de breakdown.
    const breakdown = this.breakdowns().find(b => b.breakdown_id === breakdownId);
    // Open dialog in 'delete' modus.
    const dialogRef = this.dialog.open(NewBreakdownComponent, {
      data: { mode: 'delete', breakdown }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmDelete) {
        // Na bevestiging breakdown verwijderen.
        const subscription = this.breakdownsService.deleteBreakdown(breakdownId).subscribe({
          next: () => {
            // Verwijder de breakdown uit de lijst.
            const updatedBreakdowns = this.breakdowns().filter(b => b.breakdown_id !== breakdownId);
            // Update de signal en de dataSource.
            this.breakdowns.set(updatedBreakdowns);
            this.dataSource.data = updatedBreakdowns;
            console.log('Breakdown verwijderd:', breakdownId);
          },
          error: (err) => console.error('Fout bij verwijderen breakdown:', err),
        });
    
        this.destroyRef.onDestroy(() => {
          subscription.unsubscribe();
        });
      }
    });
  }
}
