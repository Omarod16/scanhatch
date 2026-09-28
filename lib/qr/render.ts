import { inFinder, type QrMatrix } from "./matrix";
import { safeHex } from "./color";
import { logoBoxModules, type EyeBallStyle, type EyeFrameStyle, type QrStyle } from "./style";

const f = (n: number) => +n.toFixed(3);

/** Rounded rectangle path with per-corner radii [tl, tr, br, bl]. */
function rrect(x: number, y: number, w: number, h: number, r: [number, number, number, number]) {
  const [tl, tr, br, bl] = r;
  return (
    `M${f(x + tl)} ${f(y)}H${f(x + w - tr)}` +
    (tr ? `A${f(tr)} ${f(tr)} 0 0 1 ${f(x + w)} ${f(y + tr)}` : "") +
    `V${f(y + h - br)}` +
    (br ? `A${f(br)} ${f(br)} 0 0 1 ${f(x + w - br)} ${f(y + h)}` : "") +
    `H${f(x + bl)}` +
    (bl ? `A${f(bl)} ${f(bl)} 0 0 1 ${f(x)} ${f(y + h - bl)}` : "") +
    `V${f(y + tl)}` +
    (tl ? `A${f(tl)} ${f(tl)} 0 0 1 ${f(x + tl)} ${f(y)}` : "") +
    "Z"
  );
}

const circle = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;

function framePath(style: EyeFrameStyle, x: number, y: number) {
  switch (style) {
    case "circle":
      return circle(x + 3.5, y + 3.5, 3.5) + circle(x + 3.5, y + 3.5, 2.5);
    case "rounded":
      return rrect(x, y, 7, 7, [2, 2, 2, 2]) + rrect(x + 1, y + 1, 5, 5, [1.2, 1.2, 1.2, 1.2]);
    case "leaf":
      return rrect(x, y, 7, 7, [3, 0.4, 3, 0.4]) + rrect(x + 1, y + 1, 5, 5, [2, 0.2, 2, 0.2]);
    default:
      return rrect(x, y, 7, 7, [0, 0, 0, 0]) + rrect(x + 1, y + 1, 5, 5, [0, 0, 0, 0]);
  }
}

function ballPath(style: EyeBallStyle, x: number, y: number) {
  switch (style) {
    case "circle":
      return circle(x + 3.5, y + 3.5, 1.5);
    case "rounded":
      return rrect(x + 2, y + 2, 3, 3, [0.9, 0.9, 0.9, 0.9]);
    case "leaf":
      return rrect(x + 2, y + 2, 3, 3, [1.4, 0.2, 1.4, 0.2]);
    default:
      return rrect(x + 2, y + 2, 3, 3, [0, 0, 0, 0]);
  }
}

function bodyPath(m: QrMatrix, style: QrStyle, skip: (r: number, c: number) => boolean, offset: number) {
  const { size } = m;
  const dark = (r: number, c: number) => m.isDark(r, c) && !inFinder(size, r, c) && !skip(r, c);
  let d = "";
  const o = offset;

  if (style.dotStyle === "square") {
    // Merge horizontal runs so rasterised output has no hairline seams.
    for (let r = 0; r < size; r++) {
      let c = 0;
      while (c < size) {
        if (!dark(r, c)) { c++; continue; }
        const start = c;
        while (c < size && dark(r, c)) c++;
        d += `M${start + o} ${r + o}h${c - start}v1h${start - c}Z`;
      }
    }
    return d;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!dark(r, c)) continue;
      const x = c + o, y = r + o;
      switch (style.dotStyle) {
        case "dots":
          d += circle(x + 0.5, y + 0.5, 0.46);
          break;
        case "rounded":
          d += rrect(x + 0.04, y + 0.04, 0.92, 0.92, [0.32, 0.32, 0.32, 0.32]);
          break;
        case "diamond":
          d += `M${f(x + 0.5)} ${y}L${x + 1} ${f(y + 0.5)}L${f(x + 0.5)} ${y + 1}L${x} ${f(y + 0.5)}Z`;
          break;
        case "smooth": {
          const up = dark(r - 1, c), down = dark(r + 1, c), left = dark(r, c - 1), right = dark(r, c + 1);
          const R = 0.5;
          d += rrect(x, y, 1, 1, [
            !up && !left ? R : 0,
            !up && !right ? R : 0,
            !down && !right ? R : 0,
            !down && !left ? R : 0,
          ]);
          break;
        }
      }
    }
  }
  return d;
}

