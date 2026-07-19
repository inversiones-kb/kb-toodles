import {
  PROVIDER_COUNTRIES,
  PROVIDER_COUNTRY_MAP,
  PROVIDER_TYPE_MAP,
  PROVIDER_TYPES,
} from "@/types/providersTypes";
import * as z from "zod";

export const createProviderSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 3 caracteres" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  country: z.enum(PROVIDER_COUNTRIES, { message: "País inválido" }),
  type: z.enum(PROVIDER_TYPES, { message: "Tipo inválido" }),
});

export type ProviderInput = z.input<typeof createProviderSchema>;
export type ProviderOutput = z.output<typeof createProviderSchema>;

export type Provider = ProviderOutput & {
  id: string;

  country_data: (typeof PROVIDER_COUNTRY_MAP)["VE"];

  type_data: (typeof PROVIDER_TYPE_MAP)["FREELANCER"];

  created_at: Date;

  is_deleted: boolean;
  deleted_at: Date;
};
