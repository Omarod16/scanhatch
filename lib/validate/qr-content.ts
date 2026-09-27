/**
 * Validates the decoded content of a QR code: detects the payload type from its
 * prefix and checks it against that format's rules. "Valid" means well-formed,
 * never "safe": a correctly formatted link can still lead somewhere malicious.
 */
import { httpUrl, type PayloadKind } from "@/lib/scanner/parse";

export type Level = "ok" | "warn" | "error" | "info";
export interface ContentCheck {
  level: Level;
  message: string;
}
export interface ContentValidation {
  type: PayloadKind;
  typeLabel: string;
  checks: ContentCheck[];
  errors: number;
  warnings: number;
}

const LABELS: Record<PayloadKind, string> = {
  url: "Web link", wifi: "WiFi network", email: "Email", phone: "Phone number", sms: "Text message (SMS)",
  vcard: "Contact card (vCard)", contact: "Contact (MeCard)", location: "Location", event: "Calendar event",
  payment: "Payment request", text: "Plain text",
};

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc", "rb.gy"];

function unescapedSplit(s: string) {
  const out: Record<string, string> = {};
  let cur = "";
  const parts: string[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) { cur += s[++i]; continue; }
    if (s[i] === ";") { parts.push(cur); cur = ""; continue; }
    cur += s[i];
  }
  if (cur) parts.push(cur);
  for (const p of parts) {
    const i = p.indexOf(":");
    if (i > 0 && !(p.slice(0, i).toUpperCase() in out)) out[p.slice(0, i).toUpperCase()] = p.slice(i + 1);
  }
  return out;
}

const phoneOk = (n: string) => /^\+?[\d\s().-]+$/.test(n) && (() => { const d = n.replace(/\D/g, "").length; return d >= 3 && d <= 15; })();

function icsDate(v: string): Date | null {
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0)));
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? d : null;
}

function lines(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
}
const prop = (ls: string[], name: string) => ls.filter((l) => l.toUpperCase().startsWith(name + ":") || l.toUpperCase().startsWith(name + ";")).map((l) => l.slice(l.indexOf(":") + 1));

