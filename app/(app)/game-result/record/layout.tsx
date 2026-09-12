export default function RecordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="buzz-dark bg-main flex flex-col w-full min-h-screen">
        {children}
      </div>
    </>
  );
}
