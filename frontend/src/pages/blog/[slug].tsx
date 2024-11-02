// frontend/src/pages/blog/[slug].tsx

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";
import Loader from "../../components/Loader";
import { getBlogPostBySlug, BlogPost } from "../../services/blogService";
import ReactMarkdown from "react-markdown";
import errorStyles from "../../styles/error.module.css";
import BlogStyles from "../../styles/blogDetail.module.css";

const BlogDetail: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const intl = useIntl();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBlogDetail = async () => {
      try {
        const idioma = intl.locale;
        const data = await getBlogPostBySlug(slug as string, idioma);
        setBlog(data);
      } catch {
        setError(intl.formatMessage({ id: "blog_Error" }));
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetail();
  }, [slug, intl.locale]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className={errorStyles.errorContainer}>
        <p className={errorStyles.errorText}>{error}</p>
      </div>
    );
  }

  if (!blog) {
    return <p>No se encontró el blog.</p>;
  }

  return (
    <div className={BlogStyles.blogDetailContainer}>
      <h1 className={BlogStyles.blogTitle}>{blog.titulo}</h1>
      <p className={BlogStyles.blogAuthor}>Por {blog.autor}</p>
      <p className={BlogStyles.blogDate}>
        Publicado: {new Date(blog.fecha_publicacion).toLocaleDateString()}
        {blog.fecha_actualizacion && ` | Actualizado: ${new Date(blog.fecha_actualizacion).toLocaleDateString()}`}
      </p>
      <img src={blog.imagen_url} alt={blog.titulo} className={BlogStyles.blogImage} />
      {blog.imagen_url_2 && <img src={blog.imagen_url_2} alt={blog.titulo} className={BlogStyles.blogImage} />}
      <div className={BlogStyles.blogContent}>
        <ReactMarkdown>{blog.contenido}</ReactMarkdown>
      </div>
    </div>
  );
};

export default BlogDetail;
