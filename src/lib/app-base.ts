const REPO_BASENAME = "/agencealger.github.io";

export function getAppBasePath() {
  if (typeof window === "undefined") return "";

  const { pathname } = window.location;
  return pathname === REPO_BASENAME || pathname.startsWith(`${REPO_BASENAME}/`)
    ? REPO_BASENAME
    : "";
}

export function withAppBase(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getAppBasePath()}${normalized}`;
}

