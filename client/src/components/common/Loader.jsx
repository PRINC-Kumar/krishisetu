export default function Loader() {
  return (
    <div className="min-h-screen animate-pulse bg-cream p-8">
      <div className="mx-auto h-24 max-w-3xl rounded-2xl bg-white/70" />
      <div className="mx-auto mt-6 grid max-w-5xl gap-4 md:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-52 rounded-2xl bg-white/70" />
        ))}
      </div>
    </div>
  );
}
