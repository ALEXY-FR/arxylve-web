import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {'/*': ['./.arxylve-private/**/*', './Administration ARXYLVE.url', './Autoriser cet appareil ARXYLVE.url']},
};

export default nextConfig;
