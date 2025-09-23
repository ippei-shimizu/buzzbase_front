import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import BaseChart from "./BaseChart";

interface UserGrowthData {
  date: string;
  new_users: number;
  total_users: number;
  active_users: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData[];
  height?: number;
  className?: string;
  visibleMetrics?: Set<string>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{`日付: ${label}`}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: item.color }}>
            {`${item.name}: ${item.value.toLocaleString()}人`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function UserGrowthChart({
  data,
  height = 300,
  className = "",
  visibleMetrics,
}: UserGrowthChartProps) {
  const metrics = [
    {
      key: "total_users",
      name: "総ユーザー数",
      stroke: "#10B981",
      fill: "#10B981",
    },
    {
      key: "active_users",
      name: "アクティブユーザー",
      stroke: "#F59E0B",
      fill: "#F59E0B",
    },
    {
      key: "new_users",
      name: "新規登録",
      stroke: "#3B82F6",
      fill: "#3B82F6",
    },
  ];

  const visibleLines = metrics.filter(
    (metric) => !visibleMetrics || visibleMetrics.has(metric.key)
  );

  return (
    <BaseChart height={height} className={className}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#666" />
        <YAxis tick={{ fontSize: 12 }} stroke="#666" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {visibleLines.map((metric) => (
          <Line
            key={metric.key}
            type="monotone"
            dataKey={metric.key}
            stroke={metric.stroke}
            strokeWidth={2}
            name={metric.name}
            dot={{ fill: metric.fill, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </BaseChart>
  );
}
