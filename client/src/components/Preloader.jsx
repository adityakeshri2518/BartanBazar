export default function Preloader() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-premium text-white">
      <div className="relative flex w-full max-w-sm flex-col items-center px-6 text-center">
        <div className="crockery-loader" aria-hidden="true">
          <div className="loader-plate" />
          <div className="loader-bowl" />
          <div className="loader-cup">
            <span />
          </div>
          <div className="loader-spoon" />
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-gold">BartanBazaar</p>
        <h1 className="mt-2 text-2xl font-black">Setting the table</h1>
        <p className="mt-2 text-sm leading-6 text-stone-300">
          Curating premium crockery and kitchenware for you.
        </p>
        <div className="mt-6 h-1 w-44 overflow-hidden rounded-full bg-white/10">
          <div className="preloader-progress h-full rounded-full bg-gold" />
        </div>
      </div>
    </div>
  );
}
