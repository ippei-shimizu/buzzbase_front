interface MetricToggleProps {
  title: string;
  metrics: { key: string; label: string; color: string }[];
  visibleMetrics: Set<string>;
  onToggle: (key: string) => void;
}

export default function MetricToggle({
  title,
  metrics,
  visibleMetrics,
  onToggle,
}: MetricToggleProps) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => onToggle(metric.key)}
            className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-full transition-all ${
              visibleMetrics.has(metric.key)
                ? "bg-gray-100 border-2"
                : "bg-gray-50 border-2 border-transparent opacity-50"
            }`}
            style={{
              borderColor: visibleMetrics.has(metric.key)
                ? metric.color
                : "transparent",
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.color }}
            />
            <span className="text-gray-700">{metric.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
