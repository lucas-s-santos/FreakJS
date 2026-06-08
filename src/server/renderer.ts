import { renderToString } from "../jsx/server.ts";
import { HMR_CLIENT_SCRIPT } from "./hmr.ts";
import { ROOT_ELEMENT_ID } from "../shared/constants.ts";
import type { RouteMatch, PageProps, PageModule } from "../router/types.ts";

export interface RenderOptions {
  dev: boolean;
  projectRoot: string;
}

export async function renderPage(
  match: RouteMatch,
  req: Request,
  opts: RenderOptions,
): Promise<Response> {
  let mod: PageModule;
  try {
    mod = await import(match.entry.filePath) as PageModule;
  } catch (err) {
    console.error("[FreakJS] Failed to import page:", match.entry.filePath, err);
    return errorResponse(500, "Failed to load page module");
  }

  if (typeof mod.default !== "function") {
    return errorResponse(500, `Page at ${match.entry.routePath} has no default export`);
  }

  const props: PageProps = {
    params: match.params,
    searchParams: match.searchParams,
    url: new URL(req.url),
  };

  let bodyHtml: string;
  try {
    const vnode = mod.default(props);
    bodyHtml = renderToString(vnode as Parameters<typeof renderToString>[0]);
  } catch (err) {
    const msg = opts.dev
      ? `<pre style="color:red;padding:1rem">${String(err)}</pre>`
      : "Internal Server Error";
    if (opts.dev) {
      console.error("[FreakJS] SSR error:", err);
      bodyHtml = msg;
    } else {
      return errorResponse(500, "Internal Server Error");
    }
  }

  const meta = mod.metadata ?? {};
  const title = meta.title ?? "FreakJS App";
  const description = meta.description ?? "";
  const propsJson = JSON.stringify(props.params);

  const html = buildHtmlShell({
    title,
    description,
    bodyHtml: bodyHtml!,
    propsJson,
    hmrScript: opts.dev ? HMR_CLIENT_SCRIPT : "",
  });

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

interface ShellOptions {
  title: string;
  description: string;
  bodyHtml: string;
  propsJson: string;
  hmrScript: string;
}

export function buildHtmlShell(opts: ShellOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title}</title>${opts.description ? `\n  <meta name="description" content="${opts.description}">` : ""}
</head>
<body>
  <div id="${ROOT_ELEMENT_ID}">${opts.bodyHtml}</div>
  <script>window.__FREAKJS_PROPS__=${opts.propsJson}</script>
  ${opts.hmrScript}
</body>
</html>`;
}

function errorResponse(status: number, message: string): Response {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
