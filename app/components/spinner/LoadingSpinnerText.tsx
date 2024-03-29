import { Spinner } from "@nextui-org/react";

export default function LoadingSpinnerText({
  spinnerText,
}: {
  spinnerText: string;
}) {
  return (
    <div className="buzz-dark">
      <div className="fixed top-0 left-0 w-full h-full bg-main z-60 opacity-70"></div>
      <Spinner
        label={spinnerText}
        labelColor="primary"
        color="primary"
        className="fixed 0 top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 z-70 opacity-100"
      />
    </div>
  );
}
