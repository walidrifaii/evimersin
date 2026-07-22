export default function Loading() {
  return (
    <div className="mx-auto w-full px-4 py-16 sm:px-6 lg:px-[100px]">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-[#e8eef6]" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl bg-[#eef2f7]"
          />
        ))}
      </div>
    </div>
  );
}
