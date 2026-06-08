// Copyright (c) 2025 João Gabriel do Vale Souza & Lucas Silva dos Santos
// FreakJS — MIT License — https://github.com/lucas-s-santos/FreakJS

import { mkdirSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
  const freakjsDep = existsSync(resolve(process.cwd(), "src/jsx/factory.ts"))
    ? `file:${relative(targetDir, process.cwd()).replace(/\\/g, "/")}`
    : "^0.1.0";

  if (existsSync(targetDir)) {
    console.error(`[FreakJS] Directory already exists: ${targetDir}`);
    process.exit(1);
  }

  console.log(`\n  FreakJS — criando projeto: ${projectName}\n`);

  mkdirSync(join(targetDir, "src", "pages", "api"), { recursive: true });
  mkdirSync(join(targetDir, "src", "components"), { recursive: true });
  mkdirSync(join(targetDir, "public"), { recursive: true });

  // Copia o icon.png do framework para public/ do projeto
  const frameworkRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const iconSrc = join(frameworkRoot, "icon.png");
  if (existsSync(iconSrc)) {
    copyFileSync(iconSrc, join(targetDir, "public", "icon.png"));
  }

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

  // Página de boas-vindas com branding FreakJS
  writeFileSync(
    join(targetDir, "src", "pages", "index.tsx"),
    `import type { PageProps } from "freakjs";

export const metadata = {
  title: "${projectName}",
  description: "Built with FreakJS",
};

export default function Home({}: PageProps) {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#ffffff",
      margin: "0",
    }}>
      <img
        src="/icon.png"
        alt="FreakJS"
        style={{ width: "80px", height: "80px", marginBottom: "28px" }}
      />

      <h1 style={{
        fontSize: "3rem",
        fontWeight: "700",
        margin: "0 0 8px 0",
        letterSpacing: "-0.03em",
      }}>
        FreakJS
      </h1>

      <p style={{
        color: "#555",
        margin: "0 0 56px 0",
        fontSize: "1rem",
        letterSpacing: "0.02em",
      }}>
        Bun-native · Zero deps · Edge-ready
      </p>

      <div style={{
        background: "#111111",
        border: "1px solid #1f1f1f",
        borderRadius: "12px",
        padding: "28px 36px",
        textAlign: "center",
        minWidth: "280px",
      }}>
        <p style={{
          color: "#444",
          fontSize: "0.75rem",
          margin: "0 0 14px 0",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}>
          Comece editando
        </p>
        <code style={{ color: "#7dd3fc", fontSize: "0.95rem" }}>
          src/pages/index.tsx
        </code>
      </div>

      <p style={{ color: "#2a2a2a", fontSize: "0.75rem", marginTop: "64px" }}>
        ${projectName} · powered by FreakJS
      </p>
    </main>
  );
}
`,
    "utf-8",
  );

  // API route de exemplo
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

  console.log(`  ✓ ${projectName}/src/pages/index.tsx`);
  console.log(`  ✓ ${projectName}/src/pages/api/hello.ts`);
  console.log(`  ✓ ${projectName}/src/components/`);
  console.log(`  ✓ ${projectName}/public/`);
  console.log(`  ✓ package.json, tsconfig.json\n`);

  console.log("  Instalando dependências...");
  const proc = Bun.spawn(["bun", "install"], {
    cwd: targetDir,
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.error("\n[FreakJS] bun install falhou. Rode manualmente dentro do projeto.");
  } else {
    console.log(`
  Pronto! Próximos passos:

    cd ${projectName}
    bun run dev

  Acesse http://localhost:3000
`);
  }
}
