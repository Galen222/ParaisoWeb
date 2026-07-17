import { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: ["en", "de", "es", "fr"],
    defaultLocale: "es",
  },
  poweredByHeader: false, // Desactiva el encabezado X-Powered-By
  async redirects() {
    return [
      { source: "/es", destination: "/", permanent: true, locale: false },
      { source: "/es/:path*", destination: "/:path*", permanent: true, locale: false },
    ];
  },
};

export default nextConfig;
