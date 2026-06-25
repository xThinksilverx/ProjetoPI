/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['randomuser.me'],
  },
  experimental: {
    serverActions: true,
  },
  // Evita o bug de race condition do mini-css-extract-plugin no HMR
  optimizeCss: false,
};

export default nextConfig;
