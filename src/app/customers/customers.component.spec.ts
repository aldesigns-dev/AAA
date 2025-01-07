import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersComponent } from './customers.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CustomersService } from './customers.service';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;
  let customersService: CustomersService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;
    customersService = TestBed.inject(CustomersService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch customers and update the signal + dataSource', () => {
      // expect(received).toHaveBeenCalled()
      // Matcher error: received value must be a mock or spy function

      expect(customersService.getCustomers()).toHaveBeenCalled();
      expect(component.customers()).toEqual([{ customer_id: 1, name: 'John Doe', city: 'City' }]);
      expect(component.dataSource.data).toEqual([{ customer_id: 1, name: 'John Doe', city: 'City' }]);
    });
    // it('should set params for sorting on ID and Name', () => {
    //   expect();
    // });
    // it('should clean up subscriptions', () => {
    //   expect();
    // });
  });
});
