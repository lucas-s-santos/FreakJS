export const Fragment = Symbol("FreakJS.Fragment");

export type VNodeChild = VNode | string | number | null | undefined | boolean;

export type FunctionComponent<P = Record<string, unknown>> = (
  props: P & { children?: VNode[] }
) => VNode | null;

export type VNodeType = string | FunctionComponent | typeof Fragment;

export interface VNode {
  type: VNodeType;
  props: Record<string, unknown>;
  children: VNodeChild[];
  key: string | number | null;
}
