import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import BaseChart from './BaseChart';

interface ActivityData {
  date: string;
  games: number;
  batting_records: number;
  pitching_records: number;
  total_posts: number;
}

interface ActivityChartProps {
  data: ActivityData[];
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
            {`${item.name}: ${item.value.toLocaleString()}件`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ActivityChart({
  data,
  height = 300,
  className = "",
  visibleMetrics
}: ActivityChartProps) {
  const metrics = [
    {
      key: 'games',
      name: 'ゲーム数',
      stroke: '#8B5CF6',
      fill: '#8B5CF6'
    },
    {
      key: 'batting_records',
      name: '打撃記録',
      stroke: '#06B6D4',
      fill: '#06B6D4'
    },
    {
      key: 'pitching_records',
      name: '投球記録',
      stroke: '#F97316',
      fill: '#F97316'
    },
    {
      key: 'total_posts',
      name: '総投稿数',
      stroke: '#EF4444',
      fill: '#EF4444'
    }
  ];

  const visibleAreas = metrics.filter(metric =>
    !visibleMetrics || visibleMetrics.has(metric.key)
  );

  return (
    <BaseChart height={height} className={className}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#666"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {visibleAreas.map((metric, index) => (
          <Area
            key={metric.key}
            type="monotone"
            dataKey={metric.key}
            stackId={index + 1}
            stroke={metric.stroke}
            fill={metric.fill}
            fillOpacity={0.6}
            name={metric.name}
          />
        ))}
      </AreaChart>
    </BaseChart>
  );
}
