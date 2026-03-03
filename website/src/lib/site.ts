const DEFAULT_SITE_URL = "https://yt2apple.vercel.app";

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!envUrl) {
    return DEFAULT_SITE_URL;
  }

  return envUrl.replace(/\/+$/, "");
}

export const SUPPORT_URL = "https://buymeacoffee.com/mithhu";
