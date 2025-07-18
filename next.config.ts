import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2q79iu7y748jz.cloudfront.net',
      },
    ],
  },
};

module.exports = nextConfig;


export default nextConfig;
