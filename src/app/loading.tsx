export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-[#dbe3ef]" />
        <div className="mx-auto h-3 w-40 animate-pulse rounded bg-[#e8eef6]" />
        <div className="mx-auto h-3 w-28 animate-pulse rounded bg-[#eef2f7]" />
      </div>
    </div>
  );
}
