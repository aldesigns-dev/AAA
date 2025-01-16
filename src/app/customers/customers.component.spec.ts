import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { CustomersComponent } from './customers.component';
import { CustomersService } from './customers.service';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;
  const customersService: Partial<CustomersService> = {
    getCustomers: () =>
      of([
        {
          customer_id: 1,
          name: 'John Doe',
          city: 'City',
        },
      ]),
    addCustomer: () =>
      of({
        customer: {
          customer_id: 1,
          name: 'John Doe',
          city: 'City',
        },
      }),
  };
  const newCustomer = { name: 'Jane', city: 'City' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: CustomersService,
          useValue: customersService,
        },
        {
          provide: MatDialog,
          useValue: {
            open: jest.fn().mockReturnValue({
              afterClosed: jest.fn().mockReturnValue(of(newCustomer)),
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should setup observables', () => {
      // Create spy for getCustomers().
      const getCustomersSpy = jest.spyOn(customersService, 'getCustomers');
      // Create spy for queryParams.

      // Call method.
      component.ngOnInit();

      // Check if getCustomers() has been called.
      expect(getCustomersSpy).toHaveBeenCalled();
    });

    it('should call getCustomers()', () => {
      expect(component.customers()).toEqual([
        { customer_id: 1, name: 'John Doe', city: 'City' },
      ]);
      expect(component.dataSource.data).toEqual([
        { customer_id: 1, name: 'John Doe', city: 'City' },
      ]);
    });
  });

  describe('sortOnId', () => {
    beforeEach(() => {
      component.customers.set([
        {
          customer_id: 2,
          name: 'John Doe',
          city: 'City',
        },
        {
          customer_id: 1,
          name: 'John Doe',
          city: 'City',
        },
        {
          customer_id: 3,
          name: 'John Doe',
          city: 'City',
        },
      ]);
    });

    it('should set params for sorting on ID `default`', () => {
      expect(component.sortOnId()[0].customer_id).toBe(3);
      expect(component.sortOnId()[1].customer_id).toBe(2);
      expect(component.sortOnId()[2].customer_id).toBe(1);
      expect(component.sortOnId()).toEqual([
        {
          customer_id: 3,
          name: 'John Doe',
          city: 'City',
        },
        {
          customer_id: 2,
          name: 'John Doe',
          city: 'City',
        },
        {
          customer_id: 1,
          name: 'John Doe',
          city: 'City',
        },
      ]);
    });

    it('should set params for sorting on ID `asc`', () => {
      component.sortId.set('asc');
      expect(component.sortOnId()).toEqual([
        {
          customer_id: 1,
          name: 'John Doe',
          city: 'City',
        },
        {
          customer_id: 2,
          name: 'John Doe',
          city: 'City',
        },
        {
          customer_id: 3,
          name: 'John Doe',
          city: 'City',
        },
      ]);
    });
  });

  describe('sortOnName', () => {
    beforeEach(() => {
      component.customers.set([
        {
          customer_id: 1,
          name: 'John Doe',
          city: 'City',
        },
        {
          customer_id: 2,
          name: 'Fohn Doe',
          city: 'City',
        },
        {
          customer_id: 3,
          name: 'Gohn Doe',
          city: 'City',
        },
      ]);
    });

    it('should set params for sorting on Name `default`', () => {
      expect(component.sortOnName()).toEqual([
        {
          customer_id: 1,
          name: 'John Doe',
          city: 'City',
        },
        {
          customer_id: 3,
          name: 'Gohn Doe',
          city: 'City',
        },
        {
          customer_id: 2,
          name: 'Fohn Doe',
          city: 'City',
        },
      ]);
    });

    it('should set params for sorting on Name `asc`', () => {
      component.sortName.set('asc');
      expect(component.sortOnName()).toEqual([
        {
          customer_id: 2,
          name: 'Fohn Doe',
          city: 'City',
        },
        {
          customer_id: 3,
          name: 'Gohn Doe',
          city: 'City',
        },
        {
          customer_id: 1,
          name: 'John Doe',
          city: 'City',
        },
      ]);
    });
  });

  describe('onDestroy', () => {
    it('should clean up subscriptions', () => {
      // const subscriptionCustomersSpy = jest.spyOn(
      //   component as any,
      //   'unsubscribe'
      // );
      // const subscriptionParamsSpy = jest.spyOn(component as any, 'unsubscribe');
      // expect(subscriptionCustomersSpy).toHaveBeenCalled();
      // expect(subscriptionParamsSpy).toHaveBeenCalled();
    });
  });

  describe('onAddCustomer', () => {
    it('should call addCustomer()', () => {
      // Create spy for addCustomer().
      // this method is being called in the afterClosed of the dialogRef as provided in the useValue
      const addCustomersSpy = jest.spyOn(customersService, 'addCustomer');

      // test the current length after ngOnInit (with getCustomers)
      expect(component.customers().length).toBe(1);

      // Call method.
      component.onAddCustomer();

      // test if method in callback is being called
      expect(addCustomersSpy).toHaveBeenCalledWith(newCustomer);

      // test new length of Array
      expect(component.customers().length).toBe(2);

      // test updated signal and dataSource
      expect(component.dataSource.data);
    });

    it('should recieve server response', () => {});

    it('should update the customers array', () => {});
  });
});