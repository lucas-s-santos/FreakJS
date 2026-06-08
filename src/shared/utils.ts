import { join, normalize, sep } from "node:path";

export function normalizePath(p: string): string {
  return normalize(p).replace(/\\/g, "/");
}

export function joinPath(...parts: string[]): string {
  return normalizePath(join(...parts));
}

export const MIME_TYPES: Record<string, string> = {
  ".html":  "text/html; charset=utf-8",
  ".css":   "text/css",
  ".js":    "application/javascript",
  ".mjs":   "application/javascript",
  ".json":  "application/json",
  ".png":   "image/png",
  ".jpg":   "image/jpeg",
  ".jpeg":  "image/jpeg",
  ".gif":   "image/gif",
  ".svg":   "image/svg+xml",
  ".ico":   "image/x-icon",
  ".webp":  "image/webp",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
  ".ttf":   "font/ttf",
  ".txt":   "text/plain",
  ".xml":   "application/xml",
};

export function mimeType(filePath: string): string {
  const ext = filePath.match(/\.[^./\\]+$/)?.[0]?.toLowerCase() ?? "";
  return MIME_TYPES[ext] ?? "application/octet-stream";
}

// Simple FNV-1a 32-bit hash — fast, good enough for asset cache busting
export function hashString(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

// Debounce: collapse rapid successive calls into one after `ms` quiet time
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