export function validateQrContent(raw: string): ContentValidation {
  const text = raw.replace(/^\uFEFF/, "");
  const t = text.trim();
  const checks: ContentCheck[] = [];
  const ok = (m: string) => checks.push({ level: "ok", message: m });
  const warn = (m: string) => checks.push({ level: "warn", message: m });
  const err = (m: string) => checks.push({ level: "error", message: m });
  const note = (m: string) => checks.push({ level: "info", message: m });
  let type: PayloadKind = "text";

  if (!t) {
    err("The QR code is empty.");
  } else if (/^https?:/i.test(t)) {
    type = "url";
    const u = httpUrl(t);
    if (!u) err("This starts like a web link but isn't a valid web address (it may be incomplete or contain spaces).");
    else {
      ok(`Valid web address for ${u.hostname}.`);
      if (u.protocol === "http:") warn("The link isn't encrypted (http rather than https). Some browsers show a warning, and data sent to it can be intercepted.");
      else ok("Uses https (encrypted connection).");
      if (u.username || u.password) warn("The address contains login details before the domain, a common trick to disguise where a link really goes.");
      if (u.hostname.split(".").some((p) => p.startsWith("xn--"))) warn("The domain uses international characters, which can imitate familiar sites. Check it carefully.");
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname) || u.hostname.startsWith("[")) warn("The link uses a numeric IP address instead of a domain name, which legitimate sites rarely do.");
      else if (!u.hostname.includes(".") ) warn("The address has no domain ending (like .com), so it will only work on a local network.");
      if (SHORTENERS.includes(u.hostname.replace(/^www\./, ""))) note("This is a link shortener, so the final destination is hidden until it's opened.");
      if (t.length > 300) note(`The link is ${t.length} characters long, which makes the QR code denser and harder to scan. A shorter link helps.`);
    }
  } else if (/^WIFI:/i.test(t)) {
    type = "wifi";
    const f = unescapedSplit(t.slice(5));
    const ssid = f.S ?? "";
    const sec = (f.T ?? "").toUpperCase();
    const pw = f.P ?? "";
    if (!ssid) err("The network name (S:) is missing, so phones can't join the network.");
    else if (new TextEncoder().encode(ssid).length > 32) err("The network name is longer than 32 bytes, the maximum WiFi allows.");
    else ok(`Network name: ${ssid}`);
    if (!["", "WPA", "WPA2", "WPA3", "SAE", "WEP", "NOPASS"].includes(sec)) warn(`Unknown security type "${f.T}". Phones expect WPA, WEP or nopass.`);
    if (sec === "" || sec === "NOPASS") {
      if (pw) warn("A password is included but the security type is open (nopass), so phones will ignore the password.");
      else ok("Open network (no password).");
    } else if (["WPA", "WPA2", "WPA3", "SAE"].includes(sec)) {
      if (!pw) err("The security type needs a password, but none is included.");
      else if (pw.length === 64 && /^[0-9a-f]+$/i.test(pw)) ok("Password is a 64-character hex key.");
      else if (pw.length < 8 || pw.length > 63) err(`WPA passwords must be 8–63 characters. This one is ${pw.length}.`);
      else ok("Password length is valid for WPA.");
    } else if (sec === "WEP") {
      if (!(pw.length === 5 || pw.length === 13 || ([10, 26].includes(pw.length) && /^[0-9a-f]+$/i.test(pw)))) warn("WEP keys are normally 5 or 13 characters, or 10 or 26 hex digits.");
      warn("WEP is an obsolete, insecure type of WiFi security. Newer phones may refuse to connect.");
    }
    if (f.H && !/^(true|false)$/i.test(f.H)) warn(`Hidden-network flag should be true or false, not "${f.H}".`);
    if (!t.endsWith(";;") && !t.endsWith(";")) warn("WiFi codes should end with ;; — some phones may not read the last field.");
  } else if (/^mailto:/i.test(t)) {
    type = "email";
    const [addr, q = ""] = t.slice(7).split("?");
    const list = decodeURIComponent(addr).split(",").map((a) => a.trim()).filter(Boolean);
    if (!list.length) err("No email address after mailto:.");
    list.forEach((a) => (EMAIL_RE.test(a) ? ok(`Valid email address: ${a}`) : err(`"${a}" isn't a valid email address.`)));
    const keys = [...new URLSearchParams(q).keys()].map((k) => k.toLowerCase());
    const unknown = keys.filter((k) => !["subject", "body", "cc", "bcc"].includes(k));
    if (unknown.length) warn(`Unrecognised email fields: ${unknown.join(", ")}.`);
  } else if (/^MATMSG:/i.test(t)) {
    type = "email";
    const f = unescapedSplit(t.slice(7));
    if (!f.TO) err("No recipient (TO:) in the email code.");
    else if (EMAIL_RE.test(f.TO)) ok(`Valid email address: ${f.TO}`);
    else err(`"${f.TO}" isn't a valid email address.`);
  } else if (/^tel:/i.test(t)) {
    type = "phone";
    const n = t.slice(4).trim();
    if (!phoneOk(n)) err(`"${n}" isn't a valid phone number (3–15 digits, optionally starting with +).`);
    else {
      ok(`Valid phone number: ${n}`);
      if (!n.startsWith("+")) note("No country code (+…). It will only dial correctly from phones in the same country.");
    }
  } else if (/^(smsto|sms):/i.test(t)) {
    type = "sms";
    let n: string, msg = "";
    if (/^smsto:/i.test(t)) { const rest = t.slice(6); const i = rest.indexOf(":"); n = i >= 0 ? rest.slice(0, i) : rest; msg = i >= 0 ? rest.slice(i + 1) : ""; }
    else { const [a, q = ""] = t.slice(4).split("?"); n = a; msg = new URLSearchParams(q).get("body") ?? ""; }
    if (!phoneOk(n)) err(`"${n}" isn't a valid phone number.`);
    else ok(`Valid phone number: ${n}`);
    if (msg.length > 160) note("The message is over 160 characters, so it may be sent as several texts.");
  } else if (/^BEGIN:VCARD/i.test(t)) {
    type = "vcard";
    const ls = lines(t);
    if (!/^END:VCARD$/i.test(ls.at(-1) ?? "")) err("The contact card is incomplete: END:VCARD is missing, so phones may not import it.");
    const ver = prop(ls, "VERSION")[0];
    if (!ver) warn("VERSION is missing. Phones usually cope, but vCards should state 2.1, 3.0 or 4.0.");
    else if (!["2.1", "3.0", "4.0"].includes(ver)) warn(`Unusual vCard version "${ver}".`);
    const fn = prop(ls, "FN")[0];
    const n = prop(ls, "N")[0];
    if (!fn && !n) err("The contact has no name (FN or N).");
    else if (!fn && ver !== "2.1") warn("The formatted name (FN) is missing; it's required in vCard 3.0 and 4.0.");
    else ok(`Name: ${fn ?? n!.split(";").filter(Boolean).reverse().join(" ")}`);
    prop(ls, "EMAIL").forEach((e) => (EMAIL_RE.test(e) ? ok(`Valid email: ${e}`) : warn(`"${e}" doesn't look like a valid email address.`)));
    prop(ls, "TEL").forEach((p) => (phoneOk(p) ? ok(`Phone: ${p}`) : warn(`"${p}" doesn't look like a valid phone number.`)));
  } else if (/^MECARD:/i.test(t)) {
    type = "contact";
    const f = unescapedSplit(t.slice(7));
    if (!f.N) err("The contact has no name (N:).");
    else ok(`Name: ${f.N.split(",").reverse().join(" ").trim()}`);
    if (f.EMAIL && !EMAIL_RE.test(f.EMAIL)) warn(`"${f.EMAIL}" doesn't look like a valid email address.`);
    if (f.TEL && !phoneOk(f.TEL)) warn(`"${f.TEL}" doesn't look like a valid phone number.`);
    if (!t.endsWith(";;")) warn("MeCard codes should end with ;;.");
  } else if (/^geo:/i.test(t)) {
    type = "location";
    const m = t.match(/^geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,-?\d+(?:\.\d+)?)?(?:[;?].*)?$/i);
    if (!m) err("The location isn't in the expected geo:latitude,longitude format.");
    else {
      const lat = +m[1], lng = +m[2];
      if (Math.abs(lat) > 90) err(`Latitude ${lat} is out of range (−90 to 90).`);
      if (Math.abs(lng) > 180) err(`Longitude ${lng} is out of range (−180 to 180).`);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) ok(`Valid coordinates: ${lat}, ${lng}`);
      if (lat === 0 && lng === 0) warn("Coordinates 0, 0 are in the Atlantic Ocean. This is often a placeholder.");
    }
  } else if (/^BEGIN:(VEVENT|VCALENDAR)/i.test(t)) {
    type = "event";
    const ls = lines(t);
    if (!ls.some((l) => /^END:VEVENT$/i.test(l))) err("The event is incomplete: END:VEVENT is missing.");
    const sum = prop(ls, "SUMMARY")[0];
    if (!sum) warn("The event has no title (SUMMARY).");
    else ok(`Event: ${sum}`);
    const ds = prop(ls, "DTSTART")[0];
    const de = prop(ls, "DTEND")[0];
    const s = ds ? icsDate(ds) : null;
    const e = de ? icsDate(de) : null;
    if (!ds) err("The start time (DTSTART) is missing.");
    else if (!s) err(`The start time "${ds}" isn't a valid date.`);
    else ok("Start time is a valid date.");
    if (de && !e) err(`The end time "${de}" isn't a valid date.`);
    if (s && e && e < s) err("The event ends before it starts.");
  } else if (/^(bitcoin|ethereum|litecoin):/i.test(t)) {
    type = "payment";
    const addr = t.split(":")[1]?.split("?")[0] ?? "";
    if (!addr) err("No wallet address in the payment request.");
    else note("Payment request detected. ScanHatch can't verify who a wallet address belongs to; check it before sending money.");
  } else {
    if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(\/\S*)?$/i.test(t)) {
      warn("This looks like a web address without https://. Many phone cameras show it as plain text instead of a link. Add https:// at the start.");
    } else if (/^[a-z][a-z0-9+.-]*:/i.test(t) && !/\s/.test(t.slice(0, 20))) {
      note(`Starts with "${t.split(":")[0]}:", which may be an app-specific link. Phones open it only if a matching app is installed.`);
    } else ok(`Plain text, ${[...t].length} characters.`);
    // eslint-disable-next-line no-control-regex
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(t)) warn("Contains invisible control characters.");
  }

  return {
    type, typeLabel: LABELS[type], checks,
    errors: checks.filter((c) => c.level === "error").length,
    warnings: checks.filter((c) => c.level === "warn").length,
  };
}
