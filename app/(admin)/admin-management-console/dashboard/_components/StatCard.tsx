interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({
  title,
  value,
  description,
  trend,
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-gray-600";

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
          </div>
        </div>
        <div className="mt-1">
          <div className="text-sm font-medium text-gray-500">{title}</div>
          {description && (
            <div className={`text-sm ${trendColor}`}>{description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
