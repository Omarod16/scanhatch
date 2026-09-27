function ScanMark() {
  return (
    <div
      className="relative mx-auto h-24 w-24 overflow-hidden rounded-2xl border border-line bg-panel p-3 sm:h-28 sm:w-28"
      style={{ ["--scan-distance" as string]: "96px" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="h-full w-full">
        {[
          [4, 4],
          [36, 4],
          [4, 36],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x + 2} y={y + 2} width="20" height="20" rx="3" fill="none" stroke="#22d3ee" strokeWidth="4" />
            <rect x={x + 8} y={y + 8} width="8" height="8" rx="1" fill="#22d3ee" />
          </g>
        ))}
        {[
          [38, 38], [48, 38], [56, 38],
          [43, 46], [56, 46],
          [38, 54], [48, 54], [56, 54],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" fill="#38bdf8" />
        ))}
      </svg>
      <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-cyan shadow-[0_0_12px_2px_rgb(34_211_238/0.7)]" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="scan-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/10 blur-3xl"
        aria-hidden="true"
      />

      <section className="relative mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <ScanMark />

        <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
          ScanHatch
        </h1>

        <p className="mt-3 text-lg font-semibold text-cyan sm:text-xl">
          QR &amp; Barcode Tools
        </p>

        <p className="mt-6 max-w-lg text-balance text-base leading-relaxed text-mist sm:text-lg">
          Create, scan and decode QR codes and barcodes online.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            className="rounded-xl bg-cyan px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
          >
            Create QR Code
          </button>
          <button
            type="button"
            className="rounded-xl border border-line bg-panel px-6 py-3.5 font-semibold text-white transition-colors hover:border-cyan/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
          >
            Create Barcode
          </button>
        </div>

        <div
          className="mt-14 flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-panel/80 px-6 py-4 text-sm sm:flex-row sm:gap-3"
          role="status"
        >
          <span className="flex items-center gap-2 font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153/0.8)]" />
            Deployment Test
          </span>
          <span className="text-mist">ScanHatch deployment is working.</span>
        </div>
      </section>

      <footer className="relative mt-16 text-xs text-mist/70">
        © {new Date().getFullYear()} ScanHatch
      </footer>
    </main>
  );
}
