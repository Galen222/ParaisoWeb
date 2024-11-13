// components/LegalInfo.tsx

import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/components/LegalInfo.module.css";

/**
 * Componente LegalInfo
 *
 * Renderiza una tabla con información legal de la empresa, incluyendo el nombre,
 * dirección, contacto y enlaces a la política de privacidad. La información se
 * presenta en varios idiomas según las configuraciones de localización.
 *
 * Necesario siempre que se solicite cualquier información al usuario
 * para cumplir con la normativa vigente.
 *
 * @returns {JSX.Element} Tabla con información legal de la empresa.
 */
const LegalInfo: React.FC = (): JSX.Element => {
  const intl = useIntl(); // Hook para obtener mensajes localizados
  const router = useRouter(); // Hook de Next.js para acceder al enrutador

  return (
    <div className="table-responsive">
      <table className="table table-dark table-striped-columns mw-600p mt-25p mx-auto text-center mb-40p rounded-3 overflow-hidden">
        <thead>
          <tr>
            {/* Encabezado de la tabla que muestra el título en el idioma actual */}
            <th colSpan={2}>{intl.formatMessage({ id: "contacto_Tabla_Titulo" })}</th>
          </tr>
        </thead>
        <tbody className="table-group-divider">
          {/* Filas de la tabla que muestran información legal de la empresa */}
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda1_1" })}</td>
            <td>PACAVA S.A.</td> {/* Nombre de la empresa */}
          </tr>
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda2_1" })}</td>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda2_2" })}</td> {/* Dirección */}
          </tr>
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda3_1" })}</td>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda3_2" })}</td> {/* Teléfono de contacto */}
          </tr>
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda4_1" })}</td>
            <td>PACAVA S.A.</td> {/* Nombre de la empresa nuevamente */}
          </tr>
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda5_1" })}</td>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda5_2" })}</td> {/* Dirección de correo electrónico */}
          </tr>
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda6_1" })}</td>
            <td>
              {/* Mensaje con enlace a la política de privacidad */}
              {intl.formatMessage({ id: "contacto_Tabla_Celda6_2" })}
              <Link href="/politica-privacidad" locale={router.locale} className={styles.link}>
                <span className="fs-16p">{intl.formatMessage({ id: "contacto_Tabla_Celda6_3" })}</span>
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LegalInfo;
