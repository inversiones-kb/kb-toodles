import { RegisterBalance } from "@/validations/registerBalance.validations";

export const generateSalesChartData = (balances: RegisterBalance[]) => {
  // 2. Agrupamos y sumamos por día usando reduce
  const groupedData = balances.reduce(
    (acc, balance) => {
      const dateObj = new Date(balance.created_at);

      // Formateamos la fecha a algo amigable para el eje X (ej. "21 jul")
      const dayLabel = new Intl.DateTimeFormat("es-VE", {
        day: "2-digit",
        month: "short",
      }).format(dateObj);

      // Si el día no existe en el acumulador, lo inicializamos en 0
      if (!acc[dayLabel]) {
        acc[dayLabel] = 0;
      }

      // Sumamos el total del registro al día correspondiente

      const usd1 = balance.money.usd.cash1 * balance.money.usd.rate1;
      const usd2 = balance.money.usd.cash2 * balance.money.usd.rate2;

      const total =
        balance.money.cop.cash + balance.total_expenses + usd1 + usd2;

      acc[dayLabel] += total;

      return acc;
    },
    {} as Record<string, number>,
  );

  // 3. Convertimos el objeto agrupado en el array que Recharts exige
  const chartData = Object.entries(groupedData).map(([name, total]) => ({
    name,
    total,
  }));

  // Opcional pero recomendado: Asegurar que el array esté ordenado cronológicamente
  // (Asumiendo que los datos de entrada ya venían ordenados de la DB,
  // Object.entries a veces no garantiza el orden estricto de inserción en strings)
  return chartData;
};
