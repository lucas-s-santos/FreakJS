import type { ApiModule } from "./types.ts";

export async function dispatchApiRoute(
  mod: ApiModule,
  req: Request,
  params: Record<string, string>,
): Promise<Response> {
  const method = req.method.toUpperCase() as keyof ApiModule;
  const handler = mod[method];

  if (typeof handler !== "function") {
    const allowed = (["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"] as const)
      .filter((m) => typeof mod[m] === "function")
      .join(", ");
    return new Response("Method Not Allowed", {
      status: 405,
      headers: allowed ? { Allow: allowed } : {},
    });
  }

  try {
    return await handler(req, params);
  } catch (err) {
    console.error("[FreakJS] API route error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
