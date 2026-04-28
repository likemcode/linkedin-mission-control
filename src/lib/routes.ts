export const basePath = "/linkedin";

export function apiPath(path: string) {
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
