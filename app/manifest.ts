import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ScanHatch – QR & Barcode Tools",
    short_name: "ScanHatch",
    description: "Create, scan and decode QR codes and barcodes in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#050b12",
    theme_color: "#050b12",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
