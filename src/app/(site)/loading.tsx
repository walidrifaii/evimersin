export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="relative min-h-[55vh] animate-pulse bg-[#1b2a4a]" />
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-12 sm:px-6">
        <div className="h-8 w-56 animate-pulse rounded bg-[#e8eef6]" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl bg-[#eef2f7]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
