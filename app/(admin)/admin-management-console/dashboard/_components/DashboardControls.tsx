interface DashboardControlsProps {
  period: number;
  granularity: "daily" | "weekly" | "monthly";
  onPeriodChange: (period: number) => void;
  onGranularityChange: (granularity: "daily" | "weekly" | "monthly") => void;
}

export default function DashboardControls({
  period,
  granularity,
  onPeriodChange,
  onGranularityChange,
}: DashboardControlsProps) {
  const periodOptions = [
    { value: 7, label: "7日" },
    { value: 30, label: "30日" },
    { value: 90, label: "90日" },
    { value: 365, label: "1年" },
  ];

  const granularityOptions = [
    { value: "daily" as const, label: "日次" },
    { value: "weekly" as const, label: "週次" },
    { value: "monthly" as const, label: "月次" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* 期間選択 */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">期間:</label>
          <div className="flex space-x-1">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onPeriodChange(option.value)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  period === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 時間粒度選択 */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">表示単位:</label>
          <div className="flex space-x-1">
            {granularityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onGranularityChange(option.value)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  granularity === option.value
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
