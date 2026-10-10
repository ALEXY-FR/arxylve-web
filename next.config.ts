import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ffmpeg-static'],
  outputFileTracingIncludes: {'/api/admin/upload': ['./node_modules/ffmpeg-static/ffmpeg*']},
  outputFileTracingExcludes: {'/*': ['./.arxylve-private/**/*', './Administration ARXYLVE.url', './Autoriser cet appareil ARXYLVE.url']},
};

export default nextConfig;
