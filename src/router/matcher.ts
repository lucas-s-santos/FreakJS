import type { RouteManifest, RouteMatch } from "./types.ts";

export function matchRoute(
  manifest: RouteManifest,
  url: URL,
): RouteMatch | null {
  for (const entry of manifest.entries) {
    const result = entry.urlPattern.exec(url);
    if (!result) continue;

    const params: Record<string, string> = {};
    const groups = result.pathname.groups;

    for (const name of entry.paramNames) {
      const val = groups[name];
      if (val !== undefined) {
        // Decode and strip trailing wildcard marker from catch-all
        params[name] = decodeURIComponent(String(val).replace(/\*$/, ""));
      }
    }

    return { entry, params, searchParams: url.searchParams };
  }
  return null;
}
