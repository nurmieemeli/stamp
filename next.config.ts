import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Raw avatar uploads are capped well below this in app/dashboard/actions.ts;
      // this just needs enough headroom for the multipart body.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
