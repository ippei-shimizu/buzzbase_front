export const CopyIcon = ({
  width = "18",
  height = "18",
  fill = "none",
  stroke = "",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill={fill}
    >
      <rect
        x="6.375"
        y="6.375"
        width="9.75"
        height="9.75"
        rx="2"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.375 11.625H2.625C2.21079 11.625 1.875 11.2892 1.875 10.875V2.625C1.875 2.21079 2.21079 1.875 2.625 1.875H10.875C11.2892 1.875 11.625 2.21079 11.625 2.625V3.375"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
