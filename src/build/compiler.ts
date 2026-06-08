import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { scanPages } from "../router/scanner.ts";
import { renderStaticPage } from "./static-gen.ts";
import { bundleEdgeFunction } from "./bundler.ts";
import {
  generatePageEdgeFunction,
  generateApiEdgeFunction,
  VC_CONFIG,
} from "./edge-function.ts";
import {
  writeVercelConfig,
  writeStaticHtml,
  writeEdgeFunction,
  copyPublicDir,
} from "./vercel-output.ts";
import {
  PAGES_DIR,
  PUBLIC_DIR,
  VERCEL_OUTPUT_DIR,
  BUILD_DIR,
} from "../shared/constants.ts";
import type { RouteEntry } from "../router/types.ts";

export interface BuildOptions {
  projectRoot: string;
  target?: "vercel";
  outdir?: string;
}

export async function runBuild(opts: BuildOptions): Promise<void> {
  const { projectRoot } = opts;
  const outputDir = join(projectRoot, opts.outdir ?? VERCEL_OUTPUT_DIR);
  const pagesDir = join(projectRoot, PAGES_DIR);
  const publicDir = join(projectRoot, PUBLIC_DIR);
  const tmpDir = join(projectRoot, BUILD_DIR, "tmp");

  console.log("[FreakJS] Scanning routes...");
  const manifest = await scanPages(pagesDir);

  if (manifest.entries.length === 0) {
    console.warn("[FreakJS] No pages found in", pagesDir);
  }

  // Clean previous output
  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true });
  }
  mkdirSync(join(outputDir, "static", "_freakjs"), { recursive: true });
  mkdirSync(join(outputDir, "functions"), { recursive: true });
  mkdirSync(tmpDir, { recursive: true });

  const staticEntries: RouteEntry[] = [];
  const edgeEntries: RouteEntry[] = [];

  // Classify routes
  for (const entry of manifest.entries) {
    if (classifyRoute(entry, projectRoot) === "static") {
      staticEntries.push(entry);
    } else {
      edgeEntries.push(entry);
    }
  }

  // Generate static HTML
  console.log(`[FreakJS] Rendering ${staticEntries.length} static page(s)...`);
  for (const entry of staticEntries) {
    try {
      const html = await renderStaticPage(entry);
      writeStaticHtml(outputDir, entry.routePath, html);
      console.log(`  ✓ ${entry.routePath}`);
    } catch (err) {
      console.error(`  ✗ ${entry.routePath}:`, err);
    }
  }

  // Generate edge functions
  console.log(`[FreakJS] Building ${edgeEntries.length} edge function(s)...`);
  for (const entry of edgeEntries) {
    try {
      const src = entry.kind === "api"
        ? generateApiEdgeFunction(entry)
        : generatePageEdgeFunction(entry);

      const tmpEntry = join(tmpDir, `edge-${sanitizeName(entry.routePath)}.ts`);
      writeFileSync(tmpEntry, src, "utf-8");

      const tmpOut = join(tmpDir, `out-${sanitizeName(entry.routePath)}`);
      mkdirSync(tmpOut, { recursive: true });

      await bundleEdgeFunction(tmpEntry, tmpOut);

      const bundlePath = join(tmpOut, "index.js");
      writeEdgeFunction(outputDir, entry.routePath, bundlePath, VC_CONFIG);
      console.log(`  ✓ ${entry.routePath} → edge`);
    } catch (err) {
      console.error(`  ✗ ${entry.routePath}:`, err);
    }
  }

  // Copy public/ assets
  copyPublicDir(publicDir, join(outputDir, "static"));

  // Write config.json
  writeVercelConfig(outputDir, staticEntries, edgeEntries);

  console.log(`\n[FreakJS] Build complete → ${outputDir}`);
  printSummary(staticEntries, edgeEntries);
}

function classifyRoute(entry: RouteEntry, projectRoot: string): "static" | "edge" {
  if (entry.kind === "api") return "edge";
  if (entry.isDynamic || entry.isCatchAll) return "edge";

  return "static";
}

function sanitizeName(routePath: string): string {
  return routePath.replace(/[^a-zA-Z0-9]/g, "_").replace(/^_+/, "");
}

function printSummary(staticEntries: RouteEntry[], edgeEntries: RouteEntry[]): void {
  const rows = [
    ...staticEntries.map((e) => ({ route: e.routePath, type: "static" })),
    ...edgeEntries.map((e) => ({ route: e.routePath, type: e.kind === "api" ? "api (edge)" : "edge" })),
  ].sort((a, b) => a.route.localeCompare(b.route));

  const maxLen = Math.max(...rows.map((r) => r.route.length), 5);
  console.log("\nRoute".padEnd(maxLen + 2) + "Type");
  console.log("-".repeat(maxLen + 12));
  for (const row of rows) {
    console.log(row.route.padEnd(maxLen + 2) + row.type);
  }
}
