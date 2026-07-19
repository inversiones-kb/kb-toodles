import { Icon } from "@tabler/icons-react";

// Tipos para definir si la fecha es exacta (ej. 14 de Feb) o móvil (ej. 2do Domingo)
export type SeasonType = "fixed" | "relative" | "month-long";

export interface RetailSeason {
  id: string;
  title: string;
  type: SeasonType;
  month: number; // 1 (Enero) a 12 (Diciembre)
  day?: number; // Obligatorio si es 'fixed'
  weekPosition?: number; // 1, 2, 3... (Ej: 2 para el segundo domingo)
  dayOfWeek?: number; // 0 (Domingo) a 6 (Sábado).
  icon: Icon; // Referencia para tu librería de íconos (ej. Lucide)
  themeColor: string; // Color para la interfaz (Tailwind o Hex)
}
