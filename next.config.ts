import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Ship the price data file with the server bundle (serverless/standalone deploys).
  outputFileTracingIncludes: {
    "/api/prices": ["./data/**/*"],
    "/api/ttf": ["./data/**/*", "./src/app/gas-prices/ttf.csv"],
  },
};

export default nextConfig;
