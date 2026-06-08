import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { RouteEntry, RouteManifest } from "./types.ts";
import { normalizePath } from "../shared/utils.ts";

const PAGE_EXTENSIONS = /\.(tsx?|jsx?)$/;

export async function scanPages(pagesDir: string): Promise<RouteManifest> {
  const entries: RouteEntry[] = [];
  walkDir(pagesDir, pagesDir, entries);
  entries.sort(routePriority);
  return { entries };
}

function walkDir(root: string, dir: string, acc: RouteEntry[]): void {
  let items: string[];
  try {
    items = readdirSync(dir);
  } catch {
    return; // pages dir doesn't exist yet — that's fine
  }

  for (const name of items) {
    const fullPath = join(dir, name);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(root, fullPath, acc);
    } else if (PAGE_EXTENSIONS.test(name)) {
      const entry = filePathToRoute(root, fullPath);
      if (entry) acc.push(entry);
    }
  }
}

function filePathToRoute(root: string, fullPath: string): RouteEntry | null {
  // Strip root prefix and normalize
  let rel = normalizePath(fullPath)
    .slice(normalizePath(root).length)
    .replace(PAGE_EXTENSIONS, "");

  const isApi = rel.startsWith("/api/");
  const kind = isApi ? "api" : "page" as const;

  const segments = rel.split("/").filter(Boolean);
  const paramNames: string[] = [];
  let isDynamic = false;
  let isCatchAll = false;

  const urlSegments = segments.map((seg) => {
    const catchAllMatch = seg.match(/^\[\.\.\.(.+)\]$/);
    if (catchAllMatch) {
      isCatchAll = true;
      isDynamic = true;
      paramNames.push(catchAllMatch[1]);
      return `:${catchAllMatch[1]}*`;
    }
    const dynamicMatch = seg.match(/^\[(.+)\]$/);
    if (dynamicMatch) {
      isDynamic = true;
      paramNames.push(dynamicMatch[1]);
      return `:${dynamicMatch[1]}`;
    }
    if (seg === "index") return null; // collapse to parent path
    return seg;
  });

  // Filter nulls (index segments) and build path
  const filtered = urlSegments.filter((s) => s !== null) as string[];
  const routePath = "/" + filtered.join("/");

  // Build URLPattern string — catch-all needs wildcard at the end
  let patternPath = routePath;
  if (isCatchAll) {
    // URLPattern supports /:param* but we already have the segment, just ensure
    // the trailing wildcard syntax is correct
    patternPath = routePath;
  }

  let urlPattern: URLPattern;
  try {
    urlPattern = new URLPattern({ pathname: patternPath });
  } catch {
    return null;
  }

  return {
    filePath: normalizePath(fullPath),
    urlPattern,
    isDynamic,
    isCatchAll,
    kind,
    paramNames,
    routePath,
  };
}

function routePriority(a: RouteEntry, b: RouteEntry): number {
  // Catch-all last, then dynamic, then static
  if (a.isCatchAll !== b.isCatchAll) return a.isCatchAll ? 1 : -1;
  if (a.isDynamic !== b.isDynamic) return a.isDynamic ? 1 : -1;
  return a.routePath.localeCompare(b.routePath);
}
