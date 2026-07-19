export const BUSINESS_BRANCHES = ["CASHIER", "VENDOR", "ADMIN"] as const;
export type BusinessBranch = (typeof BUSINESS_BRANCHES)[number];
export const BUSINESS_BRANCH_MAP: Record<BusinessBranch, { title: string }> = {
  CASHIER: { title: "Cajero" },
  VENDOR: { title: "Vendedor" },
  ADMIN: { title: "Administrador" },
};
export const BUSINESS_BRANCH_OPTIONS = BUSINESS_BRANCHES.map((key) => ({
  key, // Lo usaremos para el 'key' y 'value' del SelectItem
  ...BUSINESS_BRANCH_MAP[key], // Extraemos el title (y futuros iconos)
}));
