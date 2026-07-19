export const USER_ROLES = ["CASHIER", "VENDOR", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const USER_ROLE_MAP: Record<UserRole, { title: string }> = {
  CASHIER: { title: "Cajero" },
  VENDOR: { title: "Vendedor" },
  ADMIN: { title: "Administrador" },
};
export const USER_ROLE_OPTIONS = USER_ROLES.map((key) => ({
  key, // Lo usaremos para el 'key' y 'value' del SelectItem
  ...USER_ROLE_MAP[key], // Extraemos el title (y futuros iconos)
}));

export interface UserDocument {
  role: UserRole;
  employee_id: string; // Llave foránea (Foreign Key) hacia la colección 'employees'
  isActive: boolean; // Interruptor de acceso inmediato
  createdAt: string; // Fecha de creación del usuario en el sistema
  updatedAt: string; // Fecha de la última modificación (ej: cambio de rol)
}
