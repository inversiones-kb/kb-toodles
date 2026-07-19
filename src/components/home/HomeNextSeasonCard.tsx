import { getNextSeason, getTimeRemaining } from "@/utils/dateUtils";
import { useMemo } from "react";

export default function HomeNextSeasonCard() {
  // Ejecutamos la lógica en un useMemo para que no recalcule en cada re-render
  const { upcoming, remaining, formattedDate } = useMemo(() => {
    const next = getNextSeason();
    const time = getTimeRemaining(next.date);

    // Formateador nativo para "Mayo del 2025" (Primera letra mayúscula)
    const formatter = new Intl.DateTimeFormat("es-VE", {
      month: "long",
      year: "numeric",
    });
    const rawDate = formatter.format(next.date);
    const capitalizedDate =
      rawDate.charAt(0).toUpperCase() +
      rawDate.slice(1).replace(" de ", " del ");

    return {
      upcoming: next,
      remaining: time,
      formattedDate: capitalizedDate,
    };
  }, []);

  const { season } = upcoming;
  const IconComponent = season.icon;

  return (
    <div className="flex gap-2.5 h-full w-full">
      <div className="h-full aspect-auto bg-layer-3 rounded-2xl p-3 flex justify-center items-center">
        <IconComponent size={40} className="text-brand-primary" />
      </div>
      <div className="flex-1 bg-layer-3 rounded-2xl flex flex-col items-start gap-2 p-3 justify-center">
        <div className="flex flex-col items-start">
          <h4 className="text-lg font-bold text-brand-primary">
            {season.title}
          </h4>
          <p className="text-soft-light font-semibold text-xs">
            {" "}
            {formattedDate}
          </p>
        </div>
        <p className="text-light text-sm">
          Faltan {remaining.months > 0 ? `${remaining.months} meses y ` : ""}
          {remaining.days} {remaining.days === 1 ? "día" : "días"}
        </p>
      </div>
    </div>

    /*  <div className="bg-default-50/50 p-4 rounded-2xl border border-default-200 shadow-sm max-w-sm flex flex-col gap-4">

      <div className="bg-default-200/50 text-default-700 text-xs font-semibold px-3 py-1 rounded-full w-fit">
        Siguiente temporada
      </div>

      <div className="flex items-center gap-4">

        <div className="bg-default-100 p-4 rounded-xl flex items-center justify-center shrink-0 h-20 w-16">
          <IconComponent className={`w-8 h-8 ${season.themeColor}`} />
        </div>


        <div className="flex flex-col">
          <h3 className={`text-xl font-bold ${season.themeColor}`}>
            {season.title}
          </h3>
          <p className="text-default-500 font-medium text-sm mt-0.5">
            {formattedDate}
          </p>
          <p className="text-default-800 font-bold text-sm mt-1.5">
            Faltan {remaining.months > 0 ? `${remaining.months} meses y ` : ""}
            {remaining.days} {remaining.days === 1 ? "día" : "días"}
          </p>
        </div>
      </div>
    </div> */
  );
}
