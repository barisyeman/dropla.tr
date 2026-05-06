import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Pin Turbopack to this folder so it doesn't get confused by stray lockfiles
  // higher up the directory tree (e.g. in the user home dir on Windows).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
