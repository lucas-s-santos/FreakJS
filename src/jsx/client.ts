// Copyright (c) 2025 João Gabriel do Vale Souza & Lucas Silva dos Santos
// FreakJS — MIT License — https://github.com/lucas-s-santos/FreakJS

// Client-side hydration — runs in the browser after SSR.
// Strategy: walk the VNode tree in parallel with the real DOM
// and attach event listeners. No re-render, no reconciliation.
import { Fragment } from "./vnode.ts";
import type { VNode, VNodeChild } from "./vnode.ts";

export function hydrate(vnode: VNodeChild, container: Element): void {
  hydrateNode(vnode, container.firstChild as Node | null, container);
}

function hydrateNode(
  node: VNodeChild,
  domNode: Node | null,
  _parent: Node,
): Node | null {
  if (node === null || node === undefined || node === false || node === true) {
    return domNode;
  }
  if (typeof node === "string" || typeof node === "number") {
    return domNode ? domNode.nextSibling : null;
  }

  const vnode = node as VNode;

  if (vnode.type === Fragment) {
    let cursor = domNode;
    for (const child of vnode.children) {
      cursor = hydrateNode(child, cursor, _parent);
    }
    return cursor;
  }

  if (typeof vnode.type === "function") {
    const result = vnode.type({
      ...vnode.props,
      children: vnode.children as VNode[],
    });
    return hydrateNode(result, domNode, _parent);
  }

  const el = domNode as Element;
  if (!el) return null;

  attachEvents(vnode.props, el);

  let cursor = el.firstChild as Node | null;
  for (const child of vnode.children) {
    cursor = hydrateNode(child, cursor, el);
  }

  return el.nextSibling as Node | null;
}

function attachEvents(props: Record<string, unknown>, el: Element): void {
  for (const [k, v] of Object.entries(props)) {
    if (!k.startsWith("on") || typeof v !== "function") continue;
    const eventName = k.slice(2).toLowerCase();
    el.addEventListener(eventName, v as EventListener);
  }
}
