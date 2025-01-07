import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { BreakdownsComponent } from './breakdowns.component';
import { provideRouter } from '@angular/router';

describe('BreakdownsComponent', () => {
  let component: BreakdownsComponent;
  let fixture: ComponentFixture<BreakdownsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreakdownsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreakdownsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});