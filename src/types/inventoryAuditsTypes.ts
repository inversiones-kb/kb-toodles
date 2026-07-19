import { DateValue } from "@internationalized/date";

export interface InventoryAuditItem {
  code: string;
  description: string;
  system_amount: number;
  real_amount: number;
}

export interface InventoryAudit {
  id: string;
  date: Date;
  items: InventoryAuditItem[];
}

export interface NewInventoryAuditFields extends Omit<
  InventoryAudit,
  "id" | "date"
> {
  date: DateValue;
}
