import type { NextConfig } from "next";
import { validateFrontendBuildEnvironment } from "./src/config/environmentValidation";

validateFrontendBuildEnvironment(process.env);

const nextConfig: NextConfig = {
  i18n: {
    locales: ["en", "de", "es", "fr"],
    defaultLocale: "es",
  },
  poweredByHeader: false, // Desactiva el encabezado X-Powered-By
};

export default nextConfig;
