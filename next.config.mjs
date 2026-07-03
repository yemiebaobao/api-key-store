/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.stripe.com",
      },
    ],
  },
};

export default nextConfig;
