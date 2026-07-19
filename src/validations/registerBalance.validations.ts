import * as z from "zod";
import { Employee } from "./employee.validations";
import { REGISTER_BALANCE_STATUSES } from "@/types/registerBalance.types";

/* 
? NOTA:
Añadir pago movil a todas las cajas
Añadir a las cajas fiscales bs, numero lote, bs sistema
*/

export const createRegisterBalanceSchema = z.object({
  checkout_number: z.coerce.number().int(),
  is_fiscal: z.boolean(),
  status: z.enum(REGISTER_BALANCE_STATUSES, { message: "Estado inválida" }),
  z_report_number: z.coerce.number().optional(),
  total_expenses: z.number(),
  money: z.object({
    cop: z.object({
      cash: z.coerce.number().min(0, "El valor mínimo es 0"),
      system: z.coerce.number().min(0, "El valor mínimo es 0"),
    }),
    usd: z.object({
      cash1: z.coerce.number().min(0, "El valor mínimo es 0"),
      cash2: z.coerce.number().min(0, "El valor mínimo es 0"),
      rate1: z.coerce.number().min(1, "El valor mínimo es 1"),
      rate2: z.coerce.number().min(1, "El valor mínimo es 1"),
    }),
    bs: z
      .object({
        pos: z.coerce.number().min(0, "El valor mínimo es 0"),
        pos_system: z.coerce.number().min(0, "El valor mínimo es 0"),
        batch_number: z.coerce.number().min(1, "El valor mínimo es 1").int(),

        mobile: z.coerce.number().min(0, "El valor mínimo es 0"),
        mobile_system: z.coerce.number().min(0, "El valor mínimo es 0"),
      })
      .optional(),
  }),
});

export type RegisterBalanceInput = z.input<typeof createRegisterBalanceSchema>;

export type RegisterBalance = RegisterBalanceInput & {
  id: string;
  user_id: string;
  employee_snapshot: Pick<Employee, "name" | "last_name" | "id" | "role">;
  created_at: Date;

  open_at: Date;
  closed_at: Date;

  is_deleted: boolean;
  deleted_at: Date;
};
