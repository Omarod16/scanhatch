/**
 * Placeholder for future ad placements. Renders nothing until ads are
 * explicitly enabled. Never place inside forms or next to download buttons.
 */
export const ADS_ENABLED = false;

export function AdSlot({ id }: { id: string }) {
  if (!ADS_ENABLED) return null;
  return (
    <aside aria-label="Advertisement" data-ad-slot={id} className="my-12 min-h-[250px] rounded-xl border border-line text-center text-xs text-mist">
      Advertisement
    </aside>
  );
}
