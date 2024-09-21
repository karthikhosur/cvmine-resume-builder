/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable Strict Mode
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  }
}

export default nextConfig;
