import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin/auth pulls in jwks-rsa -> jose, whose ESM-only build
  // breaks when webpack bundles it into CJS (ERR_REQUIRE_ESM at import
  // time). Marking them external lets Node's own loader handle them.
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
  devIndicators: false,
};

export default nextConfig;
