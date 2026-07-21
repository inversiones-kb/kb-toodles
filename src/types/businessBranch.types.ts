export const BUSINESS_BRANCHES = ["la-fria", "colon"] as const;
export type BusinessBranch = (typeof BUSINESS_BRANCHES)[number];
export const BUSINESS_BRANCH_MAP: Record<BusinessBranch, { title: string }> = {
  "la-fria": { title: "La Fría" },
  colon: { title: "Colón" },
};
export const BUSINESS_BRANCH_OPTIONS = BUSINESS_BRANCHES.map((key) => ({
  key, // Lo usaremos para el 'key' y 'value' del SelectItem
  ...BUSINESS_BRANCH_MAP[key], // Extraemos el title (y futuros iconos)
}));
