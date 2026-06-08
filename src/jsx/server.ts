// Copyright (c) 2025 João Gabriel do Vale Souza & Lucas Silva dos Santos
// FreakJS — MIT License — https://github.com/lucas-s-santos/FreakJS

import { Fragment } from "./vnode.ts";
import type { VNode, VNodeChild } from "./vnode.ts";

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

export function renderToString(node: VNodeChild): string {
  if (node === null || node === undefined || node === false || node === true) return "";
  if (typeof node === "number") return String(node);
  if (typeof node === "string") return escapeHtml(node);

  const vnode = node as VNode;

  if (vnode.type === Fragment) {
    return vnode.children.map(renderToString).join("");
  }

  if (typeof vnode.type === "function") {
    const result = vnode.type({
      ...vnode.props,
      children: vnode.children as VNode[],
    });
    return renderToString(result);
  }

  const tag = vnode.type as string;
  const attrs = serializeAttrs(vnode.props);

  if (VOID_ELEMENTS.has(tag)) {
    return `<${tag}${attrs}>`;
  }

  if (vnode.props.dangerouslySetInnerHTML) {
    const raw = (vnode.props.dangerouslySetInnerHTML as { __html: string }).__html;
    return `<${tag}${attrs}>${raw}</${tag}>`;
  }

  const inner = vnode.children.map(renderToString).join("");
  return `<${tag}${attrs}>${inner}</${tag}>`;
}

function serializeAttrs(props: Record<string, unknown>): string {
  let out = "";
  for (const [k, v] of Object.entries(props)) {
    if (v === false || v === null || v === undefined) continue;
    if (k === "children") continue;
    if (k.startsWith("on")) continue;
    if (k === "className") { out += ` class="${escapeHtml(String(v))}"`;  continue; }
    if (k === "htmlFor")   { out += ` for="${escapeHtml(String(v))}"`;    continue; }
    if (k === "dangerouslySetInnerHTML") continue;
    if (k === "style" && typeof v === "object") {
      const css = Object.entries(v as Record<string, string>)
        .map(([p, val]) => `${p.replace(/([A-Z])/g, "-$1").toLowerCase()}:${val}`)
        .join(";");
      out += ` style="${escapeHtml(css)}"`;
      continue;
    }
    if (v === true) { out += ` ${k}`; continue; }
    out += ` ${k}="${escapeHtml(String(v))}"`;
  }
  return out;
}
