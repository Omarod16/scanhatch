/**
 * Recognises common QR payload formats so results can be shown in a readable way.
 * Only formats with an unambiguous prefix/structure are detected; everything else is plain text.
 * Output is plain data: callers render it as text (React escapes it), never as HTML.
 */

export type PayloadKind = "url" | "wifi" | "email" | "phone" | "sms" | "vcard" | "contact" | "location" | "event" | "payment" | "text";

export interface PayloadField {
  label: string;
  value: string;
  secret?: boolean;
}

export interface PayloadAction {
  label: string;
  href: string;
  /** Opens in a new tab (http/https only). */
  external?: boolean;
}

export interface ParsedPayload {
  kind: PayloadKind;
  title: string;
  fields: PayloadField[];
  actions: PayloadAction[];
  warnings: string[];
}

const TITLES: Record<PayloadKind, string> = {
  url: "Web link", wifi: "WiFi network", email: "Email", phone: "Phone number", sms: "Text message",
  vcard: "Contact card (vCard)", contact: "Contact (MeCard)", location: "Location", event: "Calendar event",
  payment: "Payment request", text: "Text",
};

const make = (kind: PayloadKind, fields: PayloadField[] = [], actions: PayloadAction[] = [], warnings: string[] = []): ParsedPayload => ({
  kind, title: TITLES[kind], fields: fields.filter((f) => f.value !== ""), actions, warnings,
});

/** Split on unescaped `sep` for MECARD/WIFI style "KEY:value;" fields. */
function splitEscaped(s: string, sep: string) {
  const out: string[] = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "\\" && i + 1 < s.length) { cur += s[++i]; continue; }
    if (ch === sep) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

function keyed(body: string) {
  const map: Record<string, string[]> = {};
  for (const part of splitEscaped(body, ";")) {
    const i = part.indexOf(":");
    if (i <= 0) continue;
    const k = part.slice(0, i).toUpperCase();
    (map[k] ??= []).push(part.slice(i + 1));
  }
  return map;
}

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const safeDecode = (s: string) => { try { return decodeURIComponent(s.replace(/\+/g, " ")); } catch { return s; } };

export function httpUrl(text: string): URL | null {
  const t = text.trim();
  if (!/^https?:\/\/\S+$/i.test(t)) return null;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}

/** vCard / iCalendar: unfold lines, return [NAME(with params), value] pairs. */
function contentLines(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n")
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? ([l.slice(0, i).toUpperCase(), l.slice(i + 1)] as const) : null;
    })
    .filter((x): x is readonly [string, string] => x !== null);
}
const unescV = (v: string) => v.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
const icalDate = (v: string) => {
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!m) return v;
  return m[4] ? `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}${v.endsWith("Z") ? " UTC" : ""}` : `${m[1]}-${m[2]}-${m[3]}`;
};

