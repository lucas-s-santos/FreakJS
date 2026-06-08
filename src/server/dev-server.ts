import { watch } from "node:fs";
import { join, resolve } from "node:path";
import { scanPages } from "../router/scanner.ts";
import { matchRoute } from "../router/matcher.ts";
import { dispatchApiRoute } from "../router/api-handler.ts";
import { renderPage } from "./renderer.ts";
import { serveStatic } from "./static.ts";
import { setupHmr } from "./hmr.ts";
import { debounce } from "../shared/utils.ts";
import {
  PAGES_DIR,
  PUBLIC_DIR,
  HMR_PATH,
  ASSETS_PATH,
  DEFAULT_PORT,
} from "../shared/constants.ts";
import type { ApiModule } from "../router/types.ts";

export async function startDevServer(
  projectRoot: string,
  port: number = DEFAULT_PORT,
): Promise<void> {
  const pagesDir = join(projectRoot, PAGES_DIR);
  const publicDir = join(projectRoot, PUBLIC_DIR);

  let manifest = await scanPages(pagesDir);
  const { broadcastReload, websocket } = setupHmr();

  // Watch src/ for changes and re-scan + notify clients
  const srcDir = join(projectRoot, "src");
  const handleChange = debounce(async (filename: string) => {
    manifest = await scanPages(pagesDir);
    broadcastReload({ path: filename });
  }, 50) as (f: string) => void;

  try {
    watch(srcDir, { recursive: true }, (_event, filename) => {
      handleChange(filename ?? "unknown");
    });
  } catch {
    // watch may fail if src/ doesn't exist yet
  }

  const server = Bun.serve({
    port,
    websocket,

    async fetch(req, server) {
      const url = new URL(req.url);
      const path = url.pathname;

      // WebSocket upgrade for HMR
      if (path === HMR_PATH) {
        if (server.upgrade(req)) return undefined;
        return new Response("WebSocket upgrade failed", { status: 400 });
      }

      // FreakJS dev assets (reserved prefix)
      if (path.startsWith(ASSETS_PATH + "/")) {
        return new Response("Not found", { status: 404 });
      }

      // public/ static files
      const staticRes = await serveStatic(path, publicDir);
      if (staticRes) return staticRes;

      // Route matching
      const match = matchRoute(manifest, url);

      if (!match) {
        return new Response(notFoundHtml(path), {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      if (match.entry.kind === "api") {
        const mod = await import(match.entry.filePath) as ApiModule;
        return dispatchApiRoute(mod, req, match.params);
      }

      return renderPage(match, req, { dev: true, projectRoot });
    },
  });

  console.log(`\n  FreakJS dev server\n  → http://localhost:${server.port}\n`);
}

function notFoundHtml(path: string): string {
  return `<!DOCTYPE html><html><head><title>404 — FreakJS</title></head><body>
<h1>404 — Page not found</h1><p><code>${path}</code></p>
</body></html>`;
}
