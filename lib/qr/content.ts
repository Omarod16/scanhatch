/**
 * QR content types: form schemas, validation and payload builders.
 * Everything here is pure and runs in the browser; nothing is sent anywhere.
 */

export type FieldValue = string | boolean;
export type Values = Record<string, FieldValue>;

export type FieldKind =
  | "text" | "textarea" | "url" | "email" | "tel" | "number"
  | "password" | "select" | "checkbox" | "datetime";

export interface FieldDef {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  /** Hide the field unless this returns true. */
  showIf?: (v: Values) => boolean;
  autoComplete?: string;
  inputMode?: "text" | "decimal" | "tel" | "email" | "url" | "numeric";
  maxLength?: number;
  /** Layout: render two half-width fields side by side on wider screens. */
  half?: boolean;
}

export type BuildResult =
  | { ok: true; payload: string; notes?: string[] }
  | { ok: false; errors: Record<string, string>; missing: boolean };

export interface ContentType {
  id: ContentTypeId;
  label: string;
  short: string;
  description: string;
  fields: FieldDef[];
  defaults: Values;
  /** Adds a "use my current location" action that fills lat/lng. */
  geolocate?: boolean;
  build: (v: Values) => BuildResult;
}

export type ContentTypeId =
  | "url" | "text" | "wifi" | "email" | "phone" | "sms" | "whatsapp"
  | "vcard" | "contact" | "location" | "maps" | "event" | "social"
  | "app" | "bitcoin" | "crypto";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const s = (v: FieldValue | undefined) => (typeof v === "string" ? v.trim() : "");
const b = (v: FieldValue | undefined) => v === true;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Escape for WIFI: and MECARD: formats (\ ; , : " need a backslash). */
const escMe = (x: string) => x.replace(/([\\;,:"])/g, "\\$1");

/** Escape for vCard / iCalendar text values. */
const escV = (x: string) =>
  x.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export function normalizeUrl(raw: string): { url?: string; error?: string } {
  const value = raw.trim();
  if (!value) return { error: "Enter a web address." };
  if (/\s/.test(value)) return { error: "Web addresses can't contain spaces." };
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    return { error: "This doesn't look like a valid web address." };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { error: "Only http:// and https:// addresses are supported." };
  }
  if (!u.hostname.includes(".") && u.hostname !== "localhost") {
    return { error: "Include a full domain, for example example.com." };
  }
  // Keep the user's own formatting (URL() adds trailing slashes).
  return { url: withScheme };
}

function phoneDigits(raw: string) {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^\d]/g, "");
}

function validPhone(raw: string) {
  if (!/^[+\d\s().-]+$/.test(raw.trim())) return "Use digits, spaces, +, ( ) or - only.";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 3) return "Enter a phone number.";
  if (digits.length > 15) return "Phone numbers have at most 15 digits.";
  return null;
}

function result(errors: Record<string, string>, requiredEmpty: boolean, payload: () => string, notes?: string[]): BuildResult {
  if (Object.keys(errors).length || requiredEmpty) return { ok: false, errors, missing: requiredEmpty };
  return { ok: true, payload: payload(), notes };
}

/** Converts a datetime-local value (YYYY-MM-DDTHH:mm) to iCal floating time. */
const icalTime = (v: string) => v.replace(/[-:]/g, "").slice(0, 13) + "00";

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

const SOCIAL: Record<string, { label: string; url: (h: string) => string }> = {
  instagram: { label: "Instagram", url: (h) => `https://www.instagram.com/${h}` },
  tiktok: { label: "TikTok", url: (h) => `https://www.tiktok.com/@${h}` },
  x: { label: "X (Twitter)", url: (h) => `https://x.com/${h}` },
  facebook: { label: "Facebook", url: (h) => `https://www.facebook.com/${h}` },
  linkedin: { label: "LinkedIn (profile)", url: (h) => `https://www.linkedin.com/in/${h}` },
  youtube: { label: "YouTube", url: (h) => `https://www.youtube.com/@${h}` },
  threads: { label: "Threads", url: (h) => `https://www.threads.net/@${h}` },
  github: { label: "GitHub", url: (h) => `https://github.com/${h}` },
};

