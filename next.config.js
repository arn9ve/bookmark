/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-common-sign-useast2a.tiktokcdn-us.com',
      },
      {
        protocol: 'https',
        hostname: 'p19-common-sign-useast2a.tiktokcdn-us.com',
      },
      {
        protocol: 'https',
        hostname: '*.tiktokcdn-us.com',
      },
    ],
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/:username/settings',
          destination: '/profile/:username/settings',
        },
        {
          source: '/:username',
          destination: '/profile/:username',
        },
      ],
    };
  },
};

export default config;
