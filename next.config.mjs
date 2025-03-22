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
      }
    ];
  },
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: false
    }
  }
};

export default nextConfig;