export const CONTENT_TYPES: ContentType[] = [
  {
    id: "url",
    label: "Website URL",
    short: "URL",
    description: "Opens a web page.",
    fields: [{ name: "url", label: "Web address", kind: "url", required: true, placeholder: "https://example.com", inputMode: "url", autoComplete: "url", hint: "https:// is added automatically if you leave it out." }],
    defaults: { url: "" },
    build: (v): BuildResult => {
      if (!s(v.url)) return { ok: false, errors: {}, missing: true };
      const { url, error } = normalizeUrl(s(v.url));
      return error ? { ok: false, errors: { url: error }, missing: false } : { ok: true, payload: url! };
    },
  },
  {
    id: "text",
    label: "Plain text",
    short: "Text",
    description: "Shows text on the scanner's screen.",
    fields: [{ name: "text", label: "Your text", kind: "textarea", required: true, placeholder: "Type any text…", maxLength: 2000 }],
    defaults: { text: "" },
    build: (v) => (s(v.text) ? { ok: true, payload: String(v.text) } : { ok: false, errors: {}, missing: true }),
  },
  {
    id: "wifi",
    label: "WiFi network",
    short: "WiFi",
    description: "Joins a WiFi network without typing the password.",
    fields: [
      { name: "ssid", label: "Network name (SSID)", kind: "text", required: true, placeholder: "MyHomeWiFi", maxLength: 32, hint: "Must match exactly, including capital letters." },
      { name: "security", label: "Security", kind: "select", options: [
        { value: "WPA", label: "WPA / WPA2 / WPA3" },
        { value: "WEP", label: "WEP (old)" },
        { value: "nopass", label: "None (open network)" },
      ] },
      { name: "password", label: "Password", kind: "password", showIf: (v) => v.security !== "nopass", maxLength: 63, autoComplete: "off" },
      { name: "hidden", label: "Hidden network", kind: "checkbox", hint: "Tick this if your network doesn't broadcast its name." },
    ],
    defaults: { ssid: "", security: "WPA", password: "", hidden: false },
    build: (v): BuildResult => {
      const errors: Record<string, string> = {};
      const sec = s(v.security) || "WPA";
      const pass = typeof v.password === "string" ? v.password : "";
      if (sec !== "nopass" && pass) {
        if (sec === "WPA" && (pass.length < 8 || pass.length > 63)) errors.password = "WPA passwords are 8–63 characters.";
      }
      const missing = !s(v.ssid) || (sec !== "nopass" && !pass);
      return result(errors, missing, () => {
        let out = `WIFI:T:${sec};S:${escMe(String(v.ssid))};`;
        if (sec !== "nopass") out += `P:${escMe(pass)};`;
        if (b(v.hidden)) out += "H:true;";
        return out + ";";
      });
    },
  },
  {
    id: "email",
    label: "Email",
    short: "Email",
    description: "Opens a pre-filled email.",
    fields: [
      { name: "to", label: "Email address", kind: "email", required: true, placeholder: "name@example.com", inputMode: "email" },
      { name: "subject", label: "Subject", kind: "text", maxLength: 200 },
      { name: "body", label: "Message", kind: "textarea", maxLength: 1000 },
    ],
    defaults: { to: "", subject: "", body: "" },
    build: (v): BuildResult => {
      const errors: Record<string, string> = {};
      if (s(v.to) && !EMAIL_RE.test(s(v.to))) errors.to = "Enter a valid email address.";
      return result(errors, !s(v.to), () => {
        const q = new URLSearchParams();
        if (s(v.subject)) q.set("subject", s(v.subject));
        if (s(v.body)) q.set("body", String(v.body));
        const qs = q.toString().replace(/\+/g, "%20");
        return `mailto:${s(v.to)}${qs ? `?${qs}` : ""}`;
      });
    },
  },
  {
    id: "phone",
    label: "Phone call",
    short: "Phone",
    description: "Starts a call to a number.",
    fields: [{ name: "phone", label: "Phone number", kind: "tel", required: true, placeholder: "+44 20 7946 0000", inputMode: "tel", hint: "Include the country code (e.g. +44) so it works from any country." }],
    defaults: { phone: "" },
    build: (v): BuildResult => {
      const err = s(v.phone) ? validPhone(s(v.phone)) : null;
      return result(err ? { phone: err } : {}, !s(v.phone), () => `tel:${phoneDigits(s(v.phone))}`);
    },
  },
  {
    id: "sms",
    label: "SMS message",
    short: "SMS",
    description: "Opens a text message with the number and message filled in.",
    fields: [
      { name: "phone", label: "Phone number", kind: "tel", required: true, placeholder: "+44 7700 900000", inputMode: "tel" },
      { name: "message", label: "Message", kind: "textarea", maxLength: 500 },
    ],
    defaults: { phone: "", message: "" },
    build: (v): BuildResult => {
      const err = s(v.phone) ? validPhone(s(v.phone)) : null;
      return result(err ? { phone: err } : {}, !s(v.phone), () => `SMSTO:${phoneDigits(s(v.phone))}:${typeof v.message === "string" ? v.message : ""}`);
    },
  },
  {
    id: "whatsapp",
    label: "WhatsApp chat",
    short: "WhatsApp",
    description: "Opens a WhatsApp chat, optionally with a starter message.",
    fields: [
      { name: "phone", label: "WhatsApp number", kind: "tel", required: true, placeholder: "+44 7700 900000", inputMode: "tel", hint: "Full international number with country code." },
      { name: "message", label: "Starter message", kind: "textarea", maxLength: 500 },
    ],
    defaults: { phone: "", message: "" },
    build: (v): BuildResult => {
      let digits = s(v.phone).replace(/\D/g, "");
      if (digits.startsWith("00")) digits = digits.slice(2);
      const errors: Record<string, string> = {};
      if (s(v.phone)) {
        const e = validPhone(s(v.phone));
        if (e) errors.phone = e;
        else if (digits.length < 7) errors.phone = "Include the country code, e.g. +44 7700 900000.";
      }
      return result(errors, !s(v.phone), () => {
        const msg = s(v.message);
        return `https://wa.me/${digits}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
      });
    },
  },
  {
    id: "vcard",
    label: "vCard (full contact)",
    short: "vCard",
    description: "Saves a complete contact card to the phone.",
    fields: [
      { name: "first", label: "First name", kind: "text", half: true, autoComplete: "given-name" },
      { name: "last", label: "Last name", kind: "text", half: true, autoComplete: "family-name" },
      { name: "org", label: "Organisation", kind: "text", half: true, autoComplete: "organization" },
      { name: "title", label: "Job title", kind: "text", half: true, autoComplete: "organization-title" },
      { name: "phone", label: "Phone number", kind: "tel", half: true, inputMode: "tel" },
      { name: "email", label: "Email address", kind: "email", half: true, inputMode: "email" },
      { name: "website", label: "Website", kind: "url", inputMode: "url" },
      { name: "street", label: "Street address", kind: "text", autoComplete: "street-address" },
      { name: "city", label: "City", kind: "text", half: true, autoComplete: "address-level2" },
      { name: "region", label: "County / state", kind: "text", half: true, autoComplete: "address-level1" },
      { name: "postcode", label: "Postcode / ZIP", kind: "text", half: true, autoComplete: "postal-code" },
      { name: "country", label: "Country", kind: "text", half: true, autoComplete: "country-name" },
    ],
    defaults: { first: "", last: "", org: "", title: "", phone: "", email: "", website: "", street: "", city: "", region: "", postcode: "", country: "" },
    build: (v): BuildResult => {
      const errors: Record<string, string> = {};
      if (s(v.email) && !EMAIL_RE.test(s(v.email))) errors.email = "Enter a valid email address.";
      if (s(v.phone)) { const e = validPhone(s(v.phone)); if (e) errors.phone = e; }
      let site: string | undefined;
      if (s(v.website)) { const r = normalizeUrl(s(v.website)); if (r.error) errors.website = r.error; site = r.url; }
      const missing = !s(v.first) && !s(v.last) && !s(v.org);
      if (missing && Object.values(v).some((x) => typeof x === "string" && x.trim())) {
        errors.first = "Add a name or an organisation.";
      }
      return result(errors, missing, () => {
        const L = ["BEGIN:VCARD", "VERSION:3.0"];
        L.push(`N:${escV(s(v.last))};${escV(s(v.first))};;;`);
        L.push(`FN:${escV([s(v.first), s(v.last)].filter(Boolean).join(" ") || s(v.org))}`);
        if (s(v.org)) L.push(`ORG:${escV(s(v.org))}`);
        if (s(v.title)) L.push(`TITLE:${escV(s(v.title))}`);
        if (s(v.phone)) L.push(`TEL;TYPE=CELL:${phoneDigits(s(v.phone))}`);
        if (s(v.email)) L.push(`EMAIL:${s(v.email)}`);
        if (site) L.push(`URL:${site}`);
        if ([v.street, v.city, v.region, v.postcode, v.country].some((x) => s(x))) {
          L.push(`ADR;TYPE=WORK:;;${escV(s(v.street))};${escV(s(v.city))};${escV(s(v.region))};${escV(s(v.postcode))};${escV(s(v.country))}`);
        }
        L.push("END:VCARD");
        return L.join("\n");
      });
    },
  },
  {
    id: "contact",
    label: "Contact (compact)",
    short: "Contact",
    description: "A smaller contact code (MeCard) for business cards and badges.",
    fields: [
      { name: "first", label: "First name", kind: "text", half: true, autoComplete: "given-name" },
      { name: "last", label: "Last name", kind: "text", half: true, autoComplete: "family-name" },
      { name: "phone", label: "Phone number", kind: "tel", half: true, inputMode: "tel" },
      { name: "email", label: "Email address", kind: "email", half: true, inputMode: "email" },
      { name: "website", label: "Website", kind: "url", inputMode: "url" },
    ],
    defaults: { first: "", last: "", phone: "", email: "", website: "" },
    build: (v): BuildResult => {
      const errors: Record<string, string> = {};
      if (s(v.email) && !EMAIL_RE.test(s(v.email))) errors.email = "Enter a valid email address.";
      if (s(v.phone)) { const e = validPhone(s(v.phone)); if (e) errors.phone = e; }
      let site: string | undefined;
      if (s(v.website)) { const r = normalizeUrl(s(v.website)); if (r.error) errors.website = r.error; site = r.url; }
      return result(errors, !s(v.first) && !s(v.last), () => {
        let out = `MECARD:N:${escMe(s(v.last))},${escMe(s(v.first))};`;
        if (s(v.phone)) out += `TEL:${phoneDigits(s(v.phone))};`;
        if (s(v.email)) out += `EMAIL:${escMe(s(v.email))};`;
        if (site) out += `URL:${escMe(site)};`;
        return out + ";";
      });
    },
  },
  {
    id: "location",
    label: "Location (coordinates)",
    short: "Location",
    description: "Opens a point on the phone's default map app.",
    geolocate: true,
    fields: [
      { name: "lat", label: "Latitude", kind: "number", required: true, placeholder: "51.5007", inputMode: "decimal", half: true },
      { name: "lng", label: "Longitude", kind: "number", required: true, placeholder: "-0.1246", inputMode: "decimal", half: true },
    ],
    defaults: { lat: "", lng: "" },
    build: (v) => coordsResult(v, (lat, lng) => `geo:${lat},${lng}`),
  },
  {
    id: "maps",
    label: "Google Maps",
    short: "Maps",
    description: "Opens a place or coordinates in Google Maps.",
    geolocate: true,
    fields: [
      { name: "mode", label: "Find by", kind: "select", options: [
        { value: "search", label: "Place name or address" },
        { value: "coords", label: "Coordinates" },
      ] },
      { name: "query", label: "Place or address", kind: "text", placeholder: "Tower Bridge, London", showIf: (v) => v.mode !== "coords" },
      { name: "lat", label: "Latitude", kind: "number", placeholder: "51.5055", inputMode: "decimal", half: true, showIf: (v) => v.mode === "coords" },
      { name: "lng", label: "Longitude", kind: "number", placeholder: "-0.0754", inputMode: "decimal", half: true, showIf: (v) => v.mode === "coords" },
    ],
    defaults: { mode: "search", query: "", lat: "", lng: "" },
    build: (v): BuildResult => {
      const base = "https://www.google.com/maps/search/?api=1&query=";
      if (v.mode === "coords") return coordsResult(v, (lat, lng) => `${base}${lat},${lng}`);
      return s(v.query) ? { ok: true, payload: base + encodeURIComponent(s(v.query)) } : { ok: false, errors: {}, missing: true };
    },
  },
  {
    id: "event",
    label: "Calendar event",
    short: "Event",
    description: "Adds an event to the scanner's calendar.",
    fields: [
      { name: "title", label: "Event title", kind: "text", required: true, maxLength: 200 },
      { name: "location", label: "Location", kind: "text", maxLength: 200 },
      { name: "start", label: "Starts", kind: "datetime", required: true, half: true },
      { name: "end", label: "Ends", kind: "datetime", required: true, half: true },
      { name: "description", label: "Description", kind: "textarea", maxLength: 600 },
    ],
    defaults: { title: "", location: "", start: "", end: "", description: "" },
    build: (v): BuildResult => {
      const errors: Record<string, string> = {};
      if (s(v.start) && s(v.end) && s(v.end) <= s(v.start)) errors.end = "The end must be after the start.";
      return result(errors, !s(v.title) || !s(v.start) || !s(v.end), () => {
        const L = ["BEGIN:VEVENT", `SUMMARY:${escV(s(v.title))}`];
        if (s(v.location)) L.push(`LOCATION:${escV(s(v.location))}`);
        L.push(`DTSTART:${icalTime(s(v.start))}`, `DTEND:${icalTime(s(v.end))}`);
        if (s(v.description)) L.push(`DESCRIPTION:${escV(s(v.description))}`);
        L.push("END:VEVENT");
        return L.join("\n");
      }, ["Times use the scanning phone's local time zone."]);
    },
  },
  {
    id: "social",
    label: "Social media profile",
    short: "Social",
    description: "Opens a social media profile.",
    fields: [
      { name: "platform", label: "Platform", kind: "select", options: Object.entries(SOCIAL).map(([value, p]) => ({ value, label: p.label })) },
      { name: "handle", label: "Username", kind: "text", required: true, placeholder: "yourname", hint: "Just the username, without @ or the full link.", autoComplete: "off" },
    ],
    defaults: { platform: "instagram", handle: "" },
    build: (v): BuildResult => {
      const handle = s(v.handle).replace(/^@/, "");
      const errors: Record<string, string> = {};
      if (handle && !/^[A-Za-z0-9._-]{1,100}$/.test(handle)) errors.handle = "Usernames can use letters, numbers, dots, dashes and underscores.";
      const p = SOCIAL[s(v.platform)] ?? SOCIAL.instagram;
      return result(errors, !handle, () => p.url(handle));
    },
  },
  {
    id: "app",
    label: "App download",
    short: "App",
    description: "Links to an app on the App Store or Google Play.",
    fields: [
      { name: "store", label: "Store", kind: "select", options: [
        { value: "apple", label: "Apple App Store" },
        { value: "google", label: "Google Play" },
      ] },
      { name: "url", label: "App store link", kind: "url", required: true, inputMode: "url", placeholder: "https://apps.apple.com/app/id000000000", hint: "Copy the link from the app's store page." },
    ],
    defaults: { store: "apple", url: "" },
    build: (v): BuildResult => {
      if (!s(v.url)) return { ok: false, errors: {}, missing: true };
      const { url, error } = normalizeUrl(s(v.url));
      if (error) return { ok: false, errors: { url: error }, missing: false };
      const host = new URL(url!).hostname;
      const expected = v.store === "google" ? "play.google.com" : "apps.apple.com";
      if (host !== expected) return { ok: false, errors: { url: `This should be a ${expected} link.` }, missing: false };
      return { ok: true, payload: url!, notes: ["A static QR code holds one link. Codes that send iPhone and Android users to different stores need a dynamic QR service."] };
    },
  },
  {
    id: "bitcoin",
    label: "Bitcoin payment",
    short: "Bitcoin",
    description: "Opens a Bitcoin wallet with the address and amount filled in.",
    fields: [
      { name: "address", label: "Bitcoin address", kind: "text", required: true, autoComplete: "off", placeholder: "bc1q…" },
      { name: "amount", label: "Amount (BTC)", kind: "number", inputMode: "decimal", half: true, placeholder: "0.001" },
      { name: "label", label: "Label", kind: "text", half: true, maxLength: 100 },
      { name: "message", label: "Message", kind: "text", maxLength: 200 },
    ],
    defaults: { address: "", amount: "", label: "", message: "" },
    build: (v): BuildResult => {
      const addr = s(v.address);
      const errors: Record<string, string> = {};
      if (addr && !/^(bc1[ac-hj-np-z02-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(addr)) errors.address = "This doesn't match a Bitcoin address format.";
      if (s(v.amount) && !/^\d+(\.\d{1,8})?$/.test(s(v.amount))) errors.amount = "Use a number with up to 8 decimal places.";
      return result(errors, !addr, () => {
        const q: string[] = [];
        if (s(v.amount)) q.push(`amount=${s(v.amount)}`);
        if (s(v.label)) q.push(`label=${encodeURIComponent(s(v.label))}`);
        if (s(v.message)) q.push(`message=${encodeURIComponent(s(v.message))}`);
        return `bitcoin:${addr}${q.length ? `?${q.join("&")}` : ""}`;
      }, ["Address format is checked, but not its checksum. Always double-check the address before sharing."]);
    },
  },
  {
    id: "crypto",
    label: "Other cryptocurrency",
    short: "Crypto",
    description: "Shares an Ethereum or Litecoin wallet address.",
    fields: [
      { name: "coin", label: "Currency", kind: "select", options: [
        { value: "ethereum", label: "Ethereum (ETH)" },
        { value: "litecoin", label: "Litecoin (LTC)" },
      ] },
      { name: "address", label: "Wallet address", kind: "text", required: true, autoComplete: "off" },
      { name: "amount", label: "Amount (LTC)", kind: "number", inputMode: "decimal", showIf: (v) => v.coin === "litecoin" },
    ],
    defaults: { coin: "ethereum", address: "", amount: "" },
    build: (v): BuildResult => {
      const addr = s(v.address);
      const errors: Record<string, string> = {};
      const coin = s(v.coin) === "litecoin" ? "litecoin" : "ethereum";
      if (addr) {
        if (coin === "ethereum" && !/^0x[0-9a-fA-F]{40}$/.test(addr)) errors.address = "Ethereum addresses start with 0x followed by 40 hex characters.";
        if (coin === "litecoin" && !/^(ltc1[ac-hj-np-z02-9]{11,71}|[LM3][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(addr)) errors.address = "This doesn't match a Litecoin address format.";
      }
      if (coin === "litecoin" && s(v.amount) && !/^\d+(\.\d{1,8})?$/.test(s(v.amount))) errors.amount = "Use a number with up to 8 decimal places.";
      return result(errors, !addr, () => {
        if (coin === "ethereum") return `ethereum:${addr}`;
        return `litecoin:${addr}${s(v.amount) ? `?amount=${s(v.amount)}` : ""}`;
      }, ["Address format is checked, but not its checksum. Always double-check the address before sharing."]);
    },
  },
];

function coordsResult(v: Values, fmt: (lat: string, lng: string) => string): BuildResult {
  const lat = s(v.lat), lng = s(v.lng);
  const errors: Record<string, string> = {};
  const la = Number(lat), ln = Number(lng);
  if (lat && (!Number.isFinite(la) || la < -90 || la > 90)) errors.lat = "Latitude must be between -90 and 90.";
  if (lng && (!Number.isFinite(ln) || ln < -180 || ln > 180)) errors.lng = "Longitude must be between -180 and 180.";
  return result(errors, !lat || !lng, () => fmt(String(+la.toFixed(6)), String(+ln.toFixed(6))));
}

export const contentType = (id: string) => CONTENT_TYPES.find((t) => t.id === id);

export const isContentTypeId = (id: string): id is ContentTypeId => CONTENT_TYPES.some((t) => t.id === id);
