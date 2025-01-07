import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBreakdownComponent } from './new-breakdown.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NewBreakdownComponent', () => {
  let component: NewBreakdownComponent;
  let fixture: ComponentFixture<NewBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewBreakdownComponent, NoopAnimationsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
