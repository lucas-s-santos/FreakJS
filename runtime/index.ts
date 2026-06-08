// Copyright (c) 2025 João Gabriel do Vale Souza & Lucas Silva dos Santos
// FreakJS — MIT License — https://github.com/lucas-s-santos/FreakJS

// FreakJS public API — imported by user projects as "freakjs"
export { h, Fragment, jsx, jsxs, jsxDEV } from "../src/jsx/factory.ts";
export { renderToString } from "../src/jsx/server.ts";
export { hydrate } from "../src/jsx/client.ts";

export type { VNode, VNodeChild, FunctionComponent } from "../src/jsx/vnode.ts";
export type { PageProps, PageMetadata, PageModule, ApiModule } from "../src/router/types.ts";
