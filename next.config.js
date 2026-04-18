/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  transpilePackages: [
    "@splinetool/react-spline",
    "@splinetool/runtime",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
  ],
};
module.exports = nextConfig;
