import React from "react";
import { useIntl } from "react-intl";
import Link from "next/link";
import styles from "../styles/LegalInfo.module.css";

const LegalInfo: React.FC = () => {
  const intl = useIntl();

  return (
    <div className="table-responsive">
      <table className="table table-dark table-striped-columns mw-600p mt-25p mx-auto text-center mb-40p rounded-3 overflow-hidden">
        <thead>
          <tr>
            <th colSpan={2}>{intl.formatMessage({ id: "contacto_Tabla_Titulo" })}</th>
          </tr>
        </thead>
        <tbody className="table-group-divider">
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda1_1" })}</td>
            <td>PACAVA S.A.</td>
          </tr>
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda2_1" })}</td>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda2_2" })}</td>
          </tr>
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda3_1" })}</td>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda3_2" })}</td>
          </tr>
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda4_1" })}</td>
            <td>PACAVA S.A.</td>
          </tr>
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda5_1" })}</td>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda5_2" })}</td>
          </tr>
          <tr>
            <td>{intl.formatMessage({ id: "contacto_Tabla_Celda6_1" })}</td>
            <td>
              {intl.formatMessage({ id: "contacto_Tabla_Celda6_2" })}
              <Link href="/politica-privacidad" className={styles.link}>
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
