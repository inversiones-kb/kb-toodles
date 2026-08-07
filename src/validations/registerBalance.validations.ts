import * as z from "zod";
import { Employee } from "./employee.validations";
import { REGISTER_BALANCE_STATUSES } from "@/types/registerBalance.types";
import { BUSINESS_BRANCHES } from "@/types/businessBranch.types";
import { User } from "./user.validations";

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
  total_mobile_payments: z.number(),
  money: z.object({
    cop: z.object({
      cash: z.coerce.number().min(0, "El valor mínimo es 0"),
      system: z.coerce.number().min(0, "El valor mínimo es 0"),
    }),
    usd: z.object({
      cash1: z.coerce.number().min(0, "El valor mínimo es 0"),
      cash2: z.coerce.number().min(0, "El valor mínimo es 0"),
      cash3: z.coerce.number().min(0, "El valor mínimo es 0"),

      rate1: z.coerce
        .number({
          invalid_type_error: "Debe ingresar una tasa válida", // Atrapa el NaN cuando está vacío
          required_error: "Este campo es obligatorio", // Atrapa si el campo ni siquiera se envió
        })
        .min(0, "El valor mínimo es 0"),

      rate2: z.coerce
        .number({
          invalid_type_error: "Debe ingresar una tasa válida", // Atrapa el NaN cuando está vacío
          required_error: "Este campo es obligatorio", // Atrapa si el campo ni siquiera se envió
        })
        .min(0, "El valor mínimo es 0"),

      rate3: z.coerce
        .number({
          invalid_type_error: "Debe ingresar una tasa válida", // Atrapa el NaN cuando está vacío
          required_error: "Este campo es obligatorio", // Atrapa si el campo ni siquiera se envió
        })
        .min(0, "El valor mínimo es 0"),
    }),
    bs: z.object({
      pos: z.coerce.number().min(0, "El valor mínimo es 0"),
      pos_system: z.coerce.number().min(0, "El valor mínimo es 0"),
      /* batch_number: z.coerce.number().int().optional(), */

      pos_batches: z.array(
        z.object({
          batch_number: z.coerce.number().int(),
          amount: z.coerce.number().min(0, "El valor no puede ser negativo"),
        }),
      ),

      mobile: z.coerce.number().min(0, "El valor mínimo es 0"),
      mobile_system: z.coerce.number().min(0, "El valor mínimo es 0"),
    }),
  }),

  branch: z.enum(BUSINESS_BRANCHES, { message: "Sucursal inválida" }),
});

export type RegisterBalanceInput = z.input<typeof createRegisterBalanceSchema>;

export type RegisterBalance = RegisterBalanceInput & {
  id: string;
  user_id: string;
  user_snapshot: Pick<User, "name" | "last_name" | "id" | "role">;
  created_at: Date;

  open_at: Date;
  closed_at: Date;

  is_deleted: boolean;
  deleted_at: Date;
};