export function parsePayload(raw: string): ParsedPayload {
  const text = raw.trim();
  const upper = text.slice(0, 12).toUpperCase();

  const url = httpUrl(text);
  if (url) {
    const warnings: string[] = [];
    if (url.protocol === "http:") warnings.push("This link isn't encrypted (http). Avoid entering personal details on it.");
    if (url.hostname.split(".").some((p) => p.startsWith("xn--"))) warnings.push("The address uses international characters, which can imitate familiar sites. Check it carefully.");
    if (url.username || url.password) warnings.push("The link contains a username or password before the address, a common trick to disguise where it really goes.");
    return make("url", [{ label: "Website", value: url.hostname }, { label: "Full address", value: text }], [{ label: "Open link", href: url.href, external: true }], warnings);
  }

  if (upper.startsWith("WIFI:")) {
    const m = keyed(text.slice(5));
    const t = (m.T?.[0] ?? "").toUpperCase();
    return make("wifi", [
      { label: "Network name", value: m.S?.[0] ?? "" },
      { label: "Security", value: t === "NOPASS" || t === "" ? "None (open network)" : t },
      { label: "Password", value: m.P?.[0] ?? "", secret: true },
      { label: "Hidden network", value: (m.H?.[0] ?? "").toLowerCase() === "true" ? "Yes" : "" },
    ]);
  }

  if (/^mailto:/i.test(text)) {
    const [addr, query = ""] = text.slice(7).split("?");
    const q = new URLSearchParams(query);
    const to = safeDecode(addr);
    return make("email", [
      { label: "To", value: to },
      { label: "Subject", value: q.get("subject") ?? "" },
      { label: "Message", value: q.get("body") ?? "" },
    ], EMAIL_RE.test(to) ? [{ label: "Open in email app", href: `mailto:${to}${query ? `?${new URLSearchParams(query).toString()}` : ""}` }] : []);
  }
  if (upper.startsWith("MATMSG:")) {
    const m = keyed(text.slice(7));
    return make("email", [{ label: "To", value: m.TO?.[0] ?? "" }, { label: "Subject", value: m.SUB?.[0] ?? "" }, { label: "Message", value: m.BODY?.[0] ?? "" }]);
  }

  if (/^tel:/i.test(text)) {
    const num = text.slice(4).trim();
    return make("phone", [{ label: "Number", value: num }], /^\+?[\d\s().-]{3,}$/.test(num) ? [{ label: "Call", href: `tel:${num.replace(/[^\d+]/g, "")}` }] : []);
  }

  if (/^smsto:/i.test(text) || /^sms:/i.test(text)) {
    let num = "", msg = "";
    if (/^smsto:/i.test(text)) {
      const rest = text.slice(6);
      const i = rest.indexOf(":");
      num = i >= 0 ? rest.slice(0, i) : rest;
      msg = i >= 0 ? rest.slice(i + 1) : "";
    } else {
      const [n, q = ""] = text.slice(4).split("?");
      num = n;
      msg = new URLSearchParams(q).get("body") ?? "";
    }
    return make("sms", [{ label: "To", value: num }, { label: "Message", value: msg }], /^\+?[\d\s().-]{3,}$/.test(num) ? [{ label: "Open in messages", href: `sms:${num.replace(/[^\d+]/g, "")}` }] : []);
  }

  if (/^BEGIN:VCARD/i.test(text)) {
    const lines = contentLines(text);
    const get = (name: string) => lines.filter(([k]) => k === name || k.startsWith(name + ";")).map(([, v]) => unescV(v));
    const n = get("N")[0]?.split(";") ?? [];
    const adr = get("ADR")[0]?.split(";").filter(Boolean).join(", ") ?? "";
    return make("vcard", [
      { label: "Name", value: get("FN")[0] ?? [n[1], n[0]].filter(Boolean).join(" ") },
      { label: "Organisation", value: get("ORG")[0] ?? "" },
      { label: "Job title", value: get("TITLE")[0] ?? "" },
      ...get("TEL").map((v) => ({ label: "Phone", value: v })),
      ...get("EMAIL").map((v) => ({ label: "Email", value: v })),
      ...get("URL").map((v) => ({ label: "Website", value: v })),
      { label: "Address", value: adr },
    ]);
  }

  if (upper.startsWith("MECARD:")) {
    const m = keyed(text.slice(7));
    const [last = "", first = ""] = (m.N?.[0] ?? "").split(",");
    return make("contact", [
      { label: "Name", value: [first, last].filter(Boolean).join(" ") },
      ...(m.TEL ?? []).map((v) => ({ label: "Phone", value: v })),
      ...(m.EMAIL ?? []).map((v) => ({ label: "Email", value: v })),
      ...(m.URL ?? []).map((v) => ({ label: "Website", value: v })),
      { label: "Address", value: m.ADR?.[0] ?? "" },
    ]);
  }

  const geo = text.match(/^geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (geo && Math.abs(+geo[1]) <= 90 && Math.abs(+geo[2]) <= 180) {
    return make("location", [{ label: "Latitude", value: geo[1] }, { label: "Longitude", value: geo[2] }], [
      { label: "Open in Google Maps", href: `https://www.google.com/maps/search/?api=1&query=${geo[1]},${geo[2]}`, external: true },
    ]);
  }

  if (/^BEGIN:(VEVENT|VCALENDAR)/i.test(text)) {
    const lines = contentLines(text);
    const get = (name: string) => unescV(lines.find(([k]) => k === name || k.startsWith(name + ";"))?.[1] ?? "");
    return make("event", [
      { label: "Event", value: get("SUMMARY") },
      { label: "Starts", value: icalDate(get("DTSTART")) },
      { label: "Ends", value: icalDate(get("DTEND")) },
      { label: "Location", value: get("LOCATION") },
      { label: "Details", value: get("DESCRIPTION") },
    ]);
  }

  const pay = text.match(/^(bitcoin|ethereum|litecoin):([^?]+)(\?.*)?$/i);
  if (pay) {
    const q = new URLSearchParams(pay[3]?.slice(1) ?? "");
    return make("payment", [
      { label: "Currency", value: pay[1][0].toUpperCase() + pay[1].slice(1).toLowerCase() },
      { label: "Address", value: pay[2] },
      { label: "Amount", value: q.get("amount") ?? "" },
      { label: "Label", value: q.get("label") ?? "" },
      { label: "Message", value: q.get("message") ?? "" },
    ], [], ["Check the address carefully before sending any payment. ScanHatch can't verify who it belongs to."]);
  }

  return make("text");
}

/** For short previews (e.g. history): hides WiFi passwords. */
export function maskSecrets(text: string) {
  return /^WIFI:/i.test(text.trim()) ? text.replace(/([;:]P:)((?:\\.|[^;])*)/i, (_, k: string, v: string) => (v ? `${k}••••••` : k)) : text;
}
