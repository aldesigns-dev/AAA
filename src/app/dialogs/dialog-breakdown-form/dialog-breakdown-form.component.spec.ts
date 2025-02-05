import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogBreakdownFormComponent } from './dialog-breakdown-form.component';

describe('DialogBreakdownFormComponent', () => {
  let component: DialogBreakdownFormComponent;
  let fixture: ComponentFixture<DialogBreakdownFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogBreakdownFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogBreakdownFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
