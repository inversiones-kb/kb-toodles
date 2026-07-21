import { data } from "framer-motion/client";
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SalesChart = () => {
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

  const data = [
    { name: "Jan", sales: 4000, profit: 2400 },
    { name: "Feb", sales: 3000, profit: 1398 },
    { name: "Mar", sales: 2000, profit: 9800 },
    { name: "Apr", sales: 2780, profit: 3908 },
    { name: "May", sales: 1890, profit: 4800 },
    { name: "Jun", sales: 2390, profit: 3800 },
  ];

  /*
   <ResponsiveContainer width={"100%"} height={"100%"}>
        </ResponsiveContainer>
  */

  return (
    <AreaChart
      className="w-full h-full overflow-hidden"
      responsive
      data={data}
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
        dataKey="sales"
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
