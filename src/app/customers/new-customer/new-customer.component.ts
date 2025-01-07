import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-new-customer',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogContent, MatDialogActions, MatDialogClose, ReactiveFormsModule],
  templateUrl: './new-customer.component.html',
  styleUrl: './new-customer.component.scss'
})
export class NewCustomerComponent implements OnInit {
  newCustomerForm = new FormGroup({
    name: new FormControl('', {
      validators: [ Validators.required ]
    }),
    city: new FormControl('', Validators.required)
  });

  mode: 'add' | 'edit' | 'delete' = 'add';
  private data = inject(MAT_DIALOG_DATA); // Wordt gebruikt icm MatDialog om gegevens door te sturen. 

  ngOnInit(): void {
    console.log('Dialog Data:', this.data);
    this.mode = this.data?.mode || 'add';
    // Als edit of delete mode actief is worden de klantgegevens gepatcht in het formulier.
    if (this.mode === 'edit' || this.mode === 'delete') {
      this.newCustomerForm.patchValue({
        name: this.data.customer.name,
        city: this.data.customer.city
      });
      // Formulier niet aanpasbaar in delete mode.
      if (this.mode === 'delete') {
        this.newCustomerForm.disable(); 
      }
    }
  }

  fieldIsInvalid(field: string) {
    const control = this.newCustomerForm.get(field);
    return control?.touched && control.invalid;
  }

  // Formuliergegevens versturen met mat-dialog-close. 
  get customer() {
    return this.newCustomerForm.value;
  }
}
