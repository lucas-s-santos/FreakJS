import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, relative } from "node:path";

export async function create(args: string[]): Promise<void> {
  const projectName = args[0];

  if (!projectName) {
    console.error("[FreakJS] Usage: freakjs create <project-name>");
    process.exit(1);
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
    console.error("[FreakJS] Project name must only contain letters, numbers, hyphens and underscores.");
    process.exit(1);
  }

  const targetDir = resolve(process.cwd(), projectName);
  // Use local file: reference when running from the framework source (not published yet)
  const freakjsDep = existsSync(resolve(process.cwd(), "src/jsx/factory.ts"))
    ? `file:${relative(targetDir, process.cwd()).replace(/\\/g, "/")}`
    : "^0.1.0";

  if (existsSync(targetDir)) {
    console.error(`[FreakJS] Directory already exists: ${targetDir}`);
    process.exit(1);
  }

  console.log(`\n  Creating FreakJS project: ${projectName}\n`);

  // Scaffold directory structure
  mkdirSync(join(targetDir, "src", "pages", "api"), { recursive: true });
  mkdirSync(join(targetDir, "public"), { recursive: true });

  // package.json
  writeFileSync(
    join(targetDir, "package.json"),
    JSON.stringify({
      name: projectName,
      version: "0.0.1",
      type: "module",
      scripts: {
        dev: "freakjs dev",
        build: "freakjs build",
      },
      devDependencies: {
        freakjs: freakjsDep,
        "@types/bun": "latest",
      },
    }, null, 2) + "\n",
    "utf-8",
  );

  // tsconfig.json
  writeFileSync(
    join(targetDir, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        jsxImportSource: "freakjs",
        strict: true,
        skipLibCheck: true,
        types: ["bun-types"],
      },
      include: ["src/**/*"],
      exclude: ["node_modules", ".vercel", ".freak"],
    }, null, 2) + "\n",
    "utf-8",
  );

  // src/pages/index.tsx
  writeFileSync(
    join(targetDir, "src", "pages", "index.tsx"),
    `import type { PageProps } from "freakjs";

export const metadata = {
  title: "${projectName}",
  description: "Built with FreakJS",
};

export default function Home({ url }: PageProps) {
  return (
    <main>
      <h1>Welcome to FreakJS</h1>
      <p>Edit <code>src/pages/index.tsx</code> to get started.</p>
    </main>
  );
}
`,
    "utf-8",
  );

  // src/pages/api/hello.ts
  writeFileSync(
    join(targetDir, "src", "pages", "api", "hello.ts"),
    `export async function GET(req: Request): Promise<Response> {
  return Response.json({ message: "Hello from FreakJS!", url: req.url });
}
`,
    "utf-8",
  );

  // .gitignore
  writeFileSync(
    join(targetDir, ".gitignore"),
    `node_modules/
.vercel/
.freak/
bun.lockb
`,
    "utf-8",
  );

  console.log(`  ✓ Created ${projectName}/`);
  console.log(`  ✓ src/pages/index.tsx`);
  console.log(`  ✓ src/pages/api/hello.ts`);
  console.log(`  ✓ package.json, tsconfig.json\n`);

  // Run bun install
  console.log("  Installing dependencies...");
  const proc = Bun.spawn(["bun", "install"], {
    cwd: targetDir,
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.error("\n[FreakJS] bun install failed. Run it manually inside the project.");
  } else {
    console.log(`
  Done! Next steps:

    cd ${projectName}
    bun run dev
`);
  }
}
