import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["jwks-rsa", "jose"],
  /* config options here */
};

export default nextConfig;
