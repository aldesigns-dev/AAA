import { Breakdown, BreakdownInput } from "../../breakdowns/breakdown.model";
import { DialogModeEnum } from "../../enums/dialog-mode.enum";

export interface DialogBreakdownData {
  mode: DialogModeEnum;
  breakdown: Breakdown;
  customers: { customer_id: number; name: string }[];
}

export interface DialogBreakdownResponse {
  breakdown: BreakdownInput;
}