import * as z from "zod";
import { getLocalTimeZone, DateValue } from "@internationalized/date";

export const customDateSchema = z.custom<DateValue>().transform((val: any) => {
  // Si viene directamente de HeroUI con el método integrado:
  if (val && typeof val.toDate === "function") {
    return val.toDate(getLocalTimeZone()) as Date;
  }
  // Caída segura por si es un objeto plano {year, month, day}
  return new Date(val.year, val.month - 1, val.day);
});

export const fileSchema = z.object({
  url: z.string(),
  name: z.string(),
  ref: z.string(),
  created_at: z.string(),
});

export type CustomFile = z.infer<typeof fileSchema>;
