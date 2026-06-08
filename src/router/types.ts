export type RouteKind = "page" | "api";

export interface RouteEntry {
  filePath: string;
  urlPattern: URLPattern;
  isDynamic: boolean;
  isCatchAll: boolean;
  kind: RouteKind;
  paramNames: string[];
  routePath: string; // human-readable, e.g. /blog/:slug
}

export interface RouteManifest {
  entries: RouteEntry[];
}

export interface RouteMatch {
  entry: RouteEntry;
  params: Record<string, string>;
  searchParams: URLSearchParams;
}

export interface PageProps {
  params: Record<string, string>;
  searchParams: URLSearchParams;
  url: URL;
}

export interface PageMetadata {
  title?: string;
  description?: string;
  [key: string]: string | undefined;
}

export interface PageModule {
  default: (props: PageProps) => unknown;
  metadata?: PageMetadata;
  config?: { runtime?: "edge" | "nodejs" };
}

export interface ApiModule {
  GET?: (req: Request, params: Record<string, string>) => Promise<Response> | Response;
  POST?: (req: Request, params: Record<string, string>) => Promise<Response> | Response;
  PUT?: (req: Request, params: Record<string, string>) => Promise<Response> | Response;
  PATCH?: (req: Request, params: Record<string, string>) => Promise<Response> | Response;
  DELETE?: (req: Request, params: Record<string, string>) => Promise<Response> | Response;
  HEAD?: (req: Request, params: Record<string, string>) => Promise<Response> | Response;
  OPTIONS?: (req: Request, params: Record<string, string>) => Promise<Response> | Response;
}
