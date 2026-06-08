import { Fragment } from "./vnode.ts";
import type { VNode, VNodeChild, VNodeType } from "./vnode.ts";

export { Fragment };

export function h(
  type: VNodeType,
  props: Record<string, unknown> | null,
  ...rawChildren: unknown[]
): VNode {
  const { key = null, ...restProps } = props ?? {};
  return {
    type,
    props: restProps as Record<string, unknown>,
    children: flattenChildren(rawChildren),
    key: key as string | number | null,
  };
}

// jsx-runtime shape required by tsc / Bun with "jsx": "react-jsx"
export function jsx(type: VNodeType, props: Record<string, unknown>): VNode {
  const { children: rawChildren, key = null, ...restProps } = props;
  const children = rawChildren === undefined
    ? []
    : flattenChildren([rawChildren]);
  return { type, props: restProps, children, key: key as string | number | null };
}

export const jsxs = jsx;
export const jsxDEV = jsx;

function flattenChildren(raw: unknown[]): VNodeChild[] {
  const out: VNodeChild[] = [];
  for (const child of raw) {
    if (child === null || child === undefined || child === false || child === true) continue;
    if (Array.isArray(child)) {
      out.push(...flattenChildren(child));
    } else {
      out.push(child as VNodeChild);
    }
  }
  return out;
}
