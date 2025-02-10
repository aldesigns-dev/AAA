import { Customer, CustomerInput } from "../../customers/customer.model";
import { DialogModeEnum } from "../../enums/dialog-mode.enum";

export interface DialogCustomerData {
  mode: DialogModeEnum;
  customer?: Customer;
}

export interface DialogCustomerResponse {
  customer: CustomerInput;
}