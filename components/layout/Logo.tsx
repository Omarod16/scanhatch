export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0a1824" />
      {[[12, 12], [34, 12], [12, 34]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <rect x={x + 2} y={y + 2} width="14" height="14" rx="3" fill="none" stroke="#22d3ee" strokeWidth="4" />
          <rect x={x + 6} y={y + 6} width="6" height="6" rx="1" fill="#22d3ee" />
        </g>
      ))}
      {[[36, 36], [45, 36], [40.5, 41], [36, 46], [45, 46]].map(([x, y]) => (
        <rect key={`${x}${y}`} x={x} y={y} width="5" height="5" fill="#38bdf8" />
      ))}
    </svg>
  );
}
