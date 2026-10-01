"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { QuickQr } from "@/components/qr/QuickQr";
import { Tabs } from "@/components/ui/Tabs";

// The barcode panel (and its barcode engine) only downloads when its tab is opened.
const QuickBarcode = dynamic(() => import("./QuickBarcode"), {
  ssr: false,
  loading: () => <p className="py-10 text-center text-sm text-mist">Loading the barcode generator…</p>,
});

/** Homepage quick generator: a QR code tab (default) and a barcode tab. */
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
        ]}
      />
    </div>
  );
}
