# FreakJS

**Bun-native frontend framework. Zero runtime dependencies. Edge-ready. Free to deploy.**

FreakJS é um framework frontend minimalista e seguro, construído sobre [Bun](https://bun.sh) e W3C Web APIs. Sem risco de supply-chain do npm. Sem arquivos de configuração complexos. Deploy gratuito na Vercel, Netlify e Cloudflare Pages — sem backend.

---

## Por que FreakJS?

### O benchmark de tokens

Um teste real mediu quantos tokens do Claude Sonnet um modelo consome para montar um frontend completo a partir de um único prompt:

| Framework | Tokens consumidos | Precisa de servidor |
|-----------|------------------|---------------------|
| NestJS    | ~1.100.000       | Sim                 |
| Next.js / Vite | ~900.000   | Não                 |
| Rails     | ~300.000         | **Sim**             |
| **FreakJS** | **< Rails**  | **Não**             |

Rails ganhou em tokens por ter convenções rígidas e superfície de API previsível. O FreakJS usa a mesma filosofia — mas roda inteiramente no edge, sem servidor, sem custo de backend e com zero dependências npm em runtime.

### O problema de segurança do npm

Todo `npm install` puxa um grafo de dependências que executa scripts `postinstall` arbitrários com suas credenciais. Ataques de supply-chain exploram exatamente isso. O FreakJS tem **zero dependências npm em runtime** — os únicos pacotes em `devDependencies` são as definições de tipos do Bun e o TypeScript, que nunca chegam à produção.

### Hospedagem gratuita

O output do build segue nativamente a [Vercel Build Output API v3](https://vercel.com/docs/build-output-api/v3). Páginas estáticas vão para o CDN. Páginas dinâmicas e rotas de API viram Edge Functions isoladas. Custo zero na escala hobby da Vercel e Netlify.

---

## Pré-requisito

- [Bun](https://bun.sh) >= 1.1.0 instalado na máquina

---

## Instalação

FreakJS é instalado como um **binário nativo** — igual ao Bun e ao Deno. Instale uma vez, use para sempre em qualquer terminal.

### Windows — Winget (recomendado)

```powershell
winget install freakjs
```

### Windows — Scoop

```powershell
irm get.scoop.sh | iex
scoop bucket add freakjs https://github.com/lucas-s-santos/FreakJS
scoop install freakjs/freakjs
```

### Mac / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/lucas-s-santos/FreakJS/main/install.sh | bash
```

---

## Criar o primeiro projeto

Depois de instalado, em qualquer pasta do seu computador:

```bash
freakjs create meu-projeto
cd meu-projeto
bun run dev
```

Acesse `http://localhost:3000` — a tela de boas-vindas do FreakJS abre automaticamente.

```bash
bun run build   # gera .vercel/output/ pronto para deploy
```

---

## O que é gerado pelo `freakjs create`

O comando cria uma estrutura completa e pronta para rodar:

```
meu-projeto/
├── src/
│   ├── pages/
│   │   ├── index.tsx          # Tela de boas-vindas com logo FreakJS → /
│   │   └── api/
│   │       └── hello.ts       # API route de exemplo → /api/hello
│   └── components/            # Pasta para seus componentes
├── public/
│   └── icon.png               # Logo do FreakJS (favicon incluso)
├── package.json
├── tsconfig.json
└── .gitignore
```

Ao rodar `bun run dev`, o `localhost:3000` abre com a tela de boas-vindas do FreakJS — fundo escuro, logo e nome do projeto — pronta para você substituir pelo seu conteúdo.

---

## Roteamento

Cada arquivo em `src/pages/` vira automaticamente uma rota — sem configuração:

| Arquivo                            | Rota             | Tipo      |
|------------------------------------|------------------|-----------|
| `src/pages/index.tsx`              | `/`              | página    |
| `src/pages/sobre.tsx`              | `/sobre`         | página    |
| `src/pages/blog/[slug].tsx`        | `/blog/:slug`    | dinâmica  |
| `src/pages/docs/[...path].tsx`     | `/docs/:path*`   | catch-all |
| `src/pages/api/hello.ts`           | `/api/hello`     | API       |

Prioridade: estática > dinâmica > catch-all.

---

## Páginas

```tsx
// src/pages/index.tsx
import type { PageProps } from "freakjs";

export const metadata = {
  title: "Meu App",
  description: "Feito com FreakJS",
};

export default function Home({ url, params, searchParams }: PageProps) {
  return (
    <main style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <h1>Olá, FreakJS</h1>
      <p>Caminho atual: {url.pathname}</p>
    </main>
  );
}
```

### PageProps

```ts
interface PageProps {
  params: Record<string, string>;  // segmentos dinâmicos da URL
  searchParams: URLSearchParams;   // ?chave=valor
  url: URL;                        // URL completo
}
```

### Metadata

```ts
export const metadata = {
  title: "Título da página",       // <title>
  description: "Descrição SEO",   // <meta name="description">
};
```

---

## Componentes

```tsx
// src/components/Card.tsx
import type { VNode } from "freakjs";

interface CardProps {
  titulo: string;
  children?: VNode[];
}

export function Card({ titulo, children }: CardProps) {
  return (
    <div style={{ background: "#111", borderRadius: "8px", padding: "16px" }}>
      <h2 style={{ color: "#fff", margin: "0 0 8px 0" }}>{titulo}</h2>
      {children}
    </div>
  );
}
```

---

## API Routes

```ts
// src/pages/api/hello.ts
export async function GET(req: Request): Promise<Response> {
  return Response.json({ message: "Olá do FreakJS!" });
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  return Response.json({ recebido: body }, { status: 201 });
}
```

Métodos não implementados retornam `405 Method Not Allowed` automaticamente.

---

## Usando Supabase (sem backend)

```ts
// src/pages/api/posts.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export async function GET(): Promise<Response> {
  const { data, error } = await supabase.from("posts").select("*");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
```

Configure as variáveis de ambiente no painel da Vercel ou Netlify.

---

## Deploy

### Vercel

```bash
bun run build
vercel deploy --prebuilt
```

Ou conecte seu repositório GitHub na Vercel e defina o build command como `bun run build`. A Vercel detecta `.vercel/output/` automaticamente.

### Netlify

Aponte o diretório de publicação para `.vercel/output/static`.

---

## Output do build

```
.vercel/output/
├── config.json                    # Regras de rota (Build Output API v3)
├── static/
│   ├── index.html                 # Páginas pré-renderizadas
│   └── _freakjs/
└── functions/
    ├── blog/[slug].func/
    │   ├── index.js               # Edge Function empacotada
    │   └── .vc-config.json
    └── api/hello.func/
        ├── index.js
        └── .vc-config.json
```

---

## Servidor de desenvolvimento

```bash
bun run dev   # → http://localhost:3000
```

- **HMR** — mudanças nos arquivos recarregam o browser via WebSocket
- **SSR em dev** — idêntico à produção
- **API routes funcionam localmente** — sem mock, sem processo separado

---

## Segurança

| Vetor de ataque | Como o FreakJS lida |
|-----------------|---------------------|
| Supply-chain npm | Zero dependências runtime — nada para envenenar |
| Scripts `postinstall` | Sem dependências runtime com lifecycle scripts |
| XSS | Todo texto HTML-escapado por padrão no `renderToString` |
| Injeção via event handlers | Atributos `on*` removidos do SSR; reattached só no cliente |
| Isolamento edge | Cada função roda em isolate V8 próprio (Vercel/Cloudflare) |

---

## CLI

```
freakjs <comando>

Comandos:
  create <nome>   Cria um novo projeto FreakJS com tela de boas-vindas
  dev             Inicia o servidor de desenvolvimento (porta 3000)
  build           Build de produção (Vercel Build Output API v3)
```

---

## API pública

### `"freakjs"`

| Export | Descrição |
|--------|-----------|
| `h`, `jsx`, `jsxs`, `jsxDEV` | JSX factory (usado pelo compilador TypeScript) |
| `Fragment` | Suporte a `<>...</>` |
| `renderToString(vnode)` | Renderiza VNode para string HTML |
| `hydrate(vnode, container)` | Attaches event listeners no DOM existente |
| `PageProps`, `PageMetadata`, `PageModule`, `ApiModule` | Types |
| `VNode`, `VNodeChild`, `FunctionComponent` | Types do JSX |

---

## Roadmap

- [ ] Adapter Netlify Edge Functions
- [ ] Adapter Cloudflare Pages
- [ ] Estado reativo (signals, sem VDOM)
- [ ] Otimização nativa de imagens
- [ ] CSS modules

---

## Criadores

FreakJS foi criado e é mantido por:

**João Gabriel do Vale Souza** e **Lucas Silva dos Santos**

---

## Licença

MIT © 2025 João Gabriel do Vale Souza & Lucas Silva dos Santos

O copyright está registrado no arquivo [LICENSE](./LICENSE) e no cabeçalho de todos os arquivos de código-fonte. Qualquer uso, cópia ou distribuição deve manter os créditos originais conforme a licença MIT.
