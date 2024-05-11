/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      // Basic redirect
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true
      },
    ];
  }

};

export default nextConfig;
