import { useIntl } from "react-intl";
import styles from "../styles/error.module.css";
import { NextPageContext } from "next";

interface ErrorPageProps {
  statusCode: number;
}

const ErrorPage = ({ statusCode }: ErrorPageProps) => {
  const intl = useIntl();
  const message = statusCode === 404 ? intl.formatMessage({ id: "error404" }) : intl.formatMessage({ id: "error500" });

  return (
    <div className={styles.container}>
      <h1>{statusCode}</h1>
      <p>{message}</p>
    </div>
  );
};

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
