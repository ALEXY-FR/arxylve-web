import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ffmpeg-static'],
  // Keep old CMS image addresses while storing the identical photograph once.
  async rewrites() { return [{source: '/images/test.jpg', destination: '/images/reflet-deau.jpg'}]; },
  outputFileTracingIncludes: {'/api/admin/upload': ['./node_modules/ffmpeg-static/ffmpeg*']},
  outputFileTracingExcludes: {'/*': ['./.arxylve-private/**/*', './Administration ARXYLVE.url', './Autoriser cet appareil ARXYLVE.url']},
};

export default nextConfig;
