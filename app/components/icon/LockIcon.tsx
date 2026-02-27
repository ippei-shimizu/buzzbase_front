export const LockIcon = ({
  fill = "",
  height = "16",
  width = "16",
  ...props
}: {
  fill?: string;
  height?: string;
  width?: string;
  className?: string;
}) => {
  return (
    <svg
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18 10h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v4H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v4z"
        fill={fill}
      />
    </svg>
  );
};
