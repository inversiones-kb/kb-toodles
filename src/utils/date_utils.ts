type DateFormat = "";

const monthsDict: {
  [key: number]: string;
} = {
  0: "Enero",
  1: "Febrero",
  2: "Marzo",
  3: "Abril",
  4: "Mayo",
  5: "Junio",
  6: "Julio",
  7: "Agosto",
  8: "Septiembre",
  9: "Octubre",
  10: "Noviembre",
  11: "Diciembre",
};

export function dateToString(date: Date, format?: DateFormat) {
  return `${date.getDate()} de ${
    monthsDict[date.getMonth()]
  } de ${date.getFullYear()}`;
}
