export interface Breakdown {
  breakdown_id: number;
  customer_id: number;
  car_model: string;
  license_number: string;
  moment_of_breakdown: string;
  description: string;
}

export interface BreakdownInput {
  car_model: string;
  license_number: string;
  moment_of_breakdown: string;
  description: string;
}