import { DateValue } from "@internationalized/date";

import { CustomFile } from "./firebase.types";
import { UserRole } from "./user.types";

export interface EmployeePayment {
  amount: number;
  created_at: Date;
  receipt: CustomFile;
}

export const EMPLOYEE_STATUSES = ["ACTIVE", "SUSPENDED", "TERMINATED"] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];
export const EMPLOYEE_STATUS_MAP: Record<EmployeeStatus, { title: string }> = {
  ACTIVE: { title: "Activo" },
  SUSPENDED: { title: "Suspendido" },
  TERMINATED: { title: "Terminado" },
};
export const EMPLOYEE_STATUS_OPTIONS = EMPLOYEE_STATUSES.map((key) => ({
  key, // Lo usaremos para el 'key' y 'value' del SelectItem
  ...EMPLOYEE_STATUS_MAP[key], // Extraemos el title (y futuros iconos)
}));

export const SHIFTS = ["MORNING", "AFTERNOON", "FULL"] as const;
export type Shift = (typeof SHIFTS)[number];
export const SHIFT_MAP: Record<Shift, { title: string }> = {
  MORNING: { title: "Mañana" },
  AFTERNOON: { title: "Tarde" },
  FULL: { title: "Completo" },
};
export const SHIFT_OPTIONS = SHIFTS.map((key) => ({
  key, // Lo usaremos para el 'key' y 'value' del SelectItem
  ...SHIFT_MAP[key], // Extraemos el title (y futuros iconos)
}));

export type WEEK_DAY =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface NewEmployee {
  name: string;
  last_name: string;
  role: UserRole;
  photo: string;
  files: CustomFile[]; // CV, initial contract, etc
  salary: number;
  doc_type: "V" | "J" | "E";
  doc_number: number;
  birthdate?: DateValue | null;
  hired_at?: DateValue | null; // Convenient field to store the hired date of an employee
}

export interface Employee extends NewEmployee {
  id: string;
  created_at: Date;
  free_day: WEEK_DAY;
  active: boolean; // This employee is currently working or not
  payments: EmployeePayment[]; // All payments employee receive
}
