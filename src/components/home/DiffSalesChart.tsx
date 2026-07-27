import { useAuthStore } from "@/app/context/AuthProvider";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { BusinessBranch } from "@/types/businessBranch.types";
import {
  generateDiffSalesChartData,
  generateSalesChartData,
} from "@/utils/stats.utils";
import { RegisterBalance } from "@/validations/registerBalance.validations";
import { Spinner } from "@heroui/react";
import { where } from "firebase/firestore";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Rectangle,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "../general/EmptyState";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-default-50 border border-default-200 p-3 rounded-lg shadow-md">
        <p className="text-default-500 text-sm mb-1">{label}</p>
        <p className="text-primary font-bold text-lg">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

interface Props {
  isLoading: boolean;
  data: RegisterBalance[];
}

const DiffSalesChart = ({ isLoading, data }: Props) => {
  const salesData = useMemo(
    () =>
      generateDiffSalesChartData(data.filter((e) => e.status === "CHECKED")),
    [data],
  );
  /* 
  const salesData = [
    {
      name: "24 jul",
      cop_diff: 10000,
    },
    {
      name: "25 jul",
      cop_diff: -5000,
    },
    {
      name: "26 jul",
      cop_diff: 2300,
    },
  ]; */

  if (isLoading)
    return (
      <div className="w-full justify-center h-full items-center flex">
        <Spinner label="Cargando ventas..." />
      </div>
    );

  if (!data.length) return <EmptyState title="No hay ventas para mostrar" />;

  /*
   <ResponsiveContainer width={"100%"} height={"100%"}>
        </ResponsiveContainer>
  */

  return (
    <BarChart
      className="w-full h-full overflow-hidden max-sm:min-h-72"
      responsive
      data={salesData}
      margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
    >
      <defs>
        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#ea2778" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#ea2778" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" strokeWidth={0.2} />

      <XAxis dataKey="name" fontSize={14} tickLine={false} axisLine={false} />
      <YAxis
        width="auto"
        tickFormatter={(value) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact", // 🔥 Esto hace la magia de poner K o M
            maximumFractionDigits: 1,
          }).format(value)
        }
        stroke="#888888"
        fontSize={14}
        tickLine={false}
        axisLine={false}
      />

      <Tooltip
        content={<CustomTooltip />}
        cursor={{ fill: "#fff1" }} // 🔥 Aquí está el secreto
      />

      <ReferenceLine y={0} stroke="#71717a" strokeWidth={2} />

      <Bar
        dataKey="cop_diff"
        /* fill="#ea2778aa" */
        /* fillOpacity={1}
        fill="url(#colorSales)" */

        shape={(props: any) => {
          const { cop_diff } = props.payload; // Accedemos a los datos de esta barra

          // 3. Evaluamos el color
          let fillColor = "#ffffff32"; // Gris por defecto (0)

          if (cop_diff <= 0)
            fillColor = "#ed5c5caa"; // Rojo (faltante)
          else if (cop_diff >= 0) fillColor = "#17c964aa"; // Verde (sobrante)

          // 4. Retornamos el componente Rectangle de Recharts
          return (
            <Rectangle
              {...props} // Pasamos todas las coordenadas y medidas (x, y, width, height)
              fill={fillColor}
              radius={[16, 16, 0, 0]} // Mantenemos los bordes redondeados aquí
            />
          );
        }}
        /* shape={(entry: any) => {
          // entry contiene los datos de la barra actual ({ day: '21 Jul', cop_diff: -150000 })
          if (entry.cop_diff < 0) return "#f31260"; // Rojo para faltantes
          if (entry.cop_diff > 0) return "#17c964"; // Verde para sobrantes
          return "#d4d4d8"; // Gris para 0
        }} */
      />
      {/* 
      <Area
        type="monotone"
        dataKey="total"
        stroke="#ea2778"
        fillOpacity={1}
        fill="url(#colorSales)"
        isAnimationActive={true}
        animationBegin={200}
        animationDuration={1300}
      /> */}

      {/* <RechartsDevtools /> */}
    </BarChart>
  );
};

export default DiffSalesChart;
