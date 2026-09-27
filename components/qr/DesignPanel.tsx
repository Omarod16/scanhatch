"use client";

import { ColorField, PanelHeading, Range, Segmented, Toggle } from "@/components/ui/controls";
import {
  DOT_STYLES, EYE_BALL_STYLES, EYE_FRAME_STYLES,
  type EyeColor, type EyeColorMode, type GradientType, type QrStyle,
} from "@/lib/qr/style";

type Set = <K extends keyof QrStyle>(key: K, value: QrStyle[K]) => void;

const PRESETS: { name: string; fg: string; bg: string }[] = [
  { name: "Classic", fg: "#0b1620", bg: "#ffffff" },
  { name: "Navy", fg: "#1e3a8a", bg: "#ffffff" },
  { name: "Teal", fg: "#115e59", bg: "#f0fdfa" },
  { name: "Plum", fg: "#581c87", bg: "#faf5ff" },
  { name: "Forest", fg: "#14532d", bg: "#f7fee7" },
  { name: "Brick", fg: "#7f1d1d", bg: "#fff7ed" },
];

export function DesignPanel({ style, set }: { style: QrStyle; set: Set }) {
  const setEach = (i: number, part: keyof EyeColor, v: string) => {
    const next = style.eyeColors.map((e, j) => (j === i ? { ...e, [part]: v } : e)) as QrStyle["eyeColors"];
    set("eyeColors", next);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <PanelHeading>Colours</PanelHeading>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Colour presets">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => { set("foreground", p.fg); set("background", p.bg); set("transparent", false); }}
              className="flex min-h-9 items-center gap-2 rounded-full border border-line-2 bg-ink-2 py-1 pr-3 pl-1 text-xs font-medium text-fog hover:border-cyan/50"
            >
              <span className="h-6 w-6 rounded-full border border-white/10" style={{ background: `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)` }} aria-hidden="true" />
              {p.name}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label="Code colour" value={style.foreground} onChange={(v) => set("foreground", v)} />
          <ColorField label="Background" value={style.background} onChange={(v) => set("background", v)} disabled={style.transparent} />
        </div>
        <Toggle label="Transparent background" checked={style.transparent} onChange={(v) => set("transparent", v)} hint="Applies to PNG, SVG and PDF. JPG can't be transparent, so it uses the background colour." />
      </section>

      <section className="space-y-4">
        <PanelHeading>Gradient</PanelHeading>
        <Segmented<GradientType>
          label="Gradient type"
          value={style.gradient}
          onChange={(v) => set("gradient", v)}
          options={[{ value: "none", label: "None" }, { value: "linear", label: "Linear" }, { value: "radial", label: "Radial" }]}
        />
        {style.gradient !== "none" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Second colour" value={style.gradientColor} onChange={(v) => set("gradientColor", v)} />
            {style.gradient === "linear" && (
              <Range label="Angle" value={style.gradientRotation} min={0} max={360} step={15} onChange={(v) => set("gradientRotation", v)} format={(v) => `${v}°`} />
            )}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <PanelHeading>Shapes</PanelHeading>
        <Segmented label="Body pattern" value={style.dotStyle} onChange={(v) => set("dotStyle", v)} options={DOT_STYLES} columns={3} />
        <Segmented label="Eye frame" value={style.eyeFrameStyle} onChange={(v) => set("eyeFrameStyle", v)} options={EYE_FRAME_STYLES} />
        <Segmented label="Eye centre" value={style.eyeBallStyle} onChange={(v) => set("eyeBallStyle", v)} options={EYE_BALL_STYLES} />
      </section>

      <section className="space-y-4">
        <PanelHeading>Eye colours</PanelHeading>
        <Segmented<EyeColorMode>
          label="Eye colouring"
          value={style.eyeColorMode}
          onChange={(v) => set("eyeColorMode", v)}
          options={[{ value: "inherit", label: "Same as code" }, { value: "custom", label: "Custom" }, { value: "each", label: "Each eye" }]}
        />
        {style.eyeColorMode === "custom" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Frame colour" value={style.eyeColor.frame} onChange={(v) => set("eyeColor", { ...style.eyeColor, frame: v })} />
            <ColorField label="Centre colour" value={style.eyeColor.ball} onChange={(v) => set("eyeColor", { ...style.eyeColor, ball: v })} />
          </div>
        )}
        {style.eyeColorMode === "each" &&
          ["Top-left eye", "Top-right eye", "Bottom-left eye"].map((name, i) => (
            <fieldset key={name} className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-2 text-xs font-semibold text-mist">{name}</legend>
              <ColorField label="Frame" value={style.eyeColors[i].frame} onChange={(v) => setEach(i, "frame", v)} />
              <ColorField label="Centre" value={style.eyeColors[i].ball} onChange={(v) => setEach(i, "ball", v)} />
            </fieldset>
          ))}
      </section>
    </div>
  );
}
