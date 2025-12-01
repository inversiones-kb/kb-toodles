import { Icon, IconBuildingStore, IconUser } from "@tabler/icons-react";

export interface Country {
  label: string;
  code: string;
  flagUrl: string;
}
export type ProviderType = "FREELANCER" | "STORE";

export const availableCountries: Country[] = [
  { label: "Colombia", code: "COL", flagUrl: "https://flagcdn.com/co.svg" },
  { label: "Venezuela", code: "VEN", flagUrl: "https://flagcdn.com/ve.svg" },
];

export function getProviderTypeData(type: ProviderType): {
  label: string;
  icon: Icon;
} {
  switch (type) {
    case "FREELANCER":
      return { label: "Freelancer", icon: IconUser };
    case "STORE":
      return { label: "Tienda", icon: IconBuildingStore };
  }
}

export interface Provider {
  id: string;
  name: string;
  country: Country;
  description?: string;
  type: ProviderType;
  created_at: Date;
}

export interface NewProviderFields
  extends Omit<Provider, "id" | "created_at" | "country"> {
  country: string;
}
