export const StatsIcon = ({
  fill = "#A1A1AA",
  filled = "",
  height = "22",
  width = "22",
  label = "",
  ...props
}: {
  fill?: string;
  filled?: string;
  height?: string;
  width?: string;
  label?: string;
  [key: string]: unknown;
}) => {
  const color = filled || fill;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      aria-label={label}
      {...props}
    >
      <path
        d="M3 3V19C3 20.1046 3.89543 21 5 21H21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 14L7 17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M11 10L11 17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M15 12L15 17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M19 8L19 17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
};
