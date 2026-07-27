import { generateCurrenySalesChartData } from "@/utils/stats.utils";
import { RegisterBalance } from "@/validations/registerBalance.validations";
import { Card, CardBody, CardHeader, Spinner, Tab, Tabs } from "@heroui/react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "../general/EmptyState";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface Props {
  data: RegisterBalance[];
  isLoading: boolean;
}

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

const CustomLegend = ({ payload }: any) => {
  return (
    <ul className="flex flex-wrap justify-center gap-2 pt-2">
      {payload.map((entry: any, index: number) => (
        <li
          key={`legend-item-${index}`}
          className="flex items-center gap-2 cursor-default"
        >
          {/* El círculo de color */}
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: entry.color }}
          />
          {/* El nombre de la moneda */}
          <span className="text-xs font-medium text-soft-light">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
};

const CurrencySalesChart = ({ data, isLoading }: Props) => {
  const [selectedCurrency, setSelectedCurrency] = useState<
    "cop" | "usd" | "bs"
  >("cop");
  const salesData = generateCurrenySalesChartData(data);

  // Configuramos el color y el formateo dependiendo de la pestaña activa
  const chartConfig = {
    usd: { color: "#ea2778aa", dataKey: "usd", prefix: "$" },
    cop: { color: "#ea2778aa", dataKey: "cop", prefix: "$" },
    bs: { color: "#ea2778aa", dataKey: "bs", prefix: "Bs " },
  };

  const activeConfig =
    chartConfig[selectedCurrency as keyof typeof chartConfig];

  if (isLoading)
    return (
      <div className="w-full justify-center h-full items-center flex">
        <Spinner label="Cargando ventas..." />
      </div>
    );

  if (!data.length) return <EmptyState title="No hay ventas para mostrar" />;

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {/* Pestañas de HeroUI */}
      <Tabs
        selectedKey={selectedCurrency}
        onSelectionChange={(key) =>
          setSelectedCurrency(key.toString() as typeof selectedCurrency)
        }
        classNames={{
          base: "w-full",
          tabList: "w-full",
        }}
      >
        <Tab key="cop" title="COP" className="flex-1" />
        <Tab key="usd" title="USD" className="flex-1" />
        <Tab key="bs" title="BS" className="flex-1" />
      </Tabs>

      <BarChart
        className="w-full h-full overflow-hidden max-sm:min-h-72"
        responsive
        data={salesData}
        layout="horizontal"
        margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#fff3" />

        <YAxis
          type="number"
          /* tickFormatter={(val) =>
            `${activeConfig.prefix}${val.toLocaleString()}`
          }
          hide */
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
        <XAxis type="category" dataKey="name" />
        <Tooltip
          /* formatter={(value: ValueType | undefined) => [
            `${activeConfig.prefix}${value?.toLocaleString()}`,
            "Monto",
          ]} */
          content={<CustomTooltip />}
          cursor={{ fill: "#fff1" }} // 🔥 Aquí está el secreto
        />
        {/* Solo renderizamos la barra de la moneda seleccionada */}
        <Bar
          dataKey={activeConfig.dataKey}
          fill={activeConfig.color}
          radius={[16, 16, 0, 0]}
          /* background={{ fillOpacity:.1 }} */
        />
      </BarChart>
    </div>
  );
};

{
  /* <BarChart
      className="w-full h-full overflow-hidden max-sm:min-h-72"
      responsive
      data={salesData}
      layout="horizontal"
      margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" />

      <YAxis
        type="number"
        tickFormatter={(value) => `$${value}`}
        tick={{ fontSize: 12 }}
      />

      <XAxis
        dataKey="name"
        type="category"
        tick={{ fontSize: 12, fontWeight: 500 }}
      />

      <Tooltip
        content={<CustomTooltip />}
        cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
      />

      <Legend content={<CustomLegend />} />

      <Bar
        dataKey="cop"
        stackId="a"
        name={"COP"}
        fill="#66A8E877"
        background={{ fill: "#f7f7f708" }}
      />
      <Bar
        dataKey="usd"
        stackId="a"
        name={"USD"}
        fill="#3D872977"
        background={{ fill: "#f7f7f708" }}
      />
      <Bar
        dataKey="bs"
        stackId="a"
        name={"BS"}
        fill="#F0B75D77"
        background={{ fill: "#f7f7f708" }}
      />
    </BarChart> */
}

export default CurrencySalesChart;
