import { mkdirSync, writeFileSync, copyFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import type { RouteEntry } from "../router/types.ts";

export interface VercelConfig {
  version: 3;
  routes: VercelRoute[];
}

interface VercelRoute {
  src: string;
  dest?: string;
  headers?: Record<string, string>;
  status?: number;
}

export function writeVercelConfig(
  outputDir: string,
  staticRoutes: RouteEntry[],
  edgeRoutes: RouteEntry[],
): void {
  const routes: VercelRoute[] = [];

  // Static assets under /_freakjs/
  routes.push({ src: "/_freakjs/(.*)", dest: "/static/_freakjs/$1" });

  // public/ files served from /static/
  routes.push({ src: "/favicon.ico", dest: "/static/favicon.ico" });

  // Static page routes
  for (const entry of staticRoutes) {
    const htmlFile = routePathToHtmlFile(entry.routePath);
    routes.push({ src: escapeForVercel(entry.routePath), dest: `/static/${htmlFile}` });
  }

  // Edge function routes
  for (const entry of edgeRoutes) {
    const fnName = routePathToFuncName(entry.routePath);
    const srcPattern = routePathToVercelPattern(entry.routePath);
    routes.push({ src: srcPattern, dest: `/functions/${fnName}` });
  }

  const config: VercelConfig = { version: 3, routes };
  const configPath = join(outputDir, "config.json");
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function writeStaticHtml(
  outputDir: string,
  routePath: string,
  html: string,
): void {
  const htmlFile = routePathToHtmlFile(routePath);
  const dest = join(outputDir, "static", htmlFile);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html, "utf-8");
}

export function writeEdgeFunction(
  outputDir: string,
  routePath: string,
  bundleSourcePath: string,
  vcConfig: string,
): void {
  const fnName = routePathToFuncName(routePath);
  const funcDir = join(outputDir, "functions", `${fnName}.func`);
  mkdirSync(funcDir, { recursive: true });
  writeFileSync(join(funcDir, ".vc-config.json"), vcConfig, "utf-8");
  copyFileSync(bundleSourcePath, join(funcDir, "index.js"));
}

export function copyPublicDir(publicDir: string, staticOutputDir: string): void {
  if (!existsSync(publicDir)) return;
  copyDirRecursive(publicDir, staticOutputDir);
}

function copyDirRecursive(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    const srcPath = join(src, name);
    const destPath = join(dest, name);
    if (statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function routePathToHtmlFile(routePath: string): string {
  if (routePath === "/") return "index.html";
  return routePath.replace(/^\//, "") + ".html";
}

function routePathToFuncName(routePath: string): string {
  // /blog/:slug → blog/[slug]
  return routePath
    .replace(/^\//, "")
    .replace(/:(\w+)\*/g, "[...$1]")
    .replace(/:(\w+)/g, "[$1]");
}

function routePathToVercelPattern(routePath: string): string {
  // /blog/:slug → /blog/(?<slug>[^/]+)
  return "^" + routePath
    .replace(/:(\w+)\*/g, "(?<$1>.*)")
    .replace(/:(\w+)/g, "(?<$1>[^/]+)") + "(/.*)?$";
}

function escapeForVercel(routePath: string): string {
  return "^" + routePath.replace(/\//g, "\\/") + "$";
}
