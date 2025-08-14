"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  time: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind: number;
}

export interface WeatherChartProps {
  data: ChartData[];
  dataKey: keyof ChartData;
  name: string;
  stroke: string;
  unit?: string;
}

export default function WeatherChart({
  data,
  dataKey,
  name,
  stroke,
  unit = "",
}: WeatherChartProps) {
  return (
    <div className="bg-white/60 p-4 rounded-2xl">
      <ResponsiveContainer
        style={{ marginLeft: "-30px", marginBottom: "-16px" }}
        width="100%"
        height={280}
      >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff50" />
          <XAxis
            tickMargin={5}
            dataKey="time"
            stroke="#000"
            orientation="bottom"
          />
          <YAxis tickMargin={5} stroke="#000" orientation="left" />
          <Tooltip
            formatter={(value: number) => `${value} ${unit}`}
            contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
          />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={stroke} name={name} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
