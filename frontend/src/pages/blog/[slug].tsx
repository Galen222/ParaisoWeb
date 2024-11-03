// frontend/src/pages/blog/[slug].tsx

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";
import Loader from "../../components/Loader";
import { useFetchBlogDetails } from "../../hooks/useFetchBlogDetails";
import { getBlogPostById } from "../../services/blogService";
import useScrollToTop from "../../hooks/useScrollToTop";
import ReactMarkdown from "react-markdown";
import errorStyles from "../../styles/error.module.css";
import blogDetailsStyles from "../../styles/blogDetails.module.css";
import type { ComponentType } from "react";
import ShareLink from "../../components/shareLink";

interface BlogDetailsPageProps {
  loadingMessages: boolean;
}

type BlogDetailsPageComponent = ComponentType<BlogDetailsPageProps> & { pageTitleText?: string };

const BlogDetailsPage: BlogDetailsPageComponent = ({ loadingMessages }: BlogDetailsPageProps) => {
  const router = useRouter();
  const { slug } = router.query;
  const intl = useIntl();
  const { isScrollButtonVisible, scrollToTop } = useScrollToTop();
  const [isPushingBack, setIsPushingBack] = useState(false); // Estado para animaciones

  // Usa el hook para obtener los detalles del post
  const { data: blogDetails, loadingBlogDetails, error } = useFetchBlogDetails(slug as string);

  // Maneja el cambio de idioma
  useEffect(() => {
    const handleLanguageChange = async () => {
      if (blogDetails) {
        const newIdioma = intl.locale;
        if (newIdioma !== blogDetails.idioma) {
          try {
            // Obtiene la noticia correspondiente en el nuevo idioma
            const newBlogPost = await getBlogPostById(blogDetails.id_noticia, newIdioma);
            if (newBlogPost) {
              // Redirige al usuario a la nueva URL con el slug correspondiente
              router.push(`/blog/${newBlogPost.slug}`);
            } else {
              // Opcional: Manejar el caso donde no existe la traducción
              // Por ejemplo, mostrar un mensaje o redirigir a una página por defecto
              console.warn("No se encontró la traducción de la noticia en el idioma seleccionado.");
            }
          } catch (err) {
            console.error("Error al cambiar de idioma:", err);
            // Opcional: Mostrar un mensaje de error al usuario
          }
        }
      }
    };

    handleLanguageChange();
  }, [intl.locale, blogDetails, router]);

  const handleBack = async () => {
    setIsPushingBack(true);
  };

  if (loadingMessages || loadingBlogDetails) {
    return <Loader />;
  }

  const imageFileName = "/images/web/error.png";

  if (error) {
    return (
      <div className={errorStyles.errorContainer}>
        <p className={errorStyles.errorText}>{error}</p>
        <div className={errorStyles.imageContainer}>
          <img src={imageFileName} alt="Error" />
        </div>
      </div>
    );
  }

  return (
    <div className={blogDetailsStyles.blogDetailsContainer}>
      {blogDetails && (
        <div>
          <div className="mt-25p">
            <h1 className={blogDetailsStyles.blogTitle}>{blogDetails.titulo}</h1>
          </div>
          <div className="mt-25p">
            <p className={blogDetailsStyles.blogAuthor}>
              {intl.formatMessage({ id: "blog_details_Autor" })} {blogDetails.autor}
            </p>
            <p className={blogDetailsStyles.blogDate}>
              {intl.formatMessage({ id: "blog_details_Publicado" })} {new Date(blogDetails.fecha_publicacion).toLocaleDateString()}
              {blogDetails.fecha_actualizacion &&
                ` | ${intl.formatMessage({ id: "blog_details_Actualizado" })} ${new Date(blogDetails.fecha_actualizacion).toLocaleDateString()}`}
            </p>
          </div>
          <div className="mt-25p">
            <ShareLink url={typeof window !== "undefined" ? window.location.href : ""} title={blogDetails.titulo} />
          </div>
          <div className="mt-25p">
            <img src={blogDetails.imagen_url} alt={blogDetails.titulo} className={blogDetailsStyles.blogImage} />
          </div>
          <div className={`mt-25p ${blogDetailsStyles.blogText}`}>
            <ReactMarkdown>{blogDetails.contenido}</ReactMarkdown>
          </div>
          <div className="mt-25p">
            {blogDetails.imagen_url_2 && <img src={blogDetails.imagen_url_2} alt={blogDetails.titulo} className={blogDetailsStyles.blogImage} />}
          </div>
          <div>
            <ShareLink url={typeof window !== "undefined" ? window.location.href : ""} title={blogDetails.titulo} />
          </div>
          <div className="text-center mt-25p">
            <Link href="/blog">
              <button
                className={`btn btn-outline-secondary mx-auto ${blogDetailsStyles.backButton} ${isPushingBack ? "animate-push" : ""}`}
                onAnimationEnd={() => setIsPushingBack(false)} // Resetea el estado de animación
                onClick={handleBack}
              >
                {intl.formatMessage({ id: "blog_Details_Boton" })} {/* Texto del botón */}
              </button>
            </Link>
          </div>
        </div>
      )}
      <div>
        {isScrollButtonVisible && (
          <button onClick={scrollToTop} className="scrollTop">
            <img src="/images/web/flechaArriba.png" alt="Subir" />
          </button>
        )}
      </div>
    </div>
  );
};

BlogDetailsPage.pageTitleText = "blog";

export default BlogDetailsPage;
