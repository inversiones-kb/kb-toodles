import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido").min(1, "Ingresa tu email"),
  password: z
    .string()
    .min(1, "Ingresa tu contraseña")
    .min(6, "Al menos 6 caracteres"),
});

export type LoginInput = z.input<typeof loginSchema>;