/** Escapes text for SVG and drops characters XML doesn't allow (control chars, lone surrogates), which would make the file unreadable. */
const escAttr = (v: string) =>
  v
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "")
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface RenderOptions {
  /** Output width/height attribute in px. The SVG itself is resolution-independent. */
  pixelSize?: number;
  title?: string;
}

/** Renders a QR matrix and style to a standalone SVG string. */
export function renderQrSvg(m: QrMatrix, style: QrStyle, opts: RenderOptions = {}) {
  const { size } = m;
  const margin = Math.max(0, Math.min(20, Math.round(style.margin)));
  const total = size + margin * 2;
  const px = opts.pixelSize ?? 512;

  const fg = safeHex(style.foreground, "#000000");
  const bg = safeHex(style.background, "#ffffff");
  const g2 = safeHex(style.gradientColor, fg);

  // Logo box
  let skip = (_r: number, _c: number) => false;
  let logoSvg = "";
  if (style.logo && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(style.logo.dataUrl)) {
    const logo = style.logo;
    const n = logoBoxModules(size, logo);
    const start = (size - n) / 2;
    if (n > 0) {
      if (logo.excavate) skip = (r, c) => r >= start && r < start + n && c >= start && c < start + n;
      const bx = start + margin, by = start + margin;
      if (logo.background) {
        const lbg = safeHex(logo.backgroundColor, "#ffffff");
        const rx = logo.rounded ? n * 0.2 : 0;
        logoSvg += `<rect x="${f(bx)}" y="${f(by)}" width="${n}" height="${n}" rx="${f(rx)}" fill="${lbg}"/>`;
      }
      const pad = n * Math.max(0, Math.min(0.3, logo.padding));
      const inner = n - pad * 2;
      logoSvg += `<image x="${f(bx + pad)}" y="${f(by + pad)}" width="${f(inner)}" height="${f(inner)}" preserveAspectRatio="xMidYMid meet" href="${escAttr(logo.dataUrl)}"/>`;
    }
  }

  const defs: string[] = [];
  let bodyFill = fg;
  if (style.gradient !== "none") {
    if (style.gradient === "linear") {
      const a = (style.gradientRotation * Math.PI) / 180;
      const cx = total / 2, cy = total / 2, h = total / 2;
      const dx = Math.cos(a) * h, dy = Math.sin(a) * h;
      defs.push(
        `<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="${f(cx - dx)}" y1="${f(cy - dy)}" x2="${f(cx + dx)}" y2="${f(cy + dy)}"><stop offset="0" stop-color="${fg}"/><stop offset="1" stop-color="${g2}"/></linearGradient>`
      );
    } else {
      defs.push(
        `<radialGradient id="g" gradientUnits="userSpaceOnUse" cx="${total / 2}" cy="${total / 2}" r="${f(total / 2)}"><stop offset="0" stop-color="${fg}"/><stop offset="1" stop-color="${g2}"/></radialGradient>`
      );
    }
    bodyFill = "url(#g)";
  }

  const eyes: [number, number][] = [
    [margin, margin],
    [margin + size - 7, margin],
    [margin, margin + size - 7],
  ];
  let eyeSvg = "";
  eyes.forEach(([x, y], i) => {
    let frameFill = bodyFill, ballFill = bodyFill;
    if (style.eyeColorMode === "custom") {
      frameFill = safeHex(style.eyeColor.frame, fg);
      ballFill = safeHex(style.eyeColor.ball, fg);
    } else if (style.eyeColorMode === "each") {
      frameFill = safeHex(style.eyeColors[i].frame, fg);
      ballFill = safeHex(style.eyeColors[i].ball, fg);
    }
    eyeSvg += `<path fill-rule="evenodd" fill="${frameFill}" d="${framePath(style.eyeFrameStyle, x, y)}"/>`;
    eyeSvg += `<path fill="${ballFill}" d="${ballPath(style.eyeBallStyle, x, y)}"/>`;
  });

  const body = bodyPath(m, style, skip, margin);
  const title = escAttr(opts.title ?? "QR code");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${px}" height="${px}" shape-rendering="${style.dotStyle === "square" ? "crispEdges" : "geometricPrecision"}">` +
    `<title>${title}</title>` +
    (defs.length ? `<defs>${defs.join("")}</defs>` : "") +
    (style.transparent ? "" : `<rect width="${total}" height="${total}" fill="${bg}"/>`) +
    `<path fill="${bodyFill}" d="${body}"/>` +
    eyeSvg +
    logoSvg +
    `</svg>`
  );
}
