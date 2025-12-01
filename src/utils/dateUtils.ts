import { DateFormatter } from "@internationalized/date";

type DateFormat = "DD/MM/YYYY" | "YYYY-MM-DD";

export const MONTHS_DICT: {
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

export function dateToString(date?: Date, format?: DateFormat) {
  if (!date) return "NO_DATE";

  switch (format) {
    case "DD/MM/YYYY":
      return new DateFormatter("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);

    case "YYYY-MM-DD":
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "00")}-${date.getDate().toString().padStart(2, "00")}`;

    default:
      return `${date.getDate()} de ${
        MONTHS_DICT[date.getMonth()]
      } de ${date.getFullYear()}`;
  }
}
