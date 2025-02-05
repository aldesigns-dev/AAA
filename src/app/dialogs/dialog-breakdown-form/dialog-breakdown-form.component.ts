import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

import { DialogModeEnum } from '../../enums/dialog-mode.enum';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-dialog-breakdown-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogContent, MatDialogActions, MatDialogClose, ReactiveFormsModule, MatAutocompleteModule, MatDatepickerModule],
  templateUrl: './dialog-breakdown-form.component.html',
  styleUrl: './dialog-breakdown-form.component.scss'
})
export class DialogBreakdownFormComponent implements OnInit {
  private readonly data = inject(MAT_DIALOG_DATA);
  mode: DialogModeEnum = DialogModeEnum.Add;
  customers: { customer_id: number; name: string }[] = [];

  dialogBreakdownForm = new FormGroup({
    customer_id: new FormControl('', Validators.required),
    moment_of_breakdown: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required)
  });

  get breakdown() {
    return this.dialogBreakdownForm.value;
  }

  ngOnInit(): void {
    this.mode = this.data?.mode || DialogModeEnum.Add;
    this.customers = this.data?.customers || [];

    if (this.mode === DialogModeEnum.Update) {
      this.dialogBreakdownForm.patchValue({
        customer_id: this.data.breakdown.customer_id,
        moment_of_breakdown: this.data.breakdown.moment_of_breakdown,
        description: this.data.breakdown.description
      });
    }

    this.dialogBreakdownForm.get('customer_id')?.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
      this.customers = this.customers.filter((customer) =>
        customer.name.toLowerCase().includes(filterValue)
      );
    })
  }

  fieldIsInvalid(field: string) {
    const control = this.dialogBreakdownForm.get(field);
    return control?.touched && control.invalid;
  }
}
