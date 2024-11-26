import { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: ["en", "de", "es"],
    defaultLocale: "es",
  },
  poweredByHeader: false, // Desactiva el encabezado X-Powered-By
};

export default nextConfig;
