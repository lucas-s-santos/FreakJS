import { hashString } from "../shared/utils.ts";

export interface ClientBundleResult {
  outputPath: string;
  hash: string;
  sizeByes: number;
}

export async function bundleClientScript(
  entryFilePath: string,
  outDir: string,
  pageId: string,
): Promise<ClientBundleResult> {
  const hash = hashString(entryFilePath + Date.now());

  const result = await Bun.build({
    entrypoints: [entryFilePath],
    outdir: outDir,
    target: "browser",
    format: "esm",
    minify: true,
    naming: `page.${pageId}.${hash}.[ext]`,
    define: {
      "process.env.NODE_ENV": '"production"',
      "__FREAKJS_DEV__": "false",
    },
  });

  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error(`Bundle failed for: ${entryFilePath}`);
  }

  const output = result.outputs[0];
  return {
    outputPath: output.path,
    hash,
    sizeByes: output.size,
  };
}

export async function bundleEdgeFunction(
  entryFilePath: string,
  outDir: string,
): Promise<void> {
  const result = await Bun.build({
    entrypoints: [entryFilePath],
    outdir: outDir,
    target: "bun",
    format: "esm",
    minify: true,
    naming: "index.[ext]",
    define: {
      "process.env.NODE_ENV": '"production"',
      "__FREAKJS_DEV__": "false",
    },
  });

  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error(`Edge bundle failed for: ${entryFilePath}`);
  }
}
