import * as z from "zod";
import { customDateSchema, fileSchema } from "./firebase.validations";
import { USER_ROLE_MAP, USER_ROLES } from "@/types/user.types";
import { createFileSchema } from "./file.validations";
import { FileMetadata } from "@/types/file.types";
import { SHIFT_MAP, SHIFTS } from "@/types/employee.types";

export const createEmployeeSchema = z.object({
  cv_attachment: createFileSchema(5, ["application/pdf"]), // Máximo 5MB, solo PDF
  rif_attachment: createFileSchema(5, ["application/pdf"]), // Máximo 5MB, solo PDF

  name: z.string().min(1, "Campo obligatorio"),
  last_name: z.string().min(1, "Campo obligatorio"),
  email: z.string().email("Correo inválido"),
  shift: z.enum(SHIFTS, { message: "Turno inválido" }),
  address: z.string().min(1, "Dirección inválida"),
  role: z.enum(USER_ROLES, { message: "Rol inválido" }),
  salary: z.coerce.number().min(1, "El mínimo es 1"),
  doc_type: z.enum(["V", "J", "E"]),
  doc_number: z.coerce.number().min(1, "Número de documento inválido"),
  birthdate: customDateSchema,
  hired_at: customDateSchema,
});

export const employeeSchema = createEmployeeSchema.extend({
  photo: z.string(),
  files: z.array(fileSchema), // CustomFile[]
  payments: z.array(
    z.object({
      amount: z.number(),
      created_at: z.date(),
      receipt: z.object({
        url: z.string(),
        name: z.string(),
        ref: z.string(),
        created_at: z.string(),
      }),
    }),
  ), // EmployeePayment[]

  created_at: z.date(),
});

export type EmployeeInput = z.input<typeof createEmployeeSchema>;
export type EmployeeOutput = z.output<typeof createEmployeeSchema>;

export type Employee = z.infer<typeof employeeSchema> & {
  id: string;

  role_data: (typeof USER_ROLE_MAP)["ADMIN"];
  shift_data: (typeof SHIFT_MAP)["AFTERNOON"];

  is_deleted: boolean;
  deleted_at: Date;

  cv_attachment: FileMetadata;
  rif_attachment: FileMetadata;
};
