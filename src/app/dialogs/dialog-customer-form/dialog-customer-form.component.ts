import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DialogModeEnum } from '../../enums/dialog-mode.enum';
import { DialogCustomerData } from './dialog-customer-form-interface';

@Component({
  selector: 'app-dialog-customer-form',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogContent, MatDialogActions, MatDialogClose, ReactiveFormsModule],
  templateUrl: './dialog-customer-form.component.html',
  styleUrl: './dialog-customer-form.component.scss'
})
export class DialogCustomerFormComponent implements OnInit {
  private readonly data = inject<DialogCustomerData>(MAT_DIALOG_DATA); 
  mode: DialogModeEnum = DialogModeEnum.Add;

  dialogCustomerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.mode = this.data.mode;

    if (this.mode === DialogModeEnum.Update) {
      this.dialogCustomerForm.patchValue({
        name: this.data.customer?.name,
        city: this.data.customer?.city
      });
    }
  }
  
  fieldIsInvalid(field: string) {
    const control = this.dialogCustomerForm.get(field);
    return control?.touched && control.invalid;
  }
}
