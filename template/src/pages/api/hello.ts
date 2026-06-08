export async function GET(req: Request): Promise<Response> {
  return Response.json({ message: "Hello from FreakJS!", url: req.url });
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  return Response.json({ received: body }, { status: 201 });
}
