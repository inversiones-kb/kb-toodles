export const defaultCellValue = (item: any, columnKey: any) => {
  const cellValue = item[columnKey];
  if (typeof cellValue === "object" && cellValue !== null) {
    return null; // O puedes poner JSON.stringify(cellValue) si quieres ver qué falló
  }
  return cellValue; // TS ahora sabe que esto es 100% seguro para React
};
