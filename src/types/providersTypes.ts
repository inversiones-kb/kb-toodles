import { Icon, IconBuildingStore, IconUser } from "@tabler/icons-react";

export const PROVIDER_TYPES = ["FREELANCER", "STORE"] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];
export const PROVIDER_TYPE_MAP: Record<ProviderType, { title: string }> = {
  FREELANCER: { title: "Independiente" },
  STORE: { title: "Tienda" },
};
export const PROVIDER_TYPE_OPTIONS = PROVIDER_TYPES.map((key) => ({
  key, // Lo usaremos para el 'key' y 'value' del SelectItem
  ...PROVIDER_TYPE_MAP[key], // Extraemos el title (y futuros iconos)
}));

export const PROVIDER_COUNTRIES = ["VE", "CO"] as const;
export type ProviderCountry = (typeof PROVIDER_COUNTRIES)[number];
export const PROVIDER_COUNTRY_MAP: Record<
  ProviderCountry,
  { title: string; flagUrl: string }
> = {
  VE: { title: "Venezuela", flagUrl: "https://flagcdn.com/ve.svg" },
  CO: { title: "Colombia", flagUrl: "https://flagcdn.com/co.svg" },
};
export const PROVIDER_COUNTRY_OPTIONS = PROVIDER_COUNTRIES.map((key) => ({
  key, // Lo usaremos para el 'key' y 'value' del SelectItem
  ...PROVIDER_COUNTRY_MAP[key], // Extraemos el title (y futuros iconos)
}));
