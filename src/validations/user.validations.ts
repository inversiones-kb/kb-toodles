import { USER_ROLE_MAP } from "@/types/user.types";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Ingresa el nombre del usuario"),
  last_name: z.string().min(1, "Ingresa el apellido del usuario"),
  role: z.enum(["ADMIN", "CASHIER", "VENDOR"], {
    required_error: "El rol en la plataforma es obligatorio",
    invalid_type_error: "El rol seleccionado no es válido",
  }),
  email: z
    .string()
    .email("Ingresa un email válido")
    .min(1, "Ingresa el email de este usuario"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  employee_id: z
    .string()
    .min(1, "Debes vincular este usuario a un empleado real"),
  is_active: z.boolean().default(true),
});

export const userSchema = createUserSchema.omit({ password: true }).extend({});

// Tipo para el formulario de creación/edición de usuarios
export type UserInput = z.input<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof userSchema>;

export type User = z.infer<typeof userSchema> & {
  uid: string;
  id: string;

  created_at: Date;

  role_data: (typeof USER_ROLE_MAP)["ADMIN"];

  is_deleted: boolean;
  deleted_at: Date | null;
};
