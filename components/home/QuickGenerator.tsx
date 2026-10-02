"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { QuickQr } from "@/components/qr/QuickQr";
import { Tabs } from "@/components/ui/Tabs";

// The barcode and scanner panels (and their engines) only download when their tab is opened.
const QuickBarcode = dynamic(() => import("./QuickBarcode"), {
  ssr: false,
  loading: () => <p className="py-10 text-center text-sm text-mist">Loading the barcode generator…</p>,
});

const QuickScan = dynamic(() => import("./QuickScan"), {
  ssr: false,
  loading: () => <p className="py-10 text-center text-sm text-mist">Loading the scanner…</p>,
});

/** Homepage quick generator: a QR code tab (default), a barcode tab and a scanner tab. */
export function QuickGenerator() {
  const [tab, setTab] = useState("qr");
  return (
    <div className="rounded-2xl border border-line bg-ink-2 px-5 pb-5 pt-2 sm:px-8 sm:pb-8">
      <Tabs
        label="Quick generator"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "qr", label: "QR Code", content: <QuickQr framed={false} /> },
          { id: "barcode", label: "Barcode", content: <QuickBarcode /> },
          { id: "scan", label: "Scan Code", content: <QuickScan /> },
        ]}
      />
    </div>
  );
}
