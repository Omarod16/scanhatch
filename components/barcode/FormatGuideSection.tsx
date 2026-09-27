import { BARCODE_FORMATS, barcodeFormat } from "@/lib/barcode/formats";
import { FORMAT_GUIDES } from "@/lib/barcode/guide";

/** Server-rendered guide for every format (unique content per format). */
export function FormatGuideSection() {
  return (
    <section aria-labelledby="format-guide" className="prose-page">
      <h2 id="format-guide">Barcode format guide</h2>
      <p>Pick the format your scanner, retailer or system expects. Each guide covers what the format is for, what data it accepts, and how to print it so it scans.</p>
      {BARCODE_FORMATS.map((f) => {
        const g = FORMAT_GUIDES[f.id];
        return (
          <article key={f.id} id={`guide-${f.id}`} className="scroll-mt-24 border-t border-line pt-2">
            <h3>{f.name}</h3>
            <p>{g.what}</p>
            <p><strong>Used for:</strong> {g.usedFor}</p>
            <p><strong>Data requirements:</strong> {g.data}</p>
            <p className="mb-2"><strong>Common mistakes:</strong></p>
            <ul>{g.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
            <p><strong>Printing and scanning:</strong> {g.printing}</p>
            <p>
              <strong>Related formats:</strong>{" "}
              {g.related.map((id, i) => (
                <span key={id}>
                  {i > 0 && ", "}
                  <a href={`#guide-${id}`}>{barcodeFormat(id)!.name}</a>
                </span>
              ))}
            </p>
          </article>
        );
      })}
    </section>
  );
}
