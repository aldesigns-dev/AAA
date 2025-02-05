import { inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, tap } from "rxjs";

import { Breakdown } from "./breakdown.model";

@Injectable({
  providedIn: 'root'
})
export class BreakdownsService {
  private httpClient = inject(HttpClient);
  private breakdowns = signal<Breakdown[]>([]);

  getBreakdowns() {
    return this.httpClient.get<{ breakdowns: Breakdown[] }>('http://localhost:3000/breakdowns')
      .pipe(
        map(response => response.breakdowns)
      );
  }

  addBreakdown(breakdownData: {moment_of_breakdown: Date, description: string, breakdown_id: number}) {
    const newBreakdown = {
      ...breakdownData,
    };
    console.log('Data verzonden naar server:', newBreakdown);
    return this.httpClient.post<{ breakdown: Breakdown }>('http://localhost:3000/breakdowns', newBreakdown)
      .pipe(
        tap({
          next: (response) => {
            console.log('Response van server:', response);
            const newBreakdowns = response.breakdown;
            this.breakdowns.update((oldBreakdowns) => [...oldBreakdowns, newBreakdowns]);
          },
          error: (err) => {
            console.error('Error while adding customer:', err);
          }
        })
      );
  }

  updateBreakdown(breakdownId: number, updatedData: { moment_of_breakdown: string, description: string }) {
    return this.httpClient.put<Breakdown>(`http://localhost:3000/breakdowns/${breakdownId}`, updatedData)
      .pipe(
        tap((updatedBreakdown) => {
          this.breakdowns.update((oldBreakdowns) =>
            oldBreakdowns.map((breakdown) =>
              breakdown.breakdown_id === breakdownId
                ? { ...breakdown, ...updatedBreakdown }
                : breakdown
            )
          );
        })
      );
  }

  deleteBreakdown(breakdownId: number) {
    return this.httpClient.delete(`http://localhost:3000/breakdowns/${breakdownId}`)
      .pipe(
        tap(() => {
          this.breakdowns.update((oldBreakdowns) => 
            oldBreakdowns.filter(breakdown => breakdown.breakdown_id !== breakdownId)
          );
        })
      );
  }

  deleteBreakdownsByCustomerId(customerId: number) {
    return this.httpClient.delete(`http://localhost:3000/breakdowns?customer_id=${customerId}`)
  }
}