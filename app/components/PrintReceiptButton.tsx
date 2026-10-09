"use client";

export default function PrintReceiptButton() {
  return <button type="button" onClick={() => window.print()} className="rounded-xl border border-bronze/50 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-offwhite print:hidden">Print receipt</button>;
}
