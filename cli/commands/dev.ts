import { parseArgs } from "util";
import { resolve } from "node:path";
import { startDevServer } from "../../src/server/dev-server.ts";
import { DEFAULT_PORT } from "../../src/shared/constants.ts";

export async function dev(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      port: { type: "string", short: "p", default: String(DEFAULT_PORT) },
    },
    strict: false,
  });

  const port = parseInt(values.port as string, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error("[FreakJS] Invalid port:", values.port);
    process.exit(1);
  }

  const projectRoot = resolve(process.cwd());
  await startDevServer(projectRoot, port);
}
