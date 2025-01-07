import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-new-breakdown',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogContent, MatDialogActions, MatDialogClose, ReactiveFormsModule, MatAutocompleteModule, MatDatepickerModule],
  templateUrl: './new-breakdown.component.html',
  styleUrl: './new-breakdown.component.scss'
})
export class NewBreakdownComponent implements OnInit {
  newBreakdownForm = new FormGroup({
    customer_id: new FormControl('', Validators.required),
    moment_of_breakdown: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required)
  });

  mode: 'add' | 'edit' | 'delete' = 'add';
  customers: { customer_id: number; name: string }[] = [];
  filteredCustomers: { customer_id: number; name: string }[] = [];
  private data = inject(MAT_DIALOG_DATA); // Gegevens van de hoofdcomponent.

  ngOnInit(): void {
    console.log('Dialog Data:', this.data);
    this.mode = this.data?.mode || 'add';
    // Als edit mode actief is worden de breakdowngegevens gepatcht in het formulier.
    if (this.mode === 'edit' || this.mode === 'delete') {
      console.log('Edit Breakdown Mode: patchValues:', this.data.breakdown);
      this.newBreakdownForm.patchValue({
        customer_id: this.data.breakdown.customer_id,
        moment_of_breakdown: this.data.breakdown.moment_of_breakdown,
        description: this.data.breakdown.description,
      });
    } else {
      console.log('New Breakdown Mode');
      // Stel klantenlijst in voor aanmaakmode.
      if (this.data?.customers) {
        this.customers = this.data.customers;
        this.filteredCustomers = this.customers;
      }
    }

    // Filter de klanten op basis van de invoer in het veld
    this.newBreakdownForm.get('customer_id')?.valueChanges.subscribe((value) => {
      const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
      this.filteredCustomers = this.customers.filter((customer) =>
        customer.name.toLowerCase().includes(filterValue)
      );
    });
  }

  fieldIsInvalid(field: string) {
    const control = this.newBreakdownForm.get(field);
    return control?.touched && control.invalid;
  }

  // Formuliergegevens versturen met mat-dialog-close. 
  get breakdown() {
    return this.newBreakdownForm.value;
  }
}
