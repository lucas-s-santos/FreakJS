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
  const frameworkRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const isLocalDev = existsSync(resolve(frameworkRoot, "src/jsx/factory.ts"));

  if (existsSync(targetDir)) {
    console.error(`[FreakJS] Directory already exists: ${targetDir}`);
    process.exit(1);
  }

  console.log(`\n  FreakJS — criando projeto: ${projectName}\n`);

  mkdirSync(join(targetDir, "src", "pages", "api"), { recursive: true });
  mkdirSync(join(targetDir, "src", "components"), { recursive: true });
  mkdirSync(join(targetDir, "public"), { recursive: true });

  // Copia o icon.png do framework para public/ do projeto
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
        freakjs: isLocalDev ? "link:freakjs" : "github:lucas-s-santos/FreakJS",
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
import { Fragment } from "freakjs";

export const metadata = {
  title: "${projectName}",
  description: "Built with FreakJS",
};

const css = \`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.35; transform: scale(1); }
    50%       { opacity: 0.6;  transform: scale(1.08); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  .freak-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #fff;
    background: #080808;
    background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0);
    background-size: 28px 28px;
    position: relative;
    overflow: hidden;
  }

  .orb {
    position: absolute;
    width: 700px;
    height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 65%);
    animation: pulse-glow 5s ease-in-out infinite;
    pointer-events: none;
  }

  .logo {
    animation: float 7s ease-in-out infinite, fadeUp 0.5s ease both;
    margin-bottom: 36px;
    position: relative;
    z-index: 1;
  }
  .logo img {
    width: 96px;
    height: 96px;
    filter: drop-shadow(0 0 28px rgba(139,92,246,0.65));
  }

  .title {
    font-size: 4.5rem;
    font-weight: 800;
    letter-spacing: -0.05em;
    line-height: 1;
    background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 45%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeUp 0.5s 0.08s ease both;
    opacity: 0;
    position: relative;
    z-index: 1;
    margin-bottom: 14px;
  }

  .tagline {
    color: #404040;
    font-size: 0.875rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    animation: fadeUp 0.5s 0.16s ease both;
    opacity: 0;
    position: relative;
    z-index: 1;
    margin-bottom: 40px;
  }

  .pills {
    display: flex;
    gap: 8px;
    margin-bottom: 52px;
    animation: fadeUp 0.5s 0.24s ease both;
    opacity: 0;
    position: relative;
    z-index: 1;
    flex-wrap: wrap;
    justify-content: center;
  }
  .pill {
    background: rgba(124,58,237,0.07);
    border: 1px solid rgba(124,58,237,0.22);
    color: #a78bfa;
    font-size: 0.72rem;
    padding: 5px 14px;
    border-radius: 100px;
    letter-spacing: 0.06em;
    font-weight: 500;
  }

  .card {
    position: relative;
    z-index: 1;
    background: rgba(255,255,255,0.018);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 36px 48px;
    text-align: center;
    min-width: 340px;
    animation: fadeUp 0.5s 0.32s ease both;
    opacity: 0;
    backdrop-filter: blur(12px);
  }
  .card::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 21px;
    background: linear-gradient(135deg, rgba(124,58,237,0.35) 0%, transparent 50%, rgba(124,58,237,0.12) 100%);
    z-index: -1;
  }
  .card-label {
    color: #333;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin-bottom: 18px;
    font-weight: 500;
  }
  .card-code {
    display: block;
    color: #a78bfa;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.92rem;
    background: rgba(124,58,237,0.07);
    border: 1px solid rgba(124,58,237,0.18);
    border-radius: 10px;
    padding: 12px 20px;
    letter-spacing: 0.02em;
  }

  .footer {
    position: absolute;
    bottom: 28px;
    color: #1c1c1c;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    z-index: 1;
  }
\`;

export default function Home({}: PageProps) {
  return (
    <Fragment>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div class="freak-root">
        <div class="orb" />

        <div class="logo">
          <img src="/icon.png" alt="FreakJS" />
        </div>

        <h1 class="title">FreakJS</h1>

        <p class="tagline">Bun-native · Zero deps · Edge-ready</p>

        <div class="pills">
          <span class="pill">Zero npm deps</span>
          <span class="pill">Edge Functions</span>
          <span class="pill">File-based routing</span>
          <span class="pill">SSR + HMR</span>
        </div>

        <div class="card">
          <p class="card-label">Comece editando</p>
          <code class="card-code">src/pages/index.tsx</code>
        </div>

        <p class="footer">${projectName} · powered by FreakJS</p>
      </div>
    </Fragment>
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

  // vercel.json — configura build command para deploy automático
  writeFileSync(
    join(targetDir, "vercel.json"),
    JSON.stringify({
      buildCommand: "bun run build",
      installCommand: "bun install",
      framework: null,
    }, null, 2) + "\n",
    "utf-8",
  );

  // netlify.toml — páginas estáticas na Netlify
  writeFileSync(
    join(targetDir, "netlify.toml"),
    `[build]
  command   = "bun run build"
  publish   = ".vercel/output/static"

[build.environment]
  BUN_VERSION = "1.2.0"
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
    return;
  }

  console.log(`
  Pronto! Próximos passos:

    cd ${projectName}
    bun run dev

  Acesse http://localhost:3000
`);
}
