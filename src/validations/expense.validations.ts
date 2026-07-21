import { BUSINESS_BRANCHES } from "@/types/businessBranch.types";
import * as z from "zod";

export const createExpenseSchema = z.object({
  amount: z.coerce.number().min(1, "El valor mínimo es 1"),
  currency: z.enum(["COP", "USD", "BS"]),
  description: z.string(),

  // 2. Llaves Foráneas (Foreign Keys) obligatorias
  checkout_number: z.coerce.number().int(),
  shift_id: z.string().min(1, "Turno inválido"),

  branch: z.enum(BUSINESS_BRANCHES, { message: "Sucursal inválida" }),
});

export type ExpenseInput = z.infer<typeof createExpenseSchema>;
export type Expense = ExpenseInput & {
  user_id: string;
  id: string;

  is_deleted: boolean;
  deleted_at: Date;
  created_at: Date;
};

export type ExpenseProxy = Pick<Expense, "description" | "amount"> & {
  id: number;
};
