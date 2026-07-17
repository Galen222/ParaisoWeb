import React, { createContext, useContext } from "react";

const CspNonceContext = createContext<string | undefined>(undefined);

interface CspNonceProviderProps {
  children: React.ReactNode;
  nonce?: string;
}

/** Comparte con los componentes SSR el nonce criptográfico generado para la petición actual. */
export const CspNonceProvider = ({ children, nonce }: CspNonceProviderProps): React.JSX.Element => (
  <CspNonceContext.Provider value={nonce}>{children}</CspNonceContext.Provider>
);

/** Obtiene el nonce CSP de la petición actual para scripts inline controlados. */
export const useCspNonce = (): string | undefined => useContext(CspNonceContext);
