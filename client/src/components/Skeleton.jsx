export default function Skeleton({ rows = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-lg bg-stone-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}
