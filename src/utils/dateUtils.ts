import { DateFormatter } from "@internationalized/date";
import { VENEZUELA_RETAIL_SEASONS } from "@/data/retailSeasonsData"; // Ajusta el import a tu archivo
import { RetailSeason } from "@/types/retailSeason.types";

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

/**
 * Formatea un string ISO 8601 a una fecha y hora legible (Ej: "09 jul. 2026, 08:15 a. m.").
 * Ideal para los encabezados de los reportes de turno.
 */
export const formatShiftDateTime = (date: Date | null | undefined): string => {
  // Si la caja sigue abierta, el closed_at será null. Este fallback mejora la UX.
  if (!date) return "En curso...";

  try {
    return new Intl.DateTimeFormat("es-VE", {
      timeZone: "America/Caracas",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Formato 12 horas (AM/PM) es más intuitivo para el personal de caja
    }).format(date);
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "Fecha inválida";
  }
};

/**
 * Extrae únicamente la hora de un string ISO (Ej: "08:15 a. m.").
 * Perfecto para la tabla dinámica de gastos, donde la fecha ya está implícita en el turno.
 */
export const formatOnlyTime = (date: Date | null | undefined): string => {
  if (!date) return "--:--";

  try {
    return new Intl.DateTimeFormat("es-VE", {
      timeZone: "America/Caracas",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (error) {
    return "--:--";
  }
};

/**
 * Calcula la fecha exacta del N-ésimo día de la semana en un mes.
 * Ej: El 2do (weekPosition) Domingo (dayOfWeek=0) de Mayo (month=5)
 */
const getNthDayOfMonth = (
  year: number,
  month: number,
  dayOfWeek: number,
  weekPosition: number,
): Date => {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Lunes...

  let daysToAdd = (dayOfWeek - firstDayOfWeek + 7) % 7;
  daysToAdd += (weekPosition - 1) * 7;

  return new Date(year, month - 1, 1 + daysToAdd);
};

/**
 * Retorna la temporada más próxima en el calendario.
 */
export const getNextSeason = (): { season: RetailSeason; date: Date } => {
  const now = new Date();
  const currentYear = now.getFullYear();

  const upcomingSeasons = VENEZUELA_RETAIL_SEASONS.map((season) => {
    let seasonDate: Date;

    // Calculamos la fecha según el tipo de temporada
    if (
      season.type === "relative" &&
      season.weekPosition !== undefined &&
      season.dayOfWeek !== undefined
    ) {
      seasonDate = getNthDayOfMonth(
        currentYear,
        season.month,
        season.dayOfWeek,
        season.weekPosition,
      );
    } else {
      // fixed o month-long
      seasonDate = new Date(currentYear, season.month - 1, season.day || 1);
    }

    // Si la fecha ya pasó este año, la calculamos para el año que viene
    // Seteamos la hora al final del día para no descartar el evento si es hoy
    seasonDate.setHours(23, 59, 59, 999);

    if (seasonDate.getTime() < now.getTime()) {
      if (
        season.type === "relative" &&
        season.weekPosition !== undefined &&
        season.dayOfWeek !== undefined
      ) {
        seasonDate = getNthDayOfMonth(
          currentYear + 1,
          season.month,
          season.dayOfWeek,
          season.weekPosition,
        );
      } else {
        seasonDate = new Date(
          currentYear + 1,
          season.month - 1,
          season.day || 1,
        );
      }
    }

    return { season, date: seasonDate };
  });

  // Ordenamos de la más cercana a la más lejana temporalmente
  upcomingSeasons.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Retornamos la primera (la más próxima)
  return upcomingSeasons[0];
};

/**
 * Calcula la diferencia exacta en meses y días entre hoy y una fecha futura
 */
export const getTimeRemaining = (
  targetDate: Date,
): { months: number; days: number } => {
  const now = new Date();

  let months =
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
    targetDate.getMonth() -
    now.getMonth();
  let targetDay = targetDate.getDate();
  let currentDay = now.getDate();

  if (currentDay > targetDay) {
    months--;
    // Obtenemos los días que tuvo el mes anterior para hacer el cálculo exacto
    const prevMonthDays = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      0,
    ).getDate();
    targetDay += prevMonthDays;
  }

  const days = targetDay - currentDay;
  return { months, days };
};
