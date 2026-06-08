import type { RouteEntry } from "../router/types.ts";

// Returns the source code for an edge function that wraps a page or API route.
// This file is written to a temp location, then bundled with Bun.build().

export function generatePageEdgeFunction(entry: RouteEntry): string {
  return `
import { renderToString } from "freakjs/server";
import PageComponent, { metadata } from ${JSON.stringify(entry.filePath)};

export default async function handler(req) {
  const url = new URL(req.url);
  const vercelParams = req.vercelParams ?? {};
  const props = {
    params: vercelParams,
    searchParams: url.searchParams,
    url,
  };

  const vnode = PageComponent(props);
  const bodyHtml = renderToString(vnode);
  const title = metadata?.title ?? "FreakJS App";
  const description = metadata?.description ?? "";

  const html = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${title}</title>\${description ? \`\\n  <meta name="description" content="\${description}">\` : ""}
</head>
<body>
  <div id="__freakjs_root__">\${bodyHtml}</div>
</body>
</html>\`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export const config = { runtime: "edge" };
`;
}

export function generateApiEdgeFunction(entry: RouteEntry): string {
  return `
import * as mod from ${JSON.stringify(entry.filePath)};

const METHODS = ["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"];

export default async function handler(req) {
  const method = req.method.toUpperCase();
  const handler = mod[method];

  if (typeof handler !== "function") {
    const allowed = METHODS.filter((m) => typeof mod[m] === "function").join(", ");
    return new Response("Method Not Allowed", {
      status: 405,
      headers: allowed ? { Allow: allowed } : {},
    });
  }

  const url = new URL(req.url);
  const params = req.vercelParams ?? {};

  try {
    return await handler(req, params);
  } catch (err) {
    console.error("[FreakJS] Edge API error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const config = { runtime: "edge" };
`;
}

export const VC_CONFIG = JSON.stringify(
  { runtime: "edge", handler: "index.js", launcherType: "Nodejs" },
  null,
  2,
);
