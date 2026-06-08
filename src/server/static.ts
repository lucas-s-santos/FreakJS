import { mimeType } from "../shared/utils.ts";

export async function serveStatic(
  urlPath: string,
  publicDir: string,
): Promise<Response | null> {
  // Prevent path traversal
  if (urlPath.includes("..")) return null;
  const safePath = urlPath.replace(/\/+/g, "/");

  const filePath = `${publicDir}${safePath}`;
  const file = Bun.file(filePath);

  if (!(await file.exists())) return null;

  return new Response(file, {
    headers: { "Content-Type": mimeType(filePath) },
  });
}
