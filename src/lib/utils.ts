import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProxyFormat } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function countryCodeToFlag(isoCode: string): string {
  if (!isoCode || isoCode.length !== 2) {
    return "";
  }
  // The formula converts a letter's char code into its regional indicator symbol equivalent.
  // 'A' (65) -> Regional Indicator A (0x1F1E6)
  return String.fromCodePoint(
    isoCode.toUpperCase().charCodeAt(0) - 65 + 0x1f1e6,
    isoCode.toUpperCase().charCodeAt(1) - 65 + 0x1f1e6
  );
}

export function normalizeProxy(raw: string): string | null {
  const trimmed = raw.trim();

  // Remove protocol prefix if present
  const clean = trimmed.replace(/^(http|https?|socks5?|socks4):\/\//i, "");

  // user:pass@host:port
  const match1 = clean.match(/^([^:@\s]+):([^:@\s]+)@([a-zA-Z0-9.-]+):(\d+)$/);
  if (match1) {
    return `${match1[1]}:${match1[2]}@${match1[3]}:${match1[4]}`;
  }

  // host:port:user:pass
  const match2 = clean.match(/^([a-zA-Z0-9.-]+):(\d+):([^:@\s]+):([^:@\s]+)$/);
  if (match2) {
    return `${match2[3]}:${match2[4]}@${match2[1]}:${match2[2]}`;
  }

  // user:pass:host:port
  const match3 = clean.match(/^([^:@\s]+):([^:@\s]+):([a-zA-Z0-9.-]+):(\d+)$/);
  if (match3) {
    return `${match3[1]}:${match3[2]}@${match3[3]}:${match3[4]}`;
  }

  // host:port (IP or domain)
  const match4 = clean.match(/^([a-zA-Z0-9.-]+):(\d+)$/);
  if (match4) {
    return `${match4[1]}:${match4[2]}`;
  }

  // Unknown format
  console.log("Unknown proxy format:", raw);
  return null;
}
