import type { NextConfig } from "next";

function supabaseStorageRemotePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return [];
  try {
    const { hostname } = new URL(url);
    return [{ protocol: "https" as const, hostname, pathname: "/storage/v1/object/public/**" }];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
    remotePatterns: supabaseStorageRemotePattern(),
  },
};

export default nextConfig;