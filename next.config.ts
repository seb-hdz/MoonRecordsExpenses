import type { NextConfig } from "next";
import { APP_BASE_PATH_PRODUCTION } from "./src/lib/app-base-path";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? APP_BASE_PATH_PRODUCTION : "",
  assetPrefix: isProd ? `${APP_BASE_PATH_PRODUCTION}/` : "",
  images: { unoptimized: true },
  devIndicators: false,
};

export default nextConfig;
