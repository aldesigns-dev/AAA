import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Breakdown } from './breakdown.model';
import { Customer } from '../customers/customer.model';
import { BreakdownsService } from './breakdowns.service';
import { CustomersService } from '../customers/customers.service';
import { DialogBreakdownFormComponent } from '../dialogs/dialog-breakdown-form/dialog-breakdown-form.component'; 
import { DialogModeEnum } from '../enums/dialog-mode.enum';
import { DialogConfirmComponent } from '../dialogs/dialog-confirm/dialog-confirm.component';

@UntilDestroy()
@Component({
  selector: 'app-breakdowns',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, DatePipe, RouterLink],
  templateUrl: './breakdowns.component.html',
  styleUrl: './breakdowns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreakdownsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly customersService = inject(CustomersService);
  private readonly breakdownsService = inject(BreakdownsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  dataSourceB = new MatTableDataSource<Breakdown>(); 
  dataSourceC = new MatTableDataSource<Customer>(); 
  displayedColumns: string[] = ['customer_id', 'breakdown_id', 'moment_of_breakdown', 'description', 'update', 'delete'];
  column = signal<'customer_id' | 'moment_of_breakdown' | undefined>('customer_id');
  sort = signal<'asc' | 'desc' | undefined>('desc');

  sortDirection = computed(() => {
    const breakdowns = this.dataSourceB.data;
    if (this.column() === 'customer_id') {
      return breakdowns.sort((a, b) => {
        return this.sort() === 'desc' ? b.customer_id - a.customer_id : a.customer_id - b.customer_id;
      });
    }
    if (this.column() === 'moment_of_breakdown') {
      return breakdowns.sort((a, b) => {
        const dateA = new Date(a.moment_of_breakdown).getTime(); 
        const dateB = new Date(b.moment_of_breakdown).getTime(); 
        return this.sort() === 'desc' ? dateB - dateA : dateA - dateB;
      });
    }
    return breakdowns;
  });

  get ascOrDesc(): 'asc' | 'desc' {
    return this.sort() === 'asc' ? 'desc' : 'asc';
  }

  ngOnInit() {
    this.customersService.getCustomers().pipe(untilDestroyed(this)).subscribe({
      next: (customers) => {
        this.dataSourceC.data = customers; 
      },
      error: (err) => console.error('Fout bij ophalen klanten:', err),
    });

    this.breakdownsService.getBreakdowns().pipe(untilDestroyed(this)).subscribe({
      next: (breakdowns) => {
        this.dataSourceB.data = breakdowns;
      },
      error: (err) => console.error('Fout bij ophalen breakdowns:', err),
    });

    this.activatedRoute.queryParams.pipe(untilDestroyed(this)).subscribe({
      next: (params) => {
        this.column.set(params['column']);
        this.sort.set(params['sort']);
        this.dataSourceB.data = this.sortDirection();
      }
    });
  }

  onAddBreakdown() {
    const dialogRef = this.dialog.open(DialogBreakdownFormComponent, {
      data: { mode: DialogModeEnum.Add, customers: this.dataSourceC.data }
    });
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((result) => {
      if (result) {
        this.addBreakdown(result);
      }
    });
  }

  private addBreakdown(newBreakdown: Breakdown) {
    this.breakdownsService.addBreakdown(newBreakdown).pipe(untilDestroyed(this)).subscribe({
      next: (response) => this.addBreakdownToDataSource(response.breakdown),
      error: (err) => {
        console.error('Fout bij het toevoegen van de breakdown:', err),
        this.snackBar.open('Fout bij het toevoegen van de breakdown.', 'Sluiten', { duration: 3000 });
      }
    })
  }

  private addBreakdownToDataSource(addedBreakdown: Breakdown) {
    this.dataSourceB.data = [...this.dataSourceB.data, addedBreakdown];
    this.snackBar.open('Breakdown succesvol toegevoegd.', 'Sluiten', { duration: 3000 });
  }

  onUpdateBreakdown(breakdownId: number) {
    const breakdown = this.dataSourceB.data.find(b => b.breakdown_id === breakdownId);
    const dialogRef = this.dialog.open(DialogBreakdownFormComponent, {
      data: { mode: DialogModeEnum.Update, breakdown }
    });
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((result) => {
      if (result) {
        this.updateBreakdown(breakdownId, result);
      }
    });
  }

  private updateBreakdown(breakdownId: number, updatedBreakdown: any) {
    this.breakdownsService.updateBreakdown(breakdownId, updatedBreakdown).pipe(untilDestroyed(this)).subscribe({
      next: () => this.updateBreakdownInDataSource(breakdownId, updatedBreakdown),
      error: (err) => {
        console.error('Fout bij het bewerken van de breakdown:', err),
        this.snackBar.open('Fout bij het bijwerken van de breakdown.', 'Sluiten', { duration: 3000 });
      }
    });
  }

  private updateBreakdownInDataSource(breakdownId: number, updatedBreakdown: any) {
    this.dataSourceB.data = this.dataSourceB.data.map(b =>
      b.breakdown_id === breakdownId ? { ...b, ...updatedBreakdown } : b
    );
    this.snackBar.open('Breakdown succesvol bijgewerkt.', 'Sluiten', { duration: 3000 });
  }

  onDeleteBreakdown(breakdownId: number) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { source: 'breakdowns', breakdownId }
    });
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((confirmDelete) => {
      if (confirmDelete) {
        this.deleteBreakdown(breakdownId);
      }
    });
  }

  private deleteBreakdown(breakdownId: number) {
    this.breakdownsService.deleteBreakdown(breakdownId).pipe(untilDestroyed(this)).subscribe({
      next: () => this.removeBreakdownFromDataSource(breakdownId),
      error: (err) => {
        console.error('Fout bij het verwijderen van de breakdown:', err),
        this.snackBar.open('Fout bij het verwijderen van de breakdown.', 'Sluiten', { duration: 3000 });
      }
    })
  }

  private removeBreakdownFromDataSource(breakdownId: number) {
    this.dataSourceB.data = this.dataSourceB.data.filter(b => b.breakdown_id !== breakdownId);
    this.snackBar.open('Breakdown succesvol verwijderd.', 'Sluiten', { duration: 3000 });
  }

  ngOnDestroy(): void {
    console.log('BreakdownsComponent destroyed. Subscriptions opgeruimd.');
  }
}
