import React from "react";
import { useIntl } from "react-intl";
import styles from "../styles/blog.module.css";

const BlogPage = () => {
  const intl = useIntl();

  return (
    <div className={styles.container}>
      <h1>{intl.formatMessage({ id: "blogTitulo" })}</h1>
      <p>{intl.formatMessage({ id: "blogDescripcion" })}</p>
    </div>
  );
};

export default BlogPage;
