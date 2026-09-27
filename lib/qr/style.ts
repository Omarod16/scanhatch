import type { Ecc } from "./matrix";

export type DotStyle = "square" | "rounded" | "dots" | "smooth" | "diamond";
export type EyeFrameStyle = "square" | "rounded" | "circle" | "leaf";
export type EyeBallStyle = "square" | "rounded" | "circle" | "leaf";
export type GradientType = "none" | "linear" | "radial";
export type EyeColorMode = "inherit" | "custom" | "each";

export interface EyeColor {
  frame: string;
  ball: string;
}

export interface LogoOptions {
  /** PNG data URL produced by our own canvas normalisation. */
  dataUrl: string;
  width: number;
  height: number;
  /** Logo box width as a fraction of the symbol width (0.1 – 0.4). */
  size: number;
  /** Space between the logo and its box, as a fraction of the box. */
  padding: number;
  background: boolean;
  backgroundColor: string;
  rounded: boolean;
  /** Remove QR modules behind the logo box. */
  excavate: boolean;
}

export interface QrStyle {
  foreground: string;
  background: string;
  transparent: boolean;
  gradient: GradientType;
  gradientColor: string;
  gradientRotation: number;
  dotStyle: DotStyle;
  eyeFrameStyle: EyeFrameStyle;
  eyeBallStyle: EyeBallStyle;
  eyeColorMode: EyeColorMode;
  eyeColor: EyeColor;
  eyeColors: [EyeColor, EyeColor, EyeColor];
  /** Quiet zone in modules. The QR spec recommends 4. */
  margin: number;
  ecc: Ecc;
  logo: LogoOptions | null;
}

export const DEFAULT_STYLE: QrStyle = {
  foreground: "#0b1620",
  background: "#ffffff",
  transparent: false,
  gradient: "none",
  gradientColor: "#0e7490",
  gradientRotation: 45,
  dotStyle: "square",
  eyeFrameStyle: "square",
  eyeBallStyle: "square",
  eyeColorMode: "inherit",
  eyeColor: { frame: "#0b1620", ball: "#0b1620" },
  eyeColors: [
    { frame: "#0b1620", ball: "#0b1620" },
    { frame: "#0b1620", ball: "#0b1620" },
    { frame: "#0b1620", ball: "#0b1620" },
  ],
  margin: 4,
  ecc: "M",
  logo: null,
};

export const DOT_STYLES: { value: DotStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "smooth", label: "Smooth" },
  { value: "dots", label: "Dots" },
  { value: "diamond", label: "Diamond" },
];
export const EYE_FRAME_STYLES: { value: EyeFrameStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "circle", label: "Circle" },
  { value: "leaf", label: "Leaf" },
];
export const EYE_BALL_STYLES: { value: EyeBallStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "circle", label: "Circle" },
  { value: "leaf", label: "Leaf" },
];

export const ECC_INFO: Record<Ecc, { label: string; recovery: number }> = {
  L: { label: "Low (~7%)", recovery: 0.07 },
  M: { label: "Medium (~15%)", recovery: 0.15 },
  Q: { label: "Quartile (~25%)", recovery: 0.25 },
  H: { label: "High (~30%)", recovery: 0.3 },
};

/** Number of modules (per side) cleared for the logo box, centred and odd/even-matched. */
export function logoBoxModules(size: number, logo: LogoOptions) {
  let n = Math.round(size * logo.size);
  if ((size - n) % 2 !== 0) n += 1;
  return Math.max(0, Math.min(n, size - 16));
}
