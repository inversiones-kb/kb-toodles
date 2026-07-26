import { useAuthStore } from "@/app/context/AuthProvider";
import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { BusinessBranch } from "@/types/businessBranch.types";
import { generateSalesChartData } from "@/utils/stats.utils";
import { RegisterBalance } from "@/validations/registerBalance.validations";
import { Spinner } from "@heroui/react";
import { where } from "firebase/firestore";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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

const SalesChart = () => {
  const user = useAuthStore((store) => store.user);
  const branch = useParams().branch as BusinessBranch;

  const { data, isLoading } = useCollectionQuery<RegisterBalance>(
    "register_balances",
    [
      where("branch", "==", branch),
      where("status", "in", ["CHECKED", "PENDING"]),
    ],
    [user?.id],
  );

  const salesData = useMemo(() => generateSalesChartData(data), [data]);

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
    <AreaChart
      className="w-full h-full overflow-hidden"
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
        tickFormatter={(value) => `$${value / 1000}k`}
        stroke="#888888"
        fontSize={14}
        tickLine={false}
        axisLine={false}
      />

      <Tooltip content={<CustomTooltip />} />

      <Area
        type="monotone"
        dataKey="total"
        stroke="#ea2778"
        fillOpacity={1}
        fill="url(#colorSales)"
        isAnimationActive={true}
        animationBegin={200}
        animationDuration={1300}
      />

      {/* <RechartsDevtools /> */}
    </AreaChart>
  );
};

export default SalesChart;
