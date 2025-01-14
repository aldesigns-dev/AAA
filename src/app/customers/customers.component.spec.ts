import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CustomersComponent } from './customers.component';
import { CustomersService } from './customers.service';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: CustomersService,
          useValue: {
            getCustomers: () =>
              of([
                {
                  customer_id: 1,
                  name: 'John Doe',
                  city: 'City',
                },
              ]),
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
    it('should fetch customers', () => {
      component.ngOnInit();
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
      // expect(component.sortOnId()[0].name).toBe(3);
      // expect(component.sortOnId()[1].name).toBe(2);
      // expect(component.sortOnId()[2].name).toBe(1);
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
      const subscriptionCustomersSpy = jest.spyOn(component as any, 'unsubscribe');
      const subscriptionParamsSpy = jest.spyOn(component as any, 'unsubscribe');

      expect(subscriptionCustomersSpy).toHaveBeenCalled();
      expect(subscriptionParamsSpy).toHaveBeenCalled();
      });
  });
});