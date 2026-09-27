import type { CheckDigitSteps } from "@/lib/barcode/checkdigit";

/** Step-by-step GS1 mod-10 calculation. */
export function CheckDigitTable({ steps, caption }: { steps: CheckDigitSteps; caption?: string }) {
  const next10 = Math.ceil(steps.sum / 10) * 10;
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-max border-collapse text-center font-mono text-sm">
          <caption className="sr-only">{caption ?? "Check digit calculation"}</caption>
          <tbody>
            <tr className="border-b border-line">
              <th scope="row" className="sticky left-0 bg-ink-2 px-3 py-2 text-left font-sans text-xs font-semibold text-mist">Digit</th>
              {steps.body.split("").map((d, i) => <td key={i} className="px-2 py-2 text-white">{d}</td>)}
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="sticky left-0 bg-ink-2 px-3 py-2 text-left font-sans text-xs font-semibold text-mist">× Weight</th>
              {steps.weights.map((w, i) => <td key={i} className={`px-2 py-2 ${w === 3 ? "text-cyan" : "text-fog"}`}>{w}</td>)}
            </tr>
            <tr>
              <th scope="row" className="sticky left-0 bg-ink-2 px-3 py-2 text-left font-sans text-xs font-semibold text-mist">= Product</th>
              {steps.products.map((p, i) => <td key={i} className="px-2 py-2 text-white">{p}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <ol className="mt-3 space-y-1 text-sm text-fog">
        <li>1. Add the products: <span className="font-mono text-white">{steps.products.join(" + ")} = {steps.sum}</span></li>
        <li>2. Round up to a multiple of 10 (unchanged if it already is one): <span className="font-mono text-white">{next10}</span></li>
        <li>3. Subtract: <span className="font-mono text-white">{next10} − {steps.sum} = {steps.check}</span>. The check digit is <strong className="text-white">{steps.check}</strong>.</li>
      </ol>
    </div>
  );
}
