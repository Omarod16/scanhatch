import Link from "next/link";
import { Fragment, type ReactNode } from "react";

const TOKEN = /\[([^\]]+)\]\((\/[^)\s]*)\)|`([^`]+)`/g;

/** Renders the inline syntax as React elements. Only internal links are allowed. */
export function Inline({ text }: { text: string }): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      const href = m[2];
      if (!href.startsWith("/") || href.startsWith("//")) throw new Error(`Only internal links are allowed in articles: ${href}`);
      out.push(<Link key={m.index} href={href}>{m[1]}</Link>);
    } else {
      out.push(<code key={m.index} className="rounded bg-panel px-1.5 py-0.5 font-mono text-[0.9em] text-white">{m[3]}</code>);
    }
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}

/** Plain text of an inline string (for word counts and similarity checks). */
export const plainText = (text: string) => text.replace(TOKEN, (_m, label, _h, code) => label ?? code);

/** Internal links used in a string. */
export const linksIn = (text: string) => [...text.matchAll(TOKEN)].filter((m) => m[2]).map((m) => m[2] as string);
