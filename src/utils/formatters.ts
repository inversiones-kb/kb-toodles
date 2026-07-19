export const moneyFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "decimal",
});

export const numberFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
  style: "decimal",
});
