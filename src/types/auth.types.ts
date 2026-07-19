import { User, UserInput } from "@/validations/user.validations";
import { UserRole } from "./user.types";

// La interfaz unificada que consumirá Zustand
export type CurrentUser = User & {
  uid: string; // ID de Firebase Auth y del doc en 'users'
  email: string | null;
};
