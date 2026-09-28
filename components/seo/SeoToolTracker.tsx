"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Records that a landing page's tool was opened (page slug only; no content). */
export function SeoToolTracker({ page, kind }: { page: string; kind: "qr" | "barcode" }) {
  useEffect(() => { track("seo_tool_opened", { page, kind }); }, [page, kind]);
  return null;
}
