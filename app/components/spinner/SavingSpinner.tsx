import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";

export default function SaveSpinner({ saved }: { saved: boolean }) {
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setTimedOut(true), 1500);
    return () => {
      clearTimeout(timer);
      setTimedOut(false);
    };
  }, [saved]);
  const showSpinner = saved && !timedOut;
  return (
    <>
      {showSpinner ? (
        <>
          <div className="fixed top-0 left-0 w-full h-full bg-zinc-800 z-60 opacity-70 lg:z-100"></div>
          <Spinner
            label="保存中..."
            labelColor="primary"
            color="primary"
            className="fixed 0 top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 z-70 opacity-100"
          />
        </>
      ) : null}
    </>
  );
}
