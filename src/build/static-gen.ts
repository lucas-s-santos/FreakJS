import { renderToString } from "../jsx/server.ts";
import { buildHtmlShell } from "../server/renderer.ts";
import type { RouteEntry, PageModule, PageProps } from "../router/types.ts";

export async function renderStaticPage(entry: RouteEntry): Promise<string> {
  let mod: PageModule;
  try {
    mod = await import(entry.filePath) as PageModule;
  } catch (err) {
    throw new Error(`Failed to import page module: ${entry.filePath}\n${err}`);
  }

  if (typeof mod.default !== "function") {
    throw new Error(`Page ${entry.routePath} has no default export`);
  }

  const props: PageProps = {
    params: {},
    searchParams: new URLSearchParams(),
    url: new URL("http://localhost" + entry.routePath),
  };

  const vnode = mod.default(props);
  const bodyHtml = renderToString(vnode as Parameters<typeof renderToString>[0]);
  const meta = mod.metadata ?? {};

  return buildHtmlShell({
    title: meta.title ?? "FreakJS App",
    description: meta.description ?? "",
    bodyHtml,
    propsJson: "{}",
    hmrScript: "",
  });
}
