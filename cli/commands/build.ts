import { parseArgs } from "util";
import { resolve } from "node:path";
import { runBuild } from "../../src/build/compiler.ts";

export async function build(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      target: { type: "string", default: "vercel" },
      outdir: { type: "string" },
    },
    strict: false,
  });

  if (values.target !== "vercel") {
    console.error(`[FreakJS] Unsupported target: "${values.target}". Only "vercel" is supported in this version.`);
    process.exit(1);
  }

  const projectRoot = resolve(process.cwd());

  await runBuild({
    projectRoot,
    target: "vercel",
    outdir: values.outdir as string | undefined,
  });
}
